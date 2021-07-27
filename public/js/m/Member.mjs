/**
 * @fileOverview  The model class Member with attribute definitions and storage management methods
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 * @copyright Copyright 2013-2021 Gerd Wagner (Chair of Internet Technology) and Juan-Francisco Reyes, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import { db } from "../c/initialize.mjs";
import Person, {GenderEL, PersonTypeEL} from "./Person.mjs";
import {cloneObject, handleUserMessage, isNonEmptyString,
    dateToTimestamp, timestampToDate} from "../../lib/util.mjs";
import {
    MandatoryValueConstraintViolation,
    NoConstraintViolation, RangeConstraintViolation,
    ReferentialIntegrityConstraintViolation
} from "../../lib/errorTypes.mjs";
import FootballClub from "./FootballClub.mjs";
import FootballAssociation from "./FootballAssociation.mjs";

/**
 * The class Member
 * @class
 */
class Member extends Person {
    // using a single record parameter with ES6 function parameter destructuring
    // constructor ({personId, name, dateOfBirth, gender, type}) {
    constructor ({personId, name, dateOfBirth, gender, type, assoClubs, assoClubIdRefs,
                     assoAssociations, assoAssociationIdRefs}) {
        super({personId, name, dateOfBirth, gender, type});  // invoke Person constructor

        // assign object references or ID references (to be converted in setter)
        if (assoClubs || assoClubIdRefs) {
            this.assoClubs = assoClubs || assoClubIdRefs;
        }
        if (assoAssociations || assoAssociationIdRefs) {
            this.assoAssociations = assoAssociations || assoAssociationIdRefs;
        }
        // this._memberedClubs = {};
        // this._memberedAssos = {};
    }
    // get memberedClubs() {
    //     return this._memberedClubs;
    // }
    // get memberedAssos() {
    //     return this._memberedAssos;
    // }

    get assoClubs() {
        return this._assoClubs;
    }
    static async checkAssoClub( assoClub_id) {
        var validationResult = null;
        if (!assoClub_id) {
            // associated club(s) are optional
            validationResult = new NoConstraintViolation();
        } else {
            validationResult = await FootballClub.checkClubIdAsIdRef( assoClub_id);
        }
        // else {
        //     // invoke foreign key constraint check
        //     validationResult = Actor.checkPersonIdAsIdRef( actor_id);
        // }
        return validationResult;
    }
    set assoClubs(ac) {
        this._assoClubs = ac;
        // // assoClub can be an ID reference or an object reference
        // const assoClub_id = (typeof assoClub !== "object") ? parseInt(assoClub) : assoClub.clubId;
        // const validationResult = Member.checkAssoClub(assoClub_id);
        //
        // console.log("validationResult: " + validationResult.message);
        // // console.log(assoClub_id + "/type: " + typeof assoClub_id);
        // if (assoClub_id && validationResult instanceof NoConstraintViolation) {
        //     // add the new associated club reference
        //     const key = String(assoClub_id);
        //     // this._assoClubs[key] = FootballClub.instances[key];
        //     console.log(await FootballClub.retrieve(key).then(value => value));
        //     this._assoClubs[key] = await FootballClub.retrieve(key).then(value => value);
        // } else {
        //     throw validationResult;
        // }
    }
    // removeAssoClub( assoClub) {
    //     // assoClub can be an ID reference or an object reference
    //     const assoClub_id = (typeof assoClub !== "object") ? parseInt( assoClub) : assoClub.clubId;
    //     const validationResult = Member.checkAssoClub( assoClub_id);
    //
    //     if (validationResult instanceof NoConstraintViolation) {
    //         // delete the associated club reference
    //         delete this._assoClubs[String( assoClub_id)];
    //     } else {
    //         throw validationResult;
    //     }
    // }
    // set assoClubs( assoClub) {
    //     this._assoClubs = {};
    //     if (Array.isArray(assoClub)) {  // array of IdRefs
    //         for (const idRef of assoClub) {
    //             this.addAssoClub( idRef);
    //         }
    //     } else {  // map of IdRefs to object references
    //         for (const idRef of Object.keys( assoClub)) {
    //             this.addAssoClub( assoClub[idRef]);
    //         }
    //     }
    // }

