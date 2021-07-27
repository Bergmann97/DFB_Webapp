/**
 * @fileOverview  Contains various view functions for the use case listPersons
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */

/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Person, {GenderEL, PersonTypeEL} from "../../m/Person.mjs";
import {
    createChoiceWidget, createIsoDateString, createListFromMap, fillSelectWithOptions,
    showProgressBar
} from "../../../lib/util.mjs";
import Member from "../../m/Member.mjs";
import Player from "../../m/Player.mjs";
import Coach from "../../m/Coach.mjs";
import President from "../../m/President.mjs";
import FootballClub from "../../m/FootballClub.mjs";
import FootballAssociation from "../../m/FootballAssociation.mjs";
import {db} from "../../c/initialize.mjs";

/**********************************************************************
 Declare variables for accessing UI elements
 **********************************************************************/

const tableBodyEl = document.querySelector("table#persons > tbody");

const tableEl = document.getElementById("persons"),
    trEl = document.querySelector("table>thead>tr"),
    selectTypeEl = document.querySelector("select#selectType"),
    preNextSpan = document.getElementById("preNextBtn");


/***************************************************************
 Create table view
 ***************************************************************/
// invoke list ordered by personId (default)
// await renderList( "personId");


/***************************************************************
 Initialize pagination mapping references
 ***************************************************************/
let cursor = null,
    previousPageRef = null,
    nextPageRef = null,
    startAtRefs = [];
let order = "personId"; // default order value
const selectOrderEl = document.querySelector("main > div > div > label > select#selectOrder");
const previousBtnEl = document.getElementById("previousPage"),
    nextBtnEl = document.getElementById("nextPage");

await createBlock();
startAtRefs.push( cursor); // set 'first' startAt page reference
previousBtnEl.disabled = true;
// nextBtnEl.disabled = true;

/***************************************************************
 Handle order selector
 ***************************************************************/

fillSelectWithOptions(selectTypeEl, PersonTypeEL.labels);

selectTypeEl.addEventListener("change", async function (e) {
    // await renderList( selectOrderEl.value, selectTypeEl.value);
    // await createBlock(selectOrderEl.value, selectTypeEl.value);
    await typeRender(selectOrderEl.value, selectTypeEl.value);
});

selectOrderEl.addEventListener("change", async function (e) {
    const typeValue = selectTypeEl.value;
    order = e.target.value;
    startAtRefs = [];
    await createBlock();
    startAtRefs.push( cursor);
    previousBtnEl.disabled = true;
    nextBtnEl.disabled = false;

    if (typeValue) {
        // await renderList( e.target.value, selectTypeEl.value);
        await typeRender( order, selectTypeEl.value);
    }
    else {
        // await renderList(e.target.value);
        await createBlock();
    }
});

