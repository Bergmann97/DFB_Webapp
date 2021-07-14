/**
 * @fileOverview  The model class FootballClub with attribute definitions and storage management methods
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 * @copyright Copyright 2013-2021 Gerd Wagner (Chair of Internet Technology) and Juan-Francisco Reyes, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */

import { db } from "../c/initialize.mjs";
import {isIntegerOrIntegerString, isNonEmptyString, handleUserMessage} from "../../lib/util.mjs";
import {
    NoConstraintViolation,
    MandatoryValueConstraintViolation,
    RangeConstraintViolation,
    UniquenessConstraintViolation,
}
    from "../../lib/errorTypes.mjs";
import {GenderEL} from "./Person.mjs";
import FootballAssociation from "./FootballAssociation.mjs";

/**
 * Constructor function for the class FootballClub
 */
class FootballClub {
    // using a single record parameter with ES6 function parameter destructuring
    constructor({clubId, name, gender}) {
        // assign properties by invoking implicit setters
        this.clubId = clubId; // number (integer)
        this.name = name; // string
        this.gender = gender; // GenderEL
    };

    get clubId() {
        return this._clubId;
    };
    static checkClubId(clubId) {
        if (!clubId) {
            return new NoConstraintViolation();  // may be optional as an IdRef
        } else {
            // convert to integer
            clubId = parseInt( clubId);
            if (isNaN( clubId) || !Number.isInteger( clubId) || clubId < 1) {
                return new RangeConstraintViolation("The Club ID must be a positive integer!");
            } else {
                return new NoConstraintViolation();
            }
        }
    };
    /*
       Checks ID uniqueness constraint against the direct type of a FootballClub object
       */
    static async checkClubIdAsId( clubId) {
        let validationResult = FootballClub.checkClubId( clubId);
        if ((validationResult instanceof NoConstraintViolation)) {
            if (!clubId) {
                validationResult = new MandatoryValueConstraintViolation(
                    "A value for the Club ID must be provided!");
            } else {
                let clubDocSn = await db.collection("clubs").doc( clubId).get();
                if (clubDocSn.exists) {
                    validationResult = new UniquenessConstraintViolation(
                        "There is already a football club record with this Club ID!");
                } else {
                    validationResult = new NoConstraintViolation();
                }
            }
        }
        return validationResult;
    };

