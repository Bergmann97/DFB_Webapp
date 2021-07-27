/**
 * @fileOverview  Contains various view functions for the use case listFootballClubs
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */

/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import FootballClub from "../../m/FootballClub.mjs";
import { db } from "../../c/initialize.mjs"
import Person, {GenderEL, PersonTypeEL} from "../../m/Person.mjs";
import {
    createChoiceWidget, createIsoDateString, createListFromMap, fillSelectWithOptions,
    showProgressBar
} from "../../../lib/util.mjs";
import Player from "../../m/Player.mjs";
import Coach from "../../m/Coach.mjs";
import President from "../../m/President.mjs";
import FootballAssociation from "../../m/FootballAssociation.mjs";
import Member from "../../m/Member.mjs";

/**********************************************************************
 Declare variables for accessing UI elements
 **********************************************************************/
const selectOrderEl = document.querySelector("main > div > div > label > select");
const tableBodyEl = document.querySelector("table#clubs > tbody");

const tableEl = document.getElementById("clubs"),
    trEl = document.querySelector("table>thead>tr");

/***************************************************************
 Create table view
 ***************************************************************/
// invoke list ordered by clubId (default)
await renderList( "clubId");

/***************************************************************
 Handle order selector
 ***************************************************************/
selectOrderEl.addEventListener("change", async function (e) {
    // invoke list with order selected
    await renderList( e.target.value);
});

/***************************************************************
 Render list of all football club records
 ***************************************************************/
async function renderList( order) {
    tableBodyEl.innerHTML = "";
    showProgressBar("show");
    // load a list of all football club records
    const clubRecords = await FootballClub.retrieveAll(order),
        playersCollRef = db.collection("players"),
        coachesCollRef = db.collection("coaches"),
        assosCollRef = db.collection("associations"),
        membersCollRef = db.collection("members");

    // const booksCollRef = db.collection("books"),
    //     publishersCollRef = db.collection("publishers"),
    //     bookQrySn = booksCollRef.where("publisher_id", "==", name),
    //     associatedBookDocSns = (await bookQrySn.get()).docs,
    //     publisherDocRef = publishersCollRef.doc( name);

    // for each football club, create a table row with a cell for each attribute
    for (let club of clubRecords) {
        const playerQrySn = playersCollRef.where("assoClub_id", "==", parseInt(club.clubId)),
            coachQrySn = coachesCollRef.where("assoClub_id", "==", parseInt(club.clubId)),
            assoQrySn = assosCollRef.where("assoId", "==", String(club.association)),
            memberQrySn = membersCollRef.where("assoClubIdRefs", "array-contains", parseInt(club.clubId)),
            associatedPlayerDocSns = (await playerQrySn.get()).docs,
            associatedCoachDocSns = (await coachQrySn.get()).docs,
            associatedAssoDocSns = (await assoQrySn.get()).docs,
            associatedMemberDocSns = (await memberQrySn.get()).docs;

        // console.log("coachQrySn: " + coachQrySn);
        // console.log("associatedCoachDocSns: " + associatedCoachDocSns);

        const assoPlayers = [];
        for (const ap of associatedPlayerDocSns) {
            assoPlayers.push(ap.id);
        }
        const assoMembers = [];
        for (const am of associatedMemberDocSns) {
            assoMembers.push(am.id);
        }
        console.log("assoMembers: " + assoMembers);

        let row = tableBodyEl.insertRow();
        row.insertCell().textContent = club.clubId;
        row.insertCell().textContent = club.name;
        row.insertCell().textContent = GenderEL.labels[club.gender - 1];
        for (const aa of associatedAssoDocSns) {
            row.insertCell().textContent = aa.id ? await FootballAssociation.retrieve(String(aa.id)).then(value => value.name) : "";
        }

        const assoMembersName = [];
        for (const m of assoMembers) {
            assoMembersName.push(await Member.retrieve(String(m)).then(value => value.name));
        }
        if (assoMembersName.length > 0) {
            row.insertCell().innerHTML = '<ul><li>' + assoMembersName.join("</li><li>"); + '</li></ul>';

        } else {
            row.insertCell().textContent = "";
        }
        // row.insertCell().textContent = assoMembers.length > 0 ? assoMembers.length : "0";


        const assoPlayersName = [];
        for (const p of assoPlayers) {
            assoPlayersName.push(await Player.retrieve(String(p)).then(value => value.name));
        }
        if (assoPlayersName.length > 0) {
            row.insertCell().innerHTML = '<ul><li>' + assoPlayersName.join("</li><li>"); + '</li></ul>';

        } else {
            row.insertCell().textContent = "";
        }
        // row.insertCell().textContent = assoPlayers.length > 0 ? assoPlayers.length : "0";

        console.log(associatedCoachDocSns);
        for (const ac of associatedCoachDocSns) {
            // console.log(b.id);
            // assoPlayers.push(ap.id);
            // console.log(ac.id);
            row.insertCell().textContent = ac.id ? await Coach.retrieve(String(ac.id)).then(value => value.name) : "";
            // const playerDocRef = playersCollRef.doc(b.id);
            // console.log(playerDocRef);
        }
        // row.insertCell().textContent = await Coach.retrieve(String(coachQrySn.id)).then(value => value.name)

        // console.log("assoPlayersName: " + assoPlayersName);
        // const listPlayerEl = newCreateListFromMap(assoPlayersName);

        // let ul = document.createElement('ul');
        //
        // row.insertCell().appendChild(ul);
        //
        // players.forEach(function (item) {
        //     let li = document.createElement('li');
        //     ul.appendChild(li);
        //
        //     li.innerHTML += item;
        // });



        // row.insertCell().appendChild(listPlayerEl);
        // row.insertCell().innerHTML = '<ul><li>' + players.join("</li><li>"); + '</li></ul>';
        // console.log(club.clubPlayers);
        // row.insertCell().textContent = club.association;
        // row.insertCell().textContent = club.coach;
        // row.insertCell().textContent = club.players.length;
        // row.insertCell().textContent = club.members.length;

    }
    showProgressBar( "hide");
}