    get assoAssociations() {
        return this._assoAssociations;
    }
    static async checkAssoAssociation( assoAssociation_id) {
        var validationResult = null;
        if (!assoAssociation_id) {
            // associated association(s) are optional
            validationResult = new NoConstraintViolation();
        } else {
            validationResult = await FootballAssociation.checkAssoIdAsIdRef( assoAssociation_id);
        }
        // else {
        //     // invoke foreign key constraint check
        //     validationResult = Actor.checkPersonIdAsIdRef( actor_id);
        // }
        return validationResult;
    }
    // async addAssoAssociation(assoAssociation) {
    //     // assoAssociation can be an ID reference or an object reference
    //     const assoAssociation_id = (typeof assoAssociation !== "object") ? parseInt(assoAssociation) : assoAssociation.assoId;
    //     const validationResult = Member.checkAssoAssociation(assoAssociation_id);
    //
    //     if (assoAssociation_id && validationResult instanceof NoConstraintViolation) {
    //         // add the new associated association reference
    //
    //         const key = String(assoAssociation_id);
    //         console.log(await FootballAssociation.retrieve(key).then(value => value));
    //         this._assoAssociations[key] = await FootballAssociation.retrieve(key).then(value => value);
    //     } else {
    //         throw validationResult;
    //     }
    // }
    // removeAssoAssociation( assoAssociation) {
    //     // assoAssociation can be an ID reference or an object reference
    //     const assoAssociation_id = (typeof assoAssociation !== "object") ? parseInt( assoAssociation) : assoAssociation.assoId;
    //     const validationResult = Member.checkAssoAssociation( assoAssociation_id);
    //
    //     if (validationResult instanceof NoConstraintViolation) {
    //         // delete the associated association reference
    //         delete this._assoAssociations[String( assoAssociation_id)];
    //     } else {
    //         throw validationResult;
    //     }
    // }
    set assoAssociations( aa) {
        this._assoAssociations = aa;
        // if (Array.isArray(assoAssociation)) {  // array of IdRefs
        //     for (const idRef of assoAssociation) {
        //         this.addAssoAssociation( idRef);
        //     }
        // } else {  // map of IdRefs to object references
        //     for (const idRef of Object.keys( assoAssociation)) {
        //         this.addAssoAssociation( assoAssociation[idRef]);
        //     }
        // }
    }

    // toString() {
    //     var memberStr = `Member{ person ID: ${this.personId}, name: ${this.name}`;
    //     memberStr += `, association: ${this.association}`;
    //     return `${memberStr}}`;
    // }
}

/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/
/**
 *  Conversion between a Member object and a corresponding Firestore document
 */
Member.converter = {
    toFirestore: function (member) {
        const data = {
            personId: member.personId,
            name: member.name,
            dateOfBirth: dateToTimestamp(member.dateOfBirth),
            gender: parseInt(member.gender),
            type: member.type
        };
        if (member.assoClubs) {
            data.assoClubIdRefs = member.assoClubs;
        }
        if (member.assoAssociations) {
            data.assoAssociationIdRefs = member.assoAssociations;
        }
        return data;
    },
    fromFirestore: function (snapshot, options) {
        const member = snapshot.data( options);
        const data = {
            personId: member.personId,
            name: member.name,
            dateOfBirth: timestampToDate(member.dateOfBirth),
            gender: parseInt(member.gender),
            type: member.type
        };
        if (member.assoClubIdRefs) {
            data.assoClubs = member.assoClubIdRefs;
        }
        if (member.assoAssociationIdRefs) {
            data.assoAssociations = member.assoAssociationIdRefs;
        }
        return new Member( data);
    }
};

// Load a member record from Firestore
Member.retrieve = async function (personId) {
    try {
        const memberRec = (await db.collection("members").doc( personId)
            .withConverter( Member.converter).get()).data();
        console.log(`Member record "${memberRec.personId}" retrieved.`);
        return memberRec;
    } catch (e) {
        console.error(`Error retrieving member record: ${e}`);
    }
};

