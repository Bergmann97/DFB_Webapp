/**
 * @fileOverview  The model class NationalTeam with attribute definitions and storage management methods
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 * @copyright Copyright 2013-2021 Gerd Wagner (Chair of Internet Technology) and Juan-Francisco Reyes, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */

import { db } from "../c/initialize.mjs";
import {createIsoDateString, isIntegerOrIntegerString, isNonEmptyString, handleUserMessage} from "../../lib/util.mjs";
import {
    NoConstraintViolation,
    MandatoryValueConstraintViolation,
    RangeConstraintViolation,
    UniquenessConstraintViolation,
    IntervalConstraintViolation
}
    from "../../lib/errorTypes.mjs";
import {GenderEL} from "./Person.mjs";

/**
 * Constructor function for the class NationalTeam
 */
class NationalTeam {
    // using a single record parameter with ES6 function parameter destructuring
    constructor({teamId, gender}) {
        // assign properties by invoking implicit setters
        this.teamId = teamId; // number (integer)
        this.gender = gender; // GenderEL
    };

    get teamId() {
        return this._teamId;
    };
    static checkTeamId(teamId) {
        if (!teamId) {
            return new NoConstraintViolation();  // may be optional as an IdRef
        } else {
            // convert to integer
            teamId = parseInt( teamId);
            if (isNaN( teamId) || !Number.isInteger( teamId) || teamId < 1) {
                return new RangeConstraintViolation("The Team ID must be a positive integer!");
            } else {
                return new NoConstraintViolation();
            }
        }
    };
    /*
       Checks ID uniqueness constraint against the direct type of a NationalTeam object
       */
    static async checkTeamIdAsId( teamId) {
        let validationResult = NationalTeam.checkTeamId( teamId);
        if ((validationResult instanceof NoConstraintViolation)) {
            if (!teamId) {
                validationResult = new MandatoryValueConstraintViolation(
                    "A value for the Team ID must be provided!");
            } else {
                let teamDocSn = await db.collection("nationalTeams").doc( teamId).get();
                if (teamDocSn.exists) {
                    validationResult = new UniquenessConstraintViolation(
                        "There is already a national team record with this Team ID!");
                } else {
                    validationResult = new NoConstraintViolation();
                }
            }
        }
        return validationResult;
    };

    set teamId( teamId) {
        const validationResult = NationalTeam.checkTeamId ( teamId);
        if (validationResult instanceof NoConstraintViolation) {
            this._teamId = teamId;
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
        const validationResult = NationalTeam.checkGender( g);
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
 *  Conversion between a NationalTeam object and a corresponding Firestore document
 */
NationalTeam.converter = {
    toFirestore: function (team) {
        const data = {
            teamId: team.teamId,
            gender: parseInt(team.gender)
        };
        return data;
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data( options);
        return new NationalTeam( data);
    }
};

/**
 *  Load a national team record
 */
NationalTeam.retrieve = async function (teamId) {
    try {
        const teamRec = (await db.collection("nationalTeams").doc( teamId)
            .withConverter( NationalTeam.converter).get()).data();
        console.log(`National team record (Team ID: "${teamRec.teamId}") retrieved.`);
        return teamRec;
    } catch (e) {
        console.error(`Error retrieving national team record: ${e}`);
    }
};

/**
 *  Load all national team records
 */
NationalTeam.retrieveAll = async function () {
    let teamsCollRef = db.collection("nationalTeams");
    try {
        const teamRecords = (await teamsCollRef.withConverter( NationalTeam.converter)
            .get()).docs.map( d => d.data());
        return teamRecords;
    } catch (e) {
        console.error(`Error retrieving national team records: ${e}`);
    }
};

/**
 *  Create a new national team record
 */
NationalTeam.add = async function (slots) {
    let team = null;
    try {
        team = new NationalTeam(slots);
        let validationResult = await NationalTeam.checkTeamIdAsId( team.teamId);
        if (!validationResult instanceof NoConstraintViolation) {
            throw validationResult;
        }
    } catch( e) {
        console.error(`${e.constructor.name}: ${e.message}`);
        team = null;
    }
    if (team) {
        try {
            const teamDocRef = db.collection("nationalTeams").doc( team.teamId);
            await teamDocRef.withConverter( NationalTeam.converter).set( team);
            console.log(`National team record (Team ID: "${team.teamId}") created.`);
        } catch (e) {
            console.error(`${e.constructor.name}: ${e.message} + ${e}`);
        }
    }
};

/**
 *  Update an existing national team record
 */
NationalTeam.update = async function (slots) {
    var noConstraintViolated = true,
        updatedSlots = {},
        validationResult = null;
    const teamDocRef = db.collection("nationalTeams").doc( slots.teamId);
    try {
        const teamDocSns = await teamDocRef.withConverter( NationalTeam.converter).get();
        const teamBeforeUpdate = teamDocSns.data();
        if (teamBeforeUpdate.gender !== parseInt(slots.gender)) {
            validationResult = NationalTeam.checkGender( slots.gender);
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
            await teamDocRef.update( updatedSlots);
            console.log(`Property(ies) "${updatedProperties.toString()}" modified for national team record (Team ID: "${slots.teamId}"`);
        } else {
            console.log(`No property value changed for national team record (Team ID: "${slots.teamId}")!`);
        }
    }
};

/**
 *  Delete a national team record
 */
NationalTeam.destroy = async function (teamId) {
    try {
        await db.collection("nationalTeams").doc( teamId).delete();
        console.log(`National team record (Team ID: "${teamId}") deleted.`);
    } catch( e) {
        console.error(`Error when deleting national team record: ${e}`);
        return;
    }
};

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
// Create test data
NationalTeam.generateTestData = async function () {
    try {
        let teamRecords = [
            {
                teamId: "1",
                gender: GenderEL.M
            },
            {
                teamId: "2",
                gender: GenderEL.F
            }
        ];
        console.log('Generating test data...');
        await Promise.all( teamRecords.map( d => NationalTeam.add( d)));

        console.log(`${teamRecords.length} national teams saved.`);
    } catch (e) {
        console.error(`${e.constructor.name}: ${e.message}`);
    }
};
// Clear test data
NationalTeam.clearData = async function () {
    if (confirm("Do you really want to delete all national team records?")) {
        console.log('Clearing test data...');

        let teamsCollRef = db.collection("nationalTeams");

        try {
            const teamDocSns = (await teamsCollRef.withConverter( NationalTeam.converter)
                .get()).docs;

            await Promise.all( teamDocSns.map(
                teamDocSn => NationalTeam.destroy( teamDocSn.id)
            ));
            console.log(`${teamDocSns.length} national teams deleted.`);
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
NationalTeam.syncDBwithUI = async function (teamId) {
    try {
        let teamDocRef = db.collection("nationalTeams").doc( teamId);
        let originalTeamDocSn = await teamDocRef.get();
        // listen document changes returning a snapshot on every change
        return teamDocRef.onSnapshot( teamDocSn => {
            // identify if changes are local or remote
            if (!teamDocSn.metadata.hasPendingWrites) {
                if (!teamDocSn.data()) {
                    handleUserMessage("removed", originalTeamDocSn.data());
                } else if (!teamDocSn.isEqual( originalTeamDocSn)) {
                    handleUserMessage("modified", teamDocSn.data());
                }
            }
        });
    } catch (e) {
        console.error(`${e.constructor.name} : ${e.message}`);
    }
}

export default NationalTeam;

