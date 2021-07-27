/**
 * @fileOverview  The model class Player with attribute definitions and storage management methods
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 * @copyright Copyright 2013-2021 Gerd Wagner (Chair of Internet Technology) and Juan-Francisco Reyes, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import Person, {GenderEL, PersonTypeEL} from "./Person.mjs";
import FootballClub from "./FootballClub.mjs";
import {cloneObject, dateToTimestamp, handleUserMessage, isNonEmptyString, timestampToDate} from "../../lib/util.mjs";
import {
    MandatoryValueConstraintViolation,
    NoConstraintViolation, RangeConstraintViolation,
    ReferentialIntegrityConstraintViolation, UniquenessConstraintViolation
} from "../../lib/errorTypes.mjs";
import { db } from "../c/initialize.mjs";

/**
 * Constructor function for the class Player
 * @class
 */
class Player extends Person {
    // using a single record parameter with ES6 function parameter destructuring
    // constructor ({personId, name, dateOfBirth, gender, type, assoClub, assoClub_id}) {
    constructor ({personId, name, dateOfBirth, gender, type, assoClub, assoClub_id}) {
        super({personId, name, dateOfBirth, gender, type});  // invoke Person constructor
        // assign additional properties
        // this.assoClub = assoClub;
        // if (assoClub || assoClub_id) {
        this.assoClub = assoClub || assoClub_id;
        // }
        // derived inverse reference property (inverse of FootballClub::players)
        // this._playedClubs = {};  // initialize as an empty map of Movie objects
    }

    static async checkPersonIdAsIdRef ( personId) {
        var validationResult = Player.checkPersonId( personId);
        if ((validationResult instanceof NoConstraintViolation)) {
            if (!personId) {
                validationResult = new MandatoryValueConstraintViolation(
                    "A value for the Person ID must be provided!");
            } else {
                let playerDocSn = await db.collection("players").doc( personId).get();
                if (!playerDocSn.exists) {
                    validationResult = new UniquenessConstraintViolation(
                        `There is no player record with this Person ID "${personId}"!`);
                } else {
                    validationResult = new NoConstraintViolation();
                }
            }
        }
        return validationResult;
    };
    // get playedClubs() {
    //     return this._playedClubs;
    // }


    get assoClub() {
        return this._assoClub;
    }
    static async checkAssoClub(assoClub_id) {
        var validationResult = null;
        if (!assoClub_id) {
            validationResult = new MandatoryValueConstraintViolation(
                "A value for the associated club must be provided!");
        } else {
            // invoke foreign key constraint check
            validationResult = await FootballClub.checkClubIdAsIdRef( String(assoClub_id));
        }
        return validationResult;
    }
    set assoClub(ac) {
        this._assoClub = ac;
        // if (!assoClub) {  // the assoClub reference is to be deleted
        //     // delete the corresponding inverse reference from FootballClub::clubPlayers
        //     delete this._assoClub.clubPlayers[this._personId];
        //     // unset the assoClub property
        //     delete this._assoClub;
        // } else {
        //     // assoClub can be an ID reference or an object reference
        //     const assoClub_id = (typeof assoClub !== "object") ? assoClub : assoClub.clubId;
        //     // const constraintViolation = Player.checkAssoClub(assoClub_id);
        //     // console.log("[Player.checkAssoClub] constraintViolation: " + constraintViolation.then(value => value));
        //     // if (constraintViolation instanceof NoConstraintViolation) {
        //
        //     if (this._assoClub) {
        //         // delete the obsolete inverse reference in FootballClub::clubPlayers
        //         delete this._assoClub.clubPlayers[this._personId];
        //     }
        //
        //     // create the new assoClub reference
        //     // this._assoClub = db.collection("clubs").where("array-contains", parseInt( assoClub_id));
        //     this._assoClub = db.collection("clubs").doc(String(assoClub_id)).get();
        //     console.log("this._assoClub: " + this._assoClub);
        //
        //     console.log(this._assoClub.clubPlayers);
        //     // add the new inverse reference to FootballClub::clubPlayers
        //     this._assoClub.clubPlayers[this._personId] = this;
        //     // } else {
        //     //     throw constraintViolation;
        //     // }
        // }

        // const constraintViolation = Player.checkAssoClub( assoClub);
        // if (constraintViolation instanceof NoConstraintViolation) {
        //     this._assoClub = assoClub;
        // } else {
        //     throw constraintViolation;
        // }
    }

}
/***********************************************
 *** Class-level ("static") properties **********
 ************************************************/