async function typeRender(order, type) {
    console.log("TYPE RENDER");
    trEl.innerHTML = "";
    tableBodyEl.innerHTML = "";

    console.log("order: " + order);
    console.log("type: " + type);

    if (type) {
        if (typeof type === 'string') {
            type = parseInt(type);
        }
        if (type === PersonTypeEL.MEMBER) {
            console.log("MEMBER");
            preNextSpan.style.visibility = "hidden";

            trEl.innerHTML = "";
            tableBodyEl.innerHTML = "";
            // selectOrderEl.innerHTML = "";


            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Person ID"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Name"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Date Of Birth"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Gender"));

            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Associated Clubs"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Associated Associations"));

            const memberRecords = await Member.retrieveAll(order);
            // clubsCollRef = db.collection("clubs"),
            // assosCollRef = db.collection("associations");

            console.log(memberRecords);

            // for each member, create a table row with a cell for each attribute
            // for (let person of personRecords) {
            //     let row = tableBodyEl.insertRow();
            //     row.insertCell().textContent = person.personId;
            //     row.insertCell().textContent = person.name;
            //     // row.insertCell().textContent = LanguageEL.labels[book.originalLanguage - 1];
            //     row.insertCell().textContent = person.dateOfBirth;
            //
            //     row.insertCell().textContent = GenderEL.labels[person.gender - 1];
            //     row.insertCell().textContent = PersonTypeEL.stringify(person.type);
            //
            // }
            for (const memberRec of memberRecords) {
                // const clubQrySn = clubsCollRef.where(memberRec.assoClubIdRefs, "array-contains", "clubId"),
                //     assoQrySn = assosCollRef.where(memberRec.assoAssociationIdRefs, "array-contains", "assoId"),
                //     associatedClubDocSns = (await clubQrySn.get()).docs,
                //     associatedAssociationDocSns = (await assoQrySn.get()).docs;
                // const assoClubs = [];
                // const assoAssociations = [];
                //
                // console.log("associatedClubDocSns: " + associatedClubDocSns);
                // console.log("associatedAssociationDocSns: " + associatedAssociationDocSns);
                // for (const ac of associatedClubDocSns) {
                //     assoClubs.push(ac.id);
                // }
                // for (const aa of associatedAssociationDocSns) {
                //     assoClubs.push(aa.id);
                // }




                const row = tableBodyEl.insertRow();
                // console.log("personRec.type: " + personRec.type + "/type: " + typeof personRec.type);
                row.insertCell().textContent = memberRec.personId;
                row.insertCell().textContent = memberRec.name;
                row.insertCell().textContent = memberRec.dateOfBirth;

                // row.insertCell().textContent = personRec.gender;
                // row.insertCell().textContent = personRec.type;
                row.insertCell().textContent = GenderEL.enumLitNames[memberRec.gender - 1];

                // const assoClubsName = [];
                // const assoAssociationsName = [];
                // for (const ac of assoClubs) {
                //     assoClubsName.push(await FootballClub.retrieve(String(ac)).then(value => value.name));
                // }
                // for (const aa of assoAssociations) {
                //     assoAssociationsName.push(await FootballAssociation.retrieve(String(aa)).then(value => value.name));
                // }

                let ul = document.createElement('ul');
                let li = document.createElement('li');

                console.log("memberRec.assoClubs: " + memberRec.assoClubs);
                console.log("memberRec.assoClubslength: " + memberRec.assoClubs.length);
                // console.log("memberRec.assoAssociations: " + memberRec.assoAssociations.length);
                if (memberRec.assoClubs) {
                    console.log("IF memberRec.assoClubs");
                    // row.insertCell().textContent = memberRec.assoClubs;
                    const assoClubsName = [];
                    for (const club of memberRec.assoClubs) {
                        assoClubsName.push(await FootballClub.retrieve(String(club)).then(value => value.name));
                    }
                    // row.insertCell().textContent = memberRec.assoAssociations;
                    row.insertCell().innerHTML = '<ul><li>' + assoClubsName.join("</li><li>"); + '</li></ul>';
                    // row.insertCell().appendChild(ul);
                    // for (const item of memberRec.assoClubs) {
                    //
                    //     // row.insertCell().appendChild(ul);
                    //     ul.appendChild(li);
                    //
                    //     li.innerHTML += await FootballClub.retrieve(String(item)).then(value => value.name);
                    // }
                } else {
                    console.log("ELSE memberRec.assoClubs");
                    row.insertCell().textContent = "";
                }

                if (memberRec.assoAssociations.length > 0) {
                    // console.log("IF memberRec.assoAssociations");
                    const assoAssociationsName = [];
                    for (const asso of memberRec.assoAssociations) {
                        assoAssociationsName.push(await FootballAssociation.retrieve(String(asso)).then(value => value.name));
                    }
                    // row.insertCell().textContent = memberRec.assoAssociations;
                    row.insertCell().innerHTML = '<ul><li>' + assoAssociationsName.join("</li><li>"); + '</li></ul>';

                    // row.insertCell().appendChild(ul);
                    //
                    // for (const item of memberRec.assoAssociations) {
                    //     // let li = document.createElement('li');
                    //     ul.appendChild(li);
                    //
                    //     li.innerHTML += await FootballAssociation.retrieve(String(item)).then(value => value.name);
                    // }
                } else {
                    // console.log("ELSE memberRec.assoAssociations");
                    row.insertCell().textContent = "";
                }
                // row.insertCell().textContent = memberRec.assoAssociationIdRefs ?
                //     await FootballClub.retrieve(String(memberRec.assoClub)).then(value => value.name) : "";

                // row.insertCell().textContent = assoAssociationsName.length > 0 ? assoAssociationsName.length : "0";

                // row.insertCell().appendChild(clubListEl ? clubListEl : "");
                // row.insertCell().appendChild(associationListEl ? associationListEl : "");
            }
        } else if (type === PersonTypeEL.PLAYER) {
            console.log("PLAYER");
            preNextSpan.style.visibility = "hidden";

            trEl.innerHTML = "";
            tableBodyEl.innerHTML = "";

            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Person ID"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Name"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Date Of Birth"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Gender"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Associated Club"));

            console.log("Player order: " + order);
            const playerRecords = await Player.retrieveAll(order);

            // const one = await FootballClub.retrieve("1");
            // console.log(FootballClub.retrieve("1").then(result => result.data));
            // await FootballClub.retrieve("1").then(function(value) {
            //     console.log(value.name); // "Success"
            // });
            // console.log(FootballClub.retrieve("1").then(value => value.name));
            // console.log(FootballAssociation.retrieve("1"));

            // for each player, create a table row with a cell for each attribute
            for (let playerRecord of playerRecords) {
                const row = tableBodyEl.insertRow();
                // console.log(playerRecord);
                row.insertCell().textContent = playerRecord.personId;
                row.insertCell().textContent = playerRecord.name;
                row.insertCell().textContent = playerRecord.dateOfBirth;
                // row.insertCell().textContent = personRec.gender;
                // row.insertCell().textContent = personRec.type;
                // console.log("playerRecord.assoClub: " + playerRecord.assoClub);
                row.insertCell().textContent = GenderEL.enumLitNames[playerRecord.gender - 1];
                // if (playerRecord.assoClub) {
                //     const clubName = await FootballClub.retrieve(String(playerRecord.assoClub)).then(value => value.name);
                //     console.log(clubName);
                //     if (clubName !== undefined) {
                //         row.insertCell().textContent = clubName;
                //     } else {
                //         row.insertCell().textContent = "";
                //     }
                // } else{
                //     row.insertCell().textContent = "";
                // }
                row.insertCell().textContent = playerRecord.assoClub ?
                    await FootballClub.retrieve(String(playerRecord.assoClub)).then(value => value.name)? await FootballClub.retrieve(String(playerRecord.assoClub)).then(value => value.name): "" : "";
            }

        } else if (type === PersonTypeEL.COACH) {
            console.log("COACH");
            preNextSpan.style.visibility = "hidden";

            trEl.innerHTML = "";
            tableBodyEl.innerHTML = "";

            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Person ID"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Name"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Date Of Birth"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Gender"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Associated Club"));

            const coachRecords = await Coach.retrieveAll(order);

            // for each coach, create a table row with a cell for each attribute
            for (let coachRecord of coachRecords) {
                const row = tableBodyEl.insertRow();
                // console.log("personRec.type: " + personRec.type + "/type: " + typeof personRec.type);
                row.insertCell().textContent = coachRecord.personId;
                row.insertCell().textContent = coachRecord.name;
                row.insertCell().textContent = coachRecord.dateOfBirth;
                // row.insertCell().textContent = personRec.gender;
                // row.insertCell().textContent = personRec.type;
                row.insertCell().textContent = GenderEL.enumLitNames[coachRecord.gender - 1];
                row.insertCell().textContent = coachRecord.assoClub ?
                    await FootballClub.retrieve(String(coachRecord.assoClub)).then(value => value.name) : "";


            }
        } else if (type === PersonTypeEL.PRESIDENT) {
            console.log("PRESIDENT");
            preNextSpan.style.visibility = "hidden";

            trEl.innerHTML = "";
            tableBodyEl.innerHTML = "";

            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Person ID"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Name"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Date Of Birth"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Gender"));
            trEl.appendChild(document.createElement("th"))
                .appendChild(document.createTextNode("Associated Association"));

            const presidentRecords = await President.retrieveAll(order);

            // for each president, create a table row with a cell for each attribute
            for (let presidentRecord of presidentRecords) {
                const row = tableBodyEl.insertRow();
                // console.log("personRec.type: " + personRec.type + "/type: " + typeof personRec.type);
                row.insertCell().textContent = presidentRecord.personId;
                row.insertCell().textContent = presidentRecord.name;
                row.insertCell().textContent = presidentRecord.dateOfBirth;
                // row.insertCell().textContent = personRec.gender;
                // row.insertCell().textContent = personRec.type;
                row.insertCell().textContent = GenderEL.enumLitNames[presidentRecord.gender - 1];
                // row.insertCell().textContent = presidentRecord.assoAssociation.name;
                row.insertCell().textContent = presidentRecord.assoAssociation ?
                    await FootballAssociation.retrieve(String(presidentRecord.assoAssociation)).then(value => value.name) : "";
                // row.insertCell().textContent = presidentRecord.assoAssociation ?
                //     await FootballAssociation.retrieve(presidentRecord.assoAssociation).then(value => value.name) : "";

            }
        }
        // else {
        //     console.log("ALL");
        //
        //     // const personRecords = await Person.retrieveAll(order);
        //     // tableEl.innerHTML = "";
        //     trEl.innerHTML = "";
        //     tableBodyEl.innerHTML = "";
        //
        //     const personRecords = await Person.retrieveBlock({"order": order, "cursor": startAt});
        //     console.log(personRecords);
        //     // set page references for current (cursor) page
        //     cursor = personRecords[0][order];
        //     // set next startAt page reference, if not next page, assign 'null' value
        //     nextPageRef = (personRecords.length < 11) ? null : personRecords[personRecords.length -1][order];
        //
        //
        //     trEl.appendChild(document.createElement("th"))
        //         .appendChild(document.createTextNode("Person ID"));
        //     trEl.appendChild(document.createElement("th"))
        //         .appendChild(document.createTextNode("Name"));
        //     trEl.appendChild(document.createElement("th"))
        //         .appendChild(document.createTextNode("Date Of Birth"));
        //     trEl.appendChild(document.createElement("th"))
        //         .appendChild(document.createTextNode("Gender"));
        //     trEl.appendChild(document.createElement("th"))
        //         .appendChild(document.createTextNode("Type"));
        //
        //     // for each person, create a table row with a cell for each attribute
        //     for (let person of personRecords) {
        //         let row = tableBodyEl.insertRow(-1);
        //         row.insertCell(-1).textContent = person.personId;
        //         row.insertCell(-1).textContent = person.name;
        //         row.insertCell(-1).textContent = person.dateOfBirth;
        //
        //         row.insertCell(-1).textContent = GenderEL.labels[person.gender - 1];
        //         row.insertCell(-1).textContent = PersonTypeEL.stringify(person.type);
        //
        //     }
        // }
    } else {
        console.log("No TYPE");

        preNextSpan.style.visibility = "visible";

        trEl.innerHTML = "";
        tableBodyEl.innerHTML = "";

        trEl.appendChild(document.createElement("th"))
            .appendChild(document.createTextNode("Person ID"));
        trEl.appendChild(document.createElement("th"))
            .appendChild(document.createTextNode("Name"));
        trEl.appendChild(document.createElement("th"))
            .appendChild(document.createTextNode("Date Of Birth"));
        trEl.appendChild(document.createElement("th"))
            .appendChild(document.createTextNode("Gender"));
        trEl.appendChild(document.createElement("th"))
            .appendChild(document.createTextNode("Type"));
        await createBlock();
    }
}


