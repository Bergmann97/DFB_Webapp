/**
 * @fileOverview  Contains various view functions for the use case "list football clubs"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */

/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import FootballClub from "../../m/FootballClub.mjs";
import {GenderEL} from "../../m/Person.mjs";
import {
    showProgressBar
} from "../../../lib/util.mjs";

/**********************************************************************
 Declare variables for accessing UI elements
 **********************************************************************/
const selectOrderEl = document.querySelector("main > div > div > label > select");
const tableBodyEl = document.querySelector("table#clubs > tbody");

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
    const clubRecords = await FootballClub.retrieveAll(order);
    // for each football club, create a table row with a cell for each attribute
    for (let club of clubRecords) {
        let row = tableBodyEl.insertRow();
        row.insertCell().textContent = club.clubId;
        row.insertCell().textContent = club.name;
        row.insertCell().textContent = GenderEL.labels[club.gender - 1];
        // row.insertCell().textContent = club.association;
        // row.insertCell().textContent = club.coach;
        // row.insertCell().textContent = club.players.length;
        // row.insertCell().textContent = club.members.length;

    }
    showProgressBar( "hide");
}