    set clubId( clubId) {
        const validationResult = FootballClub.checkClubId ( clubId);
        if (validationResult instanceof NoConstraintViolation) {
            this._clubId = clubId;
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
        const validationResult = FootballClub.checkName( n);
        if (validationResult instanceof NoConstraintViolation) {
            this._name = n;
        } else {
            throw validationResult;
        }
    };

    get gender() {
        return this._gender;
    };
    static checkGender(g) {
        if (!g) {
            return new MandatoryValueConstraintViolation(
                "A value for the gender must be provided!"
            );
        } else if (!isIntegerOrIntegerString(g) ||
            parseInt(g) < 1 || parseInt(g) > GenderEL.MAX) {
            return new RangeConstraintViolation(
                `Invalid value for gender: ${g}`);
        } else {
            return new NoConstraintViolation();
        }
    };
    set gender(g) {
        const validationResult = FootballClub.checkGender( g);
        if (validationResult instanceof NoConstraintViolation) {
            this._gender = parseInt( g);
        } else {
            throw validationResult;
        }
    };

}
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/

/**
 *  Conversion between a FootballClub object and a corresponding Firestore document
 */
FootballClub.converter = {
    toFirestore: function (club) {
        const data = {
            clubId: club.clubId,
            name: club.name,
            gender: parseInt(club.gender)
        };
        return data;
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data( options);
        return new FootballClub( data);
    }
};

/**
 *  Load a football club record
 */
FootballClub.retrieve = async function (clubId) {
    try {
        const clubRec = (await db.collection("clubs").doc( clubId)
            .withConverter( FootballClub.converter).get()).data();
        console.log(`Football club record (Club ID: "${clubRec.clubId}") retrieved.`);
        return clubRec;
    } catch (e) {
        console.error(`Error retrieving football club record: ${e}`);
    }
};

/**
 *  Load all football club records
 */
FootballClub.retrieveAll = async function (order) {
    let clubsCollRef = db.collection("clubs");
    try {
        if (order) clubsCollRef = clubsCollRef.orderBy( order);
        const clubRecords = (await clubsCollRef.withConverter( FootballClub.converter)
            .get()).docs.map( d => d.data());
        console.log(`${clubRecords.length} football club records retrieved ${order ? "ordered by " + order : ""}`);
        return clubRecords;
    } catch (e) {
        console.error(`Error retrieving football club records: ${e}`);
    }
};

/**
 *  Create a new football club record
 */
FootballClub.add = async function (slots) {
    let club = null;
    try {
        club = new FootballClub(slots);
        let validationResult = await FootballClub.checkClubIdAsId( club.clubId);
        if (!validationResult instanceof NoConstraintViolation) {
            throw validationResult;
        }
    } catch( e) {
        console.error(`${e.constructor.name}: ${e.message}`);
        club = null;
    }
    if (club) {
        try {
            const clubDocRef = db.collection("clubs").doc( club.clubId);
            await clubDocRef.withConverter( FootballClub.converter).set( club);
            console.log(`Football club record (Club ID: "${club.clubId}") created.`);
        } catch (e) {
            console.error(`${e.constructor.name}: ${e.message} + ${e}`);
        }
    }
};

/**
 *  Update an existing football club record
 */
FootballClub.update = async function (slots) {
    var noConstraintViolated = true,
        updatedSlots = {},
        validationResult = null;
    const clubDocRef = db.collection("clubs").doc( slots.clubId);
    try {
        const clubDocSns = await clubDocRef.withConverter( FootballClub.converter).get();
        const clubBeforeUpdate = clubDocSns.data();
        if (clubBeforeUpdate.name !== slots.name) {
            validationResult = FootballClub.checkName( slots.name);
            if (validationResult instanceof NoConstraintViolation) {
                updatedSlots.name = slots.name;
            } else {
                throw validationResult;
            }
        }
        if (clubBeforeUpdate.gender !== parseInt(slots.gender)) {
            validationResult = FootballClub.checkGender( slots.gender);
            if (validationResult instanceof NoConstraintViolation) {
                updatedSlots.gender = parseInt(slots.gender);
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
            await clubDocRef.update( updatedSlots);
            console.log(`Property(ies) "${updatedProperties.toString()}" modified for football club record (Club ID: "${slots.clubId}")`);
        } else {
            console.log(`No property value changed for football club record (Club ID: "${slots.clubId}")!`);
        }
    }
};

/**
 *  Delete a football club record
 */
FootballClub.destroy = async function (clubId) {
    try {
        await db.collection("clubs").doc( clubId).delete();
        console.log(`Football club record (Club ID: "${clubId}") deleted.`);
    } catch( e) {
        console.error(`Error when deleting football club record: ${e}`);
        return;
    }
};

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
// Create test data
FootballClub.generateTestData = async function () {
    try {
        console.log('Generating test data...');
        const response = await fetch( "../../test-data/clubs.json");
        const clubRecords = await response.json();
        await Promise.all( clubRecords.map( d => FootballClub.add( d)));

        console.log(`${clubRecords.length} football clubs saved.`);
    } catch (e) {
        console.error(`${e.constructor.name}: ${e.message}`);
    }
};
// Clear test data
FootballClub.clearData = async function () {
    if (confirm("Do you really want to delete all football club records?")) {
        console.log('Clearing test data...');

        let clubsCollRef = db.collection("clubs");

        try {
            const clubDocSns = (await clubsCollRef.withConverter( FootballClub.converter)
                .get()).docs;

            await Promise.all( clubDocSns.map(
                clubDocSn => FootballClub.destroy( clubDocSn.id)
            ));
            console.log(`${clubDocSns.length} football clubs deleted.`);
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
FootballClub.syncDBwithUI = async function (clubId) {
    try {
        let clubDocRef = db.collection("clubs").doc( clubId);
        let originalClubDocSn = await clubDocRef.get();
        // listen document changes returning a snapshot on every change
        return clubDocRef.onSnapshot( clubDocSn => {
            // identify if changes are local or remote
            if (!clubDocSn.metadata.hasPendingWrites) {
                if (!clubDocSn.data()) {
                    handleUserMessage("removed", originalClubDocSn.data());
                } else if (!clubDocSn.isEqual( originalClubDocSn)) {
                    handleUserMessage("modified", clubDocSn.data());
                }
            }
        });
    } catch (e) {
        console.error(`${e.constructor.name} : ${e.message}`);
    }
}

export default FootballClub;