/***************************************************************
 Render list of all person records
 ***************************************************************/
// async function renderList( order, type) {
// tableBodyEl.innerHTML = "";
async function createBlock (startAt) {
    // trEl.innerHTML = "";
    // console.log("CREATE BLOCK");
    tableBodyEl.innerHTML = "";
    // console.log("startAt: " + startAt);
    // console.log("order: "  + order);

    // load a list of all person records



    showProgressBar("show");

    // selectTypeEl.addEventListener("change", async function () {
    //     let type = selectTypeEl.value;
    //  else {
    //     console.log("No Type");
    // startAtRefs.push( cursor);
    // startAt = undefined;

    // const personRecords = await Person.retrieveAll(order);
    // // set page references for current (cursor) page
    // cursor = personRecords[0][order];
    // // set next startAt page reference, if not next page, assign 'null' value
    // nextPageRef = (personRecords.length < 21) ? null : personRecords[personRecords.length - 1][order];


    //
    // trEl.appendChild(document.createElement("th"))
    //     .appendChild(document.createTextNode("Person ID"));
    // trEl.appendChild(document.createElement("th"))
    //     .appendChild(document.createTextNode("Name"));
    // trEl.appendChild(document.createElement("th"))
    //     .appendChild(document.createTextNode("Date Of Birth"));
    // trEl.appendChild(document.createElement("th"))
    //     .appendChild(document.createTextNode("Gender"));
    // trEl.appendChild(document.createElement("th"))
    //     .appendChild(document.createTextNode("Type"));
    // const cityRef = db.collection('cities').doc('SF');
    // const doc = await cityRef.get();

    // const personRef = await db.collection("persons").doc( "personId");
    // const doc = await personRef.get();
    // console.log(doc);
    // final snapshot = await firestore.collection(roomName).getDocuments();
    // if (snapshot.documents.length == 0) {
    //     //doesnt exist
    // }
    const personExist = await Person.retrieveAll();
    // const doc = await personRef.get();

    // if (!doc.exists) {
    //     console.log('No such document!');
    // } else {
    //     console.log('Document data:', doc.data());
    // }
    // console.log(personExist.length);

    if (personExist.length > 0) {
        const personRecords = await Person.retrieveBlock({"order": order, "cursor": startAt});
// set page references for current (cursor) page
        cursor = personRecords[0][order];
        // set next startAt page reference, if not next page, assign 'null' value
        nextPageRef = (personRecords.length < 11) ? null : personRecords[personRecords.length -1][order];

        // for each person, create a table row with a cell for each attribute
        for (let person of personRecords) {
            let row = tableBodyEl.insertRow(-1);
            row.insertCell(-1).textContent = person.personId;
            row.insertCell(-1).textContent = person.name;
            row.insertCell(-1).textContent = person.dateOfBirth;

            row.insertCell(-1).textContent = GenderEL.labels[person.gender - 1];
            row.insertCell(-1).textContent = PersonTypeEL.stringify(person.type);

        }
    } else {
        console.log("no info");
        previousBtnEl.disabled = true;
        nextBtnEl.disabled = true;
    }

    showProgressBar("hide");
}

