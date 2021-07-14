/**
 * @fileOverview  Contains various view functions for the use case "list football associations"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */

import FootballAssociation  from "../../m/FootballAssociation.mjs";
import {
    showProgressBar
} from "../../../lib/util.mjs";
/**********************************************************************
 Declare variables for accessing UI elements
 **********************************************************************/
const selectOrderEl = document.querySelector("main > div > div > label > select");
const tableBodyEl = document.querySelector("table#associations > tbody");

/***************************************************************
 Create table view
 ***************************************************************/
// invoke list ordered by assoId (default)
await renderList( "assoId");

/***************************************************************
 Handle order selector
 ***************************************************************/
selectOrderEl.addEventListener("change", async function (e) {
    // invoke list with order selected
    await renderList( e.target.value);
});
/***************************************************************
 Render list of all football association records
 ***************************************************************/
async function renderList( order) {
    tableBodyEl.innerHTML = "";
    showProgressBar("show");
    // load a list of all football association records
    const assoRecords = await FootballAssociation.retrieveAll(order);

    // for each football association, create a table row with a cell for each attribute
    for (let asso of assoRecords) {
        let row = tableBodyEl.insertRow();
        row.insertCell().textContent = asso.assoId;
        row.insertCell().textContent = asso.name;
        // row.insertCell().textContent = asso.president;
        // row.insertCell().textContent = asso.supAssociations?
        //     asso.supAssociations.length : "";
        // row.insertCell().textContent = asso.members?
        //     asso.members.length : "";
        // row.insertCell().textContent = asso.clubs?
        //     asso.clubs.length : "";
    }
    showProgressBar( "hide");
}