// Load all member records from Firestore
Member.retrieveAll = async function (order) {
    let membersCollRef = db.collection("members");
    try {
        if (order) membersCollRef = membersCollRef.orderBy( order);
        const memberRecords = (await membersCollRef.withConverter( Member.converter)
            .get()).docs.map( d => d.data());
        console.log(`${memberRecords.length} member records retrieved ${order ? "ordered by " + order : ""}`);
        return memberRecords;
    } catch (e) {
        console.error(`Error retrieving member records: ${e}`);
    }
};

// Member.retrieveAll = async function () {
//     let membersCollRef = db.collection("members");
//     try {
//         const memberRecords = (await membersCollRef.withConverter( Member.converter)
//             .get()).docs.map( d => d.data());
//         console.log(`${memberRecords.length} member records retrieved.`);
//         return memberRecords;
//     } catch (e) {
//         console.error(`Error retrieving member records: ${e}`);
//     }
// };

/***********************************************
 *** Class-level ("static") properties **********
 ************************************************/
// initially an empty collection (in the form of a map)
// Member.instances = {};
// add Member to the list of Person subtypes
// Person.subtypes.push( Member);

/*********************************************************
 *** Class-level ("static") storage management methods ****
 **********************************************************/
// Create a Firestore document in the Firestore collection "members"
Member.add = async function (slots) {
    var validationResult = null,
        member = null;
    try {
        member = new Member(slots);
        // let validationResult = await Person.checkPersonId( member.personId);
        validationResult = await Member.checkPersonId( member.personId);
        if (!validationResult instanceof NoConstraintViolation) {
            throw validationResult;
        }
        const memberDocRef = db.collection("members").doc( member.personId);
        await memberDocRef.withConverter( Member.converter).set( member);
        console.log(`Member record (Person ID: "${member.personId}") created.`);

    } catch( e) {
        console.error(`Error creating member record: ${e}`);
        // member = null;
    }
    // if (member) {
    //     try {
    //         const memberDocRef = db.collection("members").doc( member.personId);
    //         await memberDocRef.withConverter( Member.converter).set( member);
    //         console.log(`Member record "${member.personId}" created.`);
    //     } catch (e) {
    //         console.error(`${e.constructor.name}: ${e.message} + ${e}`);
    //     }
    // }
};

