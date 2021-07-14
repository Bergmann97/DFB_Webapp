/**
 * @fileOverview  The model class FootballAssociation with attribute definitions and storage management methods
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 * @copyright Copyright 2013-2021 Gerd Wagner (Chair of Internet Technology) and Juan-Francisco Reyes, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */

import { db } from "../c/initialize.mjs";
import {isNonEmptyString, handleUserMessage} from "../../lib/util.mjs";
import {
    NoConstraintViolation,
    MandatoryValueConstraintViolation,
    RangeConstraintViolation,
    UniquenessConstraintViolation,
}
    from "../../lib/errorTypes.mjs";

/**
 * Constructor function for the class FootballAssociation
 */
class FootballAssociation {
    // using a single record parameter with ES6 function parameter destructuring
    constructor({assoId, name}) {
        // assign properties by invoking implicit setters
        this.assoId = assoId; // number (integer)
        this.name = name; // string
    };

    get assoId() {
        return this._assoId;
    };
    static checkAssoId(assoId) {
        if (!assoId) {
            return new NoConstraintViolation();  // may be optional as an IdRef
        } else {
            // convert to integer
            assoId = parseInt( assoId);
            if (isNaN( assoId) || !Number.isInteger( assoId) || assoId < 1) {
                return new RangeConstraintViolation("The association ID must be a positive integer!");
            } else {
                return new NoConstraintViolation();
            }
        }
    };
    /*
       Checks ID uniqueness constraint against the direct type of a FootballAssociation object
       */
    static async checkAssoIdAsId( assoId) {
        let validationResult = FootballAssociation.checkAssoId( assoId);
        if ((validationResult instanceof NoConstraintViolation)) {
            if (!assoId) {
                validationResult = new MandatoryValueConstraintViolation(
                    "A value for the Association ID must be provided!");
            } else {
                let assoDocSn = await db.collection("associations").doc( assoId).get();
                if (assoDocSn.exists) {
                    validationResult = new UniquenessConstraintViolation(
                        "There is already a football association record with this Association ID!");
                } else {
                    validationResult = new NoConstraintViolation();
                }
            }
        }
        return validationResult;
    };

    set assoId( assoId) {
        const validationResult = FootballAssociation.checkAssoId ( assoId);
        if (validationResult instanceof NoConstraintViolation) {
            this._assoId = assoId;
        } else {
            throw validationResult;
        }
    };

    get name() {
        return this._name;
    };
    static checkName(n) {
        if (!n) {
            return new MandatoryValueConstraintViolation
            ("A name must be provided!");
        } else if (!isNonEmptyString(n)) {
            return new RangeConstraintViolation
            ("The name must be a non-empty string!");
        } else {
            return new NoConstraintViolation();
        }
    };
    set name( n) {
        const validationResult = FootballAssociation.checkName( n);
        if (validationResult instanceof NoConstraintViolation) {
            this._name = n;
        } else {
            throw validationResult;
        }
    };

}
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/

/**
 *  Conversion between a FootballAssociation object and a corresponding Firestore document
 */
FootballAssociation.converter = {
    toFirestore: function (asso) {
        const data = {
            assoId: asso.assoId,
            name: asso.name
        };
        return data;
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data( options);
        return new FootballAssociation( data);
    }
};

/**
 *  Load a football association record
 */
// Load a football association record from Firestore
FootballAssociation.retrieve = async function (assoId) {
    try {
        const assoRec = (await db.collection("associations").doc( assoId)
            .withConverter( FootballAssociation.converter).get()).data();
        console.log(`Football Association record (Association ID: "${assoRec.assoId}") retrieved.`);
        return assoRec;
    } catch (e) {
        console.error(`Error retrieving football association record: ${e}`);
    }
};

/**
 *  Load all football association records
 */
FootballAssociation.retrieveAll = async function (order) {
    let assosCollRef = db.collection("associations");
    try {
        if (order) assosCollRef = assosCollRef.orderBy( order);
        const assoRecords = (await assosCollRef.withConverter( FootballAssociation.converter)
            .get()).docs.map( d => d.data());
        console.log(`${assoRecords.length} football association records retrieved ${order ? "ordered by " + order : ""}`);
        return assoRecords;
    } catch (e) {
        console.error(`Error retrieving football association records: ${e}`);
    }
};


/**
 *  Create a new football association record
 */
FootballAssociation.add = async function (slots) {
    let asso = null;
    try {
        asso = new FootballAssociation(slots);
        let validationResult = await FootballAssociation.checkAssoIdAsId( asso.assoId);
        if (!validationResult instanceof NoConstraintViolation) {
            throw validationResult;
        }
    } catch( e) {
        console.error(`${e.constructor.name}: ${e.message}`);
        asso = null;
    }
    if (asso) {
        try {
            const assoDocRef = db.collection("associations").doc( asso.assoId);
            await assoDocRef.withConverter( FootballAssociation.converter).set( asso);
            console.log(`Football association record (Association ID: "${asso.assoId}") created.`);
        } catch (e) {
            console.error(`${e.constructor.name}: ${e.message} + ${e}`);
        }
    }
};

/**
 *  Update an existing football association record
 */
FootballAssociation.update = async function (slots) {
    var noConstraintViolated = true,
        updatedSlots = {},
        validationResult = null;
    const assoDocRef = db.collection("associations").doc( slots.assoId);
    try {
        const assoDocSns = await assoDocRef.withConverter( FootballAssociation.converter).get();
        const assoBeforeUpdate = assoDocSns.data();
        if (assoBeforeUpdate.name !== slots.name) {
            validationResult = FootballAssociation.checkName( slots.name);
            if (validationResult instanceof NoConstraintViolation) {
                updatedSlots.name = slots.name;
            } else {
                throw validationResult;
            }
        }
    } catch (e) {
        console.log(`${e.constructor.name}: ${e.message}`);
        noConstraintViolated = false;
    }
    let updatedProperties = Object.keys( updatedSlots);
    if (noConstraintViolated) {
        if (updatedProperties.length > 0) {
            await assoDocRef.update( updatedSlots);
            console.log(`Property(ies) "${updatedProperties.toString()}" modified for football association record (association ID: "${slots.assoId}"`);
        } else {
            console.log(`No property value changed for football association record (association ID: "${slots.assoId}")!`);
        }
    }
};

/**
 *  Delete a football association record
 */
FootballAssociation.destroy = async function (assoId) {
    try {
        await db.collection("associations").doc( assoId).delete();
        console.log(`Football association record (Association ID: "${assoId}") deleted.`);
    } catch( e) {
        console.error(`Error when deleting football association record: ${e}`);
        return;
    }
};

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
// Create test data
FootballAssociation.generateTestData = async function () {
    try {
        console.log('Generating test data...');
        const response = await fetch( "../../test-data/associations.json");
        const assoRecords = await response.json();
        await Promise.all( assoRecords.map( d => FootballAssociation.add( d)));

        console.log(`${assoRecords.length} football associations saved.`);
    } catch (e) {
        console.error(`${e.constructor.name}: ${e.message}`);
    }

};
// Clear test data
FootballAssociation.clearData = async function () {
    if (confirm("Do you really want to delete all football association records?")) {
        console.log('Clearing test data...');

        let assosCollRef = db.collection("associations");

        try {
            const assoDocSns = (await assosCollRef.withConverter( FootballAssociation.converter)
                .get()).docs;

            await Promise.all( assoDocSns.map(
                assoDocSn => FootballAssociation.destroy( assoDocSn.id)
            ));
            console.log(`${assoDocSns.length} football associations deleted.`);
        } catch (e) {
            console.error(`${e.constructor.name}: ${e.message}`);
        }
    }
};

/*******************************************
 *** Non specific use case procedures ******
 ********************************************/
/**
 * Handle DB-UI synchronization
 */
FootballAssociation.syncDBwithUI = async function (assoId) {
    try {
        let assoDocRef = db.collection("associations").doc( assoId);
        let originalAssoDocSn = await assoDocRef.get();
        // listen document changes returning a snapshot on every change
        return assoDocRef.onSnapshot( assoDocSn => {
            // identify if changes are local or remote
            if (!assoDocSn.metadata.hasPendingWrites) {
                if (!assoDocSn.data()) {
                    handleUserMessage("removed", originalAssoDocSn.data());
                } else if (!assoDocSn.isEqual( originalAssoDocSn)) {
                    handleUserMessage("modified", assoDocSn.data());
                }
            }
        });
    } catch (e) {
        console.error(`${e.constructor.name} : ${e.message}`);
    }
}

export default FootballAssociation;