// });


// }
// }
/**
 * 'Previous' button
 */
previousBtnEl.addEventListener("click", async function () {
    // locate current page reference in index of page references
    previousPageRef = startAtRefs[startAtRefs.indexOf( cursor) - 1];
    // create new page
    await createBlock( previousPageRef);
    // disable 'previous' button if cursor is first page
    if (cursor === startAtRefs[0]) previousBtnEl.disabled = true;
    // enable 'next' button if cursor is not last page
    if (cursor !== startAtRefs[startAtRefs.length -1]) nextBtnEl.disabled = false;
});
/**
 *  'Next' button
 */
nextBtnEl.addEventListener("click", async function () {
    await createBlock( nextPageRef);
    // add new page reference if not present in index
    if (!startAtRefs.find( i => i === cursor)) startAtRefs.push( cursor);
    // disable 'next' button if cursor is last page
    if (!nextPageRef) nextBtnEl.disabled = true;
    // enable 'previous' button if cursor is not first page
    if (cursor !== startAtRefs[0]) previousBtnEl.disabled = false;
});
// export async function setupUserInterface() {



// document.getElementById("association").remove();
// load a list of all person records from Firestore
// const personRecords = await Person.retrieveAll();
// for each person, create a table row with a cell for each attribute
// for (const personRec of personRecords) {
//     const row = tableBodyEl.insertRow();
//     // console.log("personRec.type: " + personRec.type + "/type: " + typeof personRec.type);
//     row.insertCell().textContent = personRec.personId;
//     row.insertCell().textContent = personRec.name;
//     row.insertCell().textContent = personRec.dateOfBirth;
//     // row.insertCell().textContent = personRec.gender;
//     // row.insertCell().textContent = personRec.type;
//
//     row.insertCell().textContent = GenderEL.enumLitNames[personRec.gender - 1];
//     row.insertCell().textContent = PersonTypeEL.stringify(personRec.type);
//
// }



// }
// }