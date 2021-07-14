/**
 * @fileOverview  Contains various view functions for the use case "list national teams"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */

/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import NationalTeam from "../../m/NationalTeam.mjs";
import {GenderEL} from "../../m/Person.mjs";
import {
    showProgressBar
} from "../../../lib/util.mjs";

/**********************************************************************
 Declare variables for accessing UI elements
 **********************************************************************/
// const selectOrderEl = document.querySelector("main > div > div > label > select");
const tableBodyEl = document.querySelector("table#teams > tbody");

/***************************************************************
 Create table view
 ***************************************************************/
await renderList();

/***************************************************************
 Render list of all national team records
 ***************************************************************/
async function renderList() {
    tableBodyEl.innerHTML = "";
    showProgressBar("show");
    // load a list of all national team records
    const teamRecords = await NationalTeam.retrieveAll();
    // for each national team, create a table row with a cell for each attribute
    for (let team of teamRecords) {
        let row = tableBodyEl.insertRow();
        // row.insertCell().textContent = team.teamId;
        row.insertCell().textContent = GenderEL.labels[team.gender - 1];
        // row.insertCell().textContent = club.coach;
        // row.insertCell().textContent = club.players;

    }
    showProgressBar( "hide");
}