// initially an empty collection (in the form of a map)
// Player.instances = {};
// add Player to the list of Person subtypes
// Person.subtypes.push( Player);

/*********************************************************
 *** Class-level ("static") storage management methods ****
 **********************************************************/
/**
 *  Conversion between a Player object and a corresponding Firestore document
 */
Player.converter = {
    toFirestore: function (player) {
        const data = {
            personId: player.personId,
            name: player.name,
            dateOfBirth: dateToTimestamp(player.dateOfBirth),
            gender: parseInt(player.gender),
            type: player.type,
            assoClub_id: player.assoClub
        };
        return data;
    },
    fromFirestore: function (snapshot, options) {
        const player = snapshot.data( options);
        const data = {
            personId: player.personId,
            name: player.name,
            dateOfBirth: timestampToDate( player.dateOfBirth),
            gender: parseInt(player.gender),
            type: player.type,
            assoClub : player.assoClub_id
        };
        return new Player( data);
    }
};

// Load a player record from Firestore
Player.retrieve = async function (personId) {
    try {
        const playerRec = (await db.collection("players").doc( personId)
            .withConverter( Player.converter).get()).data();
        console.log(`Player record "${playerRec.personId}" retrieved.`);
        return playerRec;
    } catch (e) {
        console.error(`Error retrieving player record: ${e}`);
    }
};

// Load all player records from Firestore
Player.retrieveAll = async function (order) {
    let playersCollRef = db.collection("players");
    try {
        if (order) playersCollRef = playersCollRef.orderBy( order);
        const playerRecords = (await playersCollRef.withConverter( Player.converter)
            .get()).docs.map( d => d.data());
        console.log(`${playerRecords.length} player records retrieved ${order ? "ordered by " + order : ""}`);
        return playerRecords;
    } catch (e) {
        console.error(`Error retrieving player records: ${e}`);
    }
};

/**
 * Retrieve block of player records
 */
Player.retrieveBlock = async function (params) {
    try {
        let playersCollRef = db.collection("players");
        // set limit and order in query
        playersCollRef = playersCollRef.limit( 11);
        if (params.order) playersCollRef = playersCollRef.orderBy( params.order);
        // set pagination 'startAt' cursor
        if (params.cursor) {
            if (params.order === "dateOfBirth") {
                playersCollRef = playersCollRef.startAt( dateToTimestamp( params.cursor));
            }
            else playersCollRef = playersCollRef.startAt( params.cursor);
        }
        const playerRecords = (await playersCollRef.withConverter( Player.converter)
            .get()).docs.map( d => d.data());
        console.log(`Block of player records retrieved! (cursor: ${playerRecords[0][params.order]})`);
        return playerRecords;
    } catch (e) {
        console.error(`Error retrieving all player records: ${e}`);
    }
};

// Player.retrieveAll = async function () {
//     let playersCollRef = db.collection("players");
//     try {
//         const playerRecords = (await playersCollRef.withConverter( Player.converter)
//             .get()).docs.map( d => d.data());
//         console.log(`${playerRecords.length} player records retrieved.`);
//         return playerRecords;
//     } catch (e) {
//         console.error(`Error retrieving player records: ${e}`);
//     }
// };

// Create a Firestore document in the Firestore collection "players"
Player.add = async function (slots) {
    var validationResult = null,
        player = null;
    // const personsCollRef = db.collection("persons"),
    //     personDocRef = personsCollRef.doc( slots.personId);
    try {
        player = new Player(slots);
        validationResult = await Player.checkPersonIdAsId( player.personId);
        if (!validationResult instanceof NoConstraintViolation) {
            throw validationResult;
        }
        const playerDocRef = db.collection("players").doc( player.personId);
        await playerDocRef.withConverter( Player.converter).set( player);
        console.log(`Player record (Person ID: "${player.personId}") created!`);
        // await personDocRef.set( slots);
    } catch( e) {
        console.error(`${e.constructor.name}: ${e.message}`);
        // person = null;
    }
    // try {
    //     player = new Player(slots);
    //
    //     let validationResult = await Person.checkPersonId( player.personId);
    //     if (!validationResult instanceof NoConstraintViolation) {
    //         throw validationResult;
    //     }
    // } catch( e) {
    //     console.error(`${e.constructor.name}: ${e.message}`);
    //     player = null;
    // }
    // if (player) {
    //     try {
    //         const playerDocRef = db.collection("players").doc( player.personId);
    //         await playerDocRef.withConverter( Player.converter).set( player);
    //         console.log(`Player record "${player.personId}" created.`);
    //     } catch (e) {
    //         console.error(`${e.constructor.name}: ${e.message} + ${e}`);
    //     }
    // }
};
// Update a Firestore document in the Firestore collection "players"
Player.update = async function (slots) {
    const updatedSlots = {};
    let validationResult = null,
        playerRec = null,
        playerDocRef = null;

    // const playerDocRef = db.collection("players").doc( slots.personId);
    try {
        playerDocRef = db.collection("players").doc(slots.personId);
        const playerDocSn = await playerDocRef.withConverter(Player.converter).get();
        playerRec = playerDocSn.data();
    } catch (e) {
        console.error(`${e.constructor.name}: ${e.message}`);
    }

    try {
        // const playerDocSns = await playerDocRef.withConverter( Player.converter).get();
        // const playerBeforeUpdate = playerDocSns.data();

        if (playerRec.name !== slots.name) {
            validationResult = Player.checkName( slots.name);
            if (validationResult instanceof NoConstraintViolation) {
                updatedSlots.name = slots.name;
            } else {
                throw validationResult;
            }
        }

        // if (playerBeforeUpdate.name !== slots.name) {
        //     validationResult = Person.checkName( slots.name);
        //     if (validationResult instanceof NoConstraintViolation) {
        //         updatedSlots.name = slots.name;
        //     } else {
        //         throw validationResult;
        //     }
        // }

        if (playerRec.dateOfBirth !== slots.dateOfBirth) {
            validationResult = Player.checkDateOfBirth( slots.dateOfBirth);
            if (validationResult instanceof NoConstraintViolation) {
                updatedSlots.dateOfBirth = dateToTimestamp(slots.dateOfBirth);
            } else {
                throw validationResult;
            }
        }
        if (playerRec.gender !== parseInt(slots.gender)) {
            validationResult = Player.checkGender( slots.gender);
            if (validationResult instanceof NoConstraintViolation) {
                updatedSlots.gender = parseInt(slots.gender);
            } else {
                throw validationResult;
            }
        }
        if (!playerRec.type.isEqualTo(slots.type)) {
            validationResult = Player.checkTypes( slots.type);
            if (validationResult instanceof NoConstraintViolation) {
                updatedSlots.type = slots.type;
            } else {
                throw validationResult;
            }
        }
        if (slots.assoClub && playerRec.assoClub !== parseInt(slots.assoClub)) {
            validationResult = await Player.checkAssoClub( slots.assoClub);
            if (validationResult instanceof NoConstraintViolation) {
                updatedSlots.assoClub = parseInt(slots.assoClub);
            } else {
                throw validationResult;
            }
        } else if (!parseInt(slots.assoClub) && playerRec.assoClub !== undefined) {
            updatedSlots.assoClub = firebase.firestore.FieldValue.delete();
        }
    } catch (e) {
        console.log(`${e.constructor.name}: ${e.message}`);
    }
    let updatedProperties = Object.keys( updatedSlots);
    // if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
        await playerDocRef.withConverter( Player.converter).update( updatedSlots);
        console.log(`Property(ies) "${updatedProperties.toString()}" modified for player record (Person ID: "${slots.personId}")`);
    } else {
        console.log(`No property value changed for player record (Person ID: "${slots.personId}")!`);
    }
    // }
};

// Delete a Firestore document in the Firestore collection "players"
Player.destroy = async function (personId) {
    try {
        // const playerRec = await Player.retrieve( personId);
        // const clubRec = await FootballClub.retrieveAll();

        const clubsCollRef = db.collection("clubs"),
            playersCollRef = db.collection("players"),
            clubQrySn = clubsCollRef.where("assoClub", "==", parseInt(personId)),
            associatedClubDocSns = (await clubQrySn.get()).docs,
            playerDocRef = playersCollRef.doc( personId);

        // initiate batch write
        const batch = db.batch();
        for (const ac of associatedClubDocSns) {
            const playerDocRef = playersCollRef.doc( ac.id);
            // remove associated personId from each football club record
            batch.update( playerDocRef, {
                assoClub: firebase.firestore.FieldValue.delete()
            });
        }
        // delete player record
        batch.delete( playerDocRef);
        batch.commit(); // finish batch write
        console.log(`Player record (Person ID: "${personId}") deleted!`);
    } catch (e) {
        console.error(`Error deleting player record: ${e}`);
    }

    // if (playerRec.assoClub) {
    //     // remove inverse reference from movie.director
    //     delete playerRec.assoClub.clubPlayers[personId];
    // }

    // // delete all dependent football club records
    // for (const clubId of Object.keys( playerRec.playedClubs)) {
    //     let club = playerRec.playedClubs[clubId];
    //     if (club.players[personId]) delete club.players[personId];
    // }

    //     await db.collection("players").doc( personId).delete();
    //     console.log(`Player record with person ID '${personId}' deleted.`);
    //
    // } catch( e) {
    //     console.error(`Error when deleting player record: ${e}`);
    //     return;
    // }

};

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
// Create test data
Player.generateTestData = async function () {
    try {
        // let playerRecords = [
        //     {
        //         personId: "1",
        //         name: "Manuel Neuer",
        //         dateOfBirth: "1986-03-27",
        //         gender: GenderEL.M,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 1
        //     },
        //     {
        //         personId: "2",
        //         name: "Antonio Rudiger",
        //         dateOfBirth: "1993-03-03",
        //         gender: GenderEL.M,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 1
        //     },
        //     {
        //         personId: "3",
        //         name: "Marcel Halstenberg",
        //         dateOfBirth: "1991-09-27",
        //         gender: GenderEL.M,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 1
        //     },
        //     {
        //         personId: "4",
        //         name: "Matthias Ginter",
        //         dateOfBirth: "1994-01-19",
        //         gender: GenderEL.M,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 1
        //     },
        //     {
        //         personId: "5",
        //         name: "Mats Hummels",
        //         dateOfBirth: "1988-12-16",
        //         gender: GenderEL.M,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 1
        //     },
        //     {
        //         personId: "6",
        //         name: "Joshua Kimmich",
        //         dateOfBirth: "1995-02-08",
        //         gender: GenderEL.M,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 1
        //     },
        //     {
        //         personId: "7",
        //         name: "Kai Havertz",
        //         dateOfBirth: "1999-06-11",
        //         gender: GenderEL.M,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 1
        //     },
        //     {
        //         personId: "8",
        //         name: "Toni Kroos",
        //         dateOfBirth: "1990-01-04",
        //         gender: GenderEL.M,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 1
        //     },
        //     {
        //         personId: "9",
        //         name: "Kevin Volland",
        //         dateOfBirth: "1992-07-30",
        //         gender: GenderEL.M,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 1
        //     },
        //     {
        //         personId: "10",
        //         name: "Serge Gnabry",
        //         dateOfBirth: "1995-07-14",
        //         gender: GenderEL.M,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 1
        //     },
        //     {
        //         personId: "11",
        //         name: "Timo Werner",
        //         dateOfBirth: "1996-03-06",
        //         gender: GenderEL.M,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 1
        //     },
        //     {
        //         personId: "13",
        //         name: "Merle Frohms",
        //         dateOfBirth: "1995-01-28",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 2
        //     },
        //     {
        //         personId: "14",
        //         name: "Sophia Kleinherne",
        //         dateOfBirth: "2000-04-12",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 2
        //     },
        //     {
        //         personId: "15",
        //         name: "Jana Feldkamp",
        //         dateOfBirth: "1998-03-15",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 2
        //     },
        //     {
        //         personId: "16",
        //         name: "Leonie Maier",
        //         dateOfBirth: "1992-09-29",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 2
        //     },
        //     {
        //         personId: "17",
        //         name: "Lena Sophie Oberdorf",
        //         dateOfBirth: "2001-12-19",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 2
        //     },
        //     {
        //         personId: "18",
        //         name: "Lea Schuller",
        //         dateOfBirth: "1997-11-12",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 2
        //     },
        //     {
        //         personId: "19",
        //         name: "Sydney Lohmann",
        //         dateOfBirth: "2000-06-19",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 2
        //     },
        //     {
        //         personId: "20",
        //         name: "Svenja Huth",
        //         dateOfBirth: "1991-01-25",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 2
        //     },
        //     {
        //         personId: "21",
        //         name: "Laura Benkarth",
        //         dateOfBirth: "1992-10-14",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 2
        //     },
        //     {
        //         personId: "22",
        //         name: "Laura Freigang",
        //         dateOfBirth: "1998-02-01",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 2
        //     },
        //     {
        //         personId: "23",
        //         name: "Tabea Wassmuth",
        //         dateOfBirth: "1996-08-25",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.PLAYER],
        //         assoClub_id: 2
        //     },
        //     {
        //         personId: "28",
        //         name: "Sandra Starke",
        //         dateOfBirth: "1993-07-31",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.MEMBER, PersonTypeEL.PLAYER],
        //         assoClub_id: 2
        //     }
        // ];
        console.log('Generating test data...');
        const response = await fetch( "../../test-data/players.json");
        const playerRecords = await response.json();
        await Promise.all( playerRecords.map( d => Player.add( d)));

        console.log(`${playerRecords.length} players saved.`);
    } catch (e) {
        console.error(`${e.constructor.name}: ${e.message}`);
    }
};
// Clear test data
Player.clearData = async function () {
    if (confirm("Do you really want to delete all player records?")) {
        console.log('Clearing test data...');

        let playersCollRef = db.collection("players");

        try {
            const playerDocSns = (await playersCollRef.withConverter( Player.converter)
                .get()).docs;

            await Promise.all( playerDocSns.map(
                playerDocSn => Player.destroy( playerDocSn.id)
            ));
            console.log(`${playerDocSns.length} player records deleted.`);
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
Player.syncDBwithUI = async function (personId) {
    try {
        let playerDocRef = db.collection("players").doc( personId);
        let originalPlayerDocSn = await playerDocRef.get();
        // listen document changes returning a snapshot on every change
        return playerDocRef.onSnapshot( playerDocSn => {
            // identify if changes are local or remote
            if (!playerDocSn.metadata.hasPendingWrites) {
                if (!playerDocSn.data()) {
                    handleUserMessage("removed", originalPlayerDocSn.data());
                } else if (!playerDocSn.isEqual( originalPlayerDocSn)) {
                    handleUserMessage("modified", playerDocSn.data());
                }
            }
        });
    } catch (e) {
        console.error(`${e.constructor.name} : ${e.message}`);
    }
}

export default Player;