// Update a Firestore document in the Firestore collection "members"
Member.update = async function ({personId, name, dateOfBirth, gender, type,
                                    assoClubIdRefsToAdd, assoClubIdRefsToRemove,
                                    assoAssociationIdRefsToAdd, assoAssociationIdRefsToRemove}) {
    const updatedSlots = {};
    let validationResult = null,
        memberRec = null,
        memberDocRef = null;

    // // retrieve up-to-date member record
    // const memberRec = await Member.retrieve( personId);
    //
    // // const member = Member.instances[personId];
    // const objectBeforeUpdate = cloneObject( memberRec);  // save the current state of member
    //
    // var noConstraintViolated = true, updatedProperties = [];
    // const memberDocRef = db.collection("members").doc( personId);
    try {
        // retrieve up-to-date member record
        memberDocRef = db.collection("members").doc( personId);
        const memberDocSn = await memberDocRef.withConverter(Member.converter).get();
        memberRec = memberDocSn.data();
    } catch (e) {
        console.error(`${e.constructor.name}: ${e.message}`);
    }

    try {
        // const memberDocSns = await memberDocRef.withConverter( Member.converter).get();
        // const memberBeforeUpdate = memberDocSns.data();
        // update only those slots that have changed
        // if (memberRec.name !== name) updSlots.name = name;
        // if (memberRec.dateOfBirth !== dateOfBirth) updSlots.dateOfBirth = dateOfBirth;
        // if (memberRec.gender !== gender) updSlots.gender = gender;
        // if (memberRec.type !== type) updSlots.type = type;
        if (memberRec.name !== name) {
            validationResult = Person.checkName( name);
            if (validationResult instanceof NoConstraintViolation) {
                updatedSlots.name = name;
            } else {
                throw validationResult;
            }
        }
        if (memberRec.dateOfBirth !== dateOfBirth) {
            validationResult = Person.checkDateOfBirth( dateOfBirth);
            if (validationResult instanceof NoConstraintViolation) {
                updatedSlots.dateOfBirth = dateToTimestamp(dateOfBirth);
            } else {
                throw validationResult;
            }
        }
        if (memberRec.gender !== parseInt(gender)) {
            validationResult = Person.checkGender( gender);
            if (validationResult instanceof NoConstraintViolation) {
                updatedSlots.gender = parseInt(gender);
            } else {
                throw validationResult;
            }
        }
        if (!memberRec.type.isEqualTo(type)) {
            validationResult = Person.checkTypes( type);
            if (validationResult instanceof NoConstraintViolation) {
                updatedSlots.type = type;
            } else {
                throw validationResult;
            }
        }
        let assoClubIdRefs = memberRec.assoClubs;
        if (assoClubIdRefsToAdd) {
            assoClubIdRefs = assoClubIdRefs.concat( assoClubIdRefsToAdd.map( d => +d));
        }
        if (assoClubIdRefsToRemove) {
            assoClubIdRefsToRemove = assoClubIdRefsToRemove.map( d => +d);
            assoClubIdRefs = assoClubIdRefs.filter( d => !assoClubIdRefsToRemove.includes( d));
        }
        updatedSlots.assoClubIdRefs = assoClubIdRefs;

        let assoAssociationIdRefs = memberRec.assoAssociations;
        if (assoAssociationIdRefsToAdd) {
            assoAssociationIdRefs = assoAssociationIdRefs.concat( assoAssociationIdRefsToAdd.map( d => +d));
        }
        if (assoAssociationIdRefsToRemove) {
            assoAssociationIdRefsToRemove = assoAssociationIdRefsToRemove.map( d => +d);
            assoAssociationIdRefs = assoAssociationIdRefs.filter( d => !assoAssociationIdRefsToRemove.includes( d));
        }
        updatedSlots.assoAssociationIdRefs = assoAssociationIdRefs;

        // if (assoClubIdRefsToAdd) {
        //     updatedSlots.push("assoClubs(added)");
        //     for (let assoClubIdRef of assoClubIdRefsToAdd) {
        //         memberBeforeUpdate.addAssoClub( assoClubIdRef);
        //     }
        // }
        // if (assoClubIdRefsToRemove) {
        //     updatedSlots.push("assoClubs(removed)");
        //     for (let assoClub_id of assoClubIdRefsToRemove) {
        //         memberBeforeUpdate.removeAssoClub( assoClub_id);
        //     }
        // }
        //
        // if (assoAssociationIdRefsToAdd) {
        //     updatedSlots.push("assoAssociations(added)");
        //     for (let assoAssociationIdRef of assoAssociationIdRefsToAdd) {
        //         memberBeforeUpdate.addAssoAssociation( assoAssociationIdRef);
        //     }
        // }
        // if (assoAssociationIdRefsToRemove) {
        //     updatedSlots.push("assoAssociations(removed)");
        //     for (let assoAssociation_id of assoAssociationIdRefsToRemove) {
        //         memberBeforeUpdate.removeAssoAssociation( assoAssociation_id);
        //     }
        // }
    } catch (e) {
        console.log(`${e.constructor.name}: ${e.message}`);
        // noConstraintViolated = false;
    }
    let updatedProperties = Object.keys( updatedSlots);
    // if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
        await memberDocRef.withConverter( Member.converter).update( updatedSlots);
        console.log(`Property(ies) "${updatedProperties.toString()}" modified for member record (Person ID: "${personId}")`);
    } else {
        console.log(`No property value changed for member record (Person ID: "${personId}")!`);
    }
    // }

    // if (Object.keys( updSlots).length > 0) {
    //     try {
    //         await db.collection("members").doc( personId).update( updSlots);
    //     } catch( e) {
    //         console.error(`Error when updating member record: ${e}`);
    //         return;
    //     }
    //     console.log(`Member record ${personId} modified.`);
    // }
};
// Delete a Firestore document in the Firestore collection "members"
Member.destroy = async function (personId) {
    try {
        const clubsCollRef = db.collection("clubs"),
            assosCollRef = db.collection("associations"),
            membersCollRef = db.collection("members"),
            clubQrySn = clubsCollRef.where("assoClubIdRefs", "array-contains", parseInt(personId)),
            assoQrySn = clubsCollRef.where("assoAssociationIdRefs", "array-contains", parseInt(personId)),
            associatedClubDocSns = (await clubQrySn.get()).docs,
            associatedAssoDocSns = (await assoQrySn.get()).docs,
            memberDocRef = membersCollRef.doc( personId);

        // initiate batch write
        const batch = db.batch();
        for (const ac of associatedClubDocSns) {
            const clubDocRef = clubsCollRef.doc( ac.id);
            // remove associated personId from each football club record
            batch.update( clubDocRef, {
                assoClubIdRefs: firebase.firestore.FieldValue.delete()
            });
        }

        for (const aa of associatedAssoDocSns) {
            const assoDocRef = assosCollRef.doc( aa.id);
            // remove associated personId from each football association record
            batch.update( assoDocRef, {
                assoAssociationIdRefs: firebase.firestore.FieldValue.delete()
            });
        }
        // delete member record
        batch.delete( memberDocRef);
        batch.commit(); // finish batch write
        console.log(`Member record (Person ID: "${personId}") deleted!`);
    } catch (e) {
        console.error(`Error deleting member record: ${e}`);
    }
};

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
// Create test data
Member.generateTestData = async function () {
    try {
        // let memberRecords = [
        //     {
        //         personId: "27",
        //         name: "Patrik Grolimund",
        //         dateOfBirth: "1980-08-19",
        //         gender: GenderEL.M,
        //         type: [PersonTypeEL.MEMBER, PersonTypeEL.COACH],
        //         assoClubIdRefs: [1,2],
        //         assoAssociationIdRefs: [2,3]
        //     },
        //     {
        //         personId: "28",
        //         name: "Sandra Starke",
        //         dateOfBirth: "1993-07-31",
        //         gender: GenderEL.F,
        //         type: [PersonTypeEL.MEMBER, PersonTypeEL.PLAYER],
        //         assoClubIdRefs: [2],
        //         assoAssociationIdRefs: []
        //     }
        // ];
        console.log('Generating test data...');
        const response = await fetch( "../../test-data/members.json");
        const memberRecords = await response.json();
        await Promise.all( memberRecords.map( d => Member.add( d)));

        console.log(`${memberRecords.length} members saved.`);
    } catch (e) {
        console.error(`${e.constructor.name}: ${e.message}`);
    }
};

// Clear test data
Member.clearData = async function () {
    if (confirm("Do you really want to delete all member records?")) {
        console.log('Clearing test data...');

        let membersCollRef = db.collection("members");

        try {
            const memberDocSns = (await membersCollRef.withConverter( Member.converter)
                .get()).docs;

            await Promise.all( memberDocSns.map(
                memberDocSn => Member.destroy( memberDocSn.id)
            ));
            console.log(`${memberDocSns.length} member records deleted.`);
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
Member.syncDBwithUI = async function (personId) {
    try {
        let memberDocRef = db.collection("members").doc( personId);
        let originalMemberDocSn = await memberDocRef.get();
        // listen document changes returning a snapshot on every change
        return memberDocRef.onSnapshot( memberDocSn => {
            // identify if changes are local or remote
            if (!memberDocSn.metadata.hasPendingWrites) {
                if (!memberDocSn.data()) {
                    handleUserMessage("removed", originalMemberDocSn.data());
                } else if (!memberDocSn.isEqual( originalMemberDocSn)) {
                    handleUserMessage("modified", memberDocSn.data());
                }
            }
        });
    } catch (e) {
        console.error(`${e.constructor.name} : ${e.message}`);
    }
}

export default Member;
