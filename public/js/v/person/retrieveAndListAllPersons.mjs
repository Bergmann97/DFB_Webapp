/**
 * @fileOverview  Contains various view functions for the use case listPersons
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */

import Person, {GenderEL, PersonTypeEL} from "../../m/Person.mjs";
import { showProgressBar } from "../../../lib/util.mjs";

/**********************************************************************
 Declare variables for accessing UI elements
 **********************************************************************/
const selectOrderEl = document.querySelector("main > div > div > label > select");
const tableBodyEl = document.querySelector("table#persons > tbody");

/***************************************************************
 Create table view
 ***************************************************************/
// invoke list ordered by isbn (default)
await renderList( "personId");

/***************************************************************
 Handle order selector
 ***************************************************************/
selectOrderEl.addEventListener("change", async function (e) {
    // invoke list with order selected
    await renderList( e.target.value);
});

/***************************************************************
 Render list of all person records
 ***************************************************************/
async function renderList( order) {
    tableBodyEl.innerHTML = "";
    showProgressBar("show");
    // load a list of all person records
    const personRecords = await Person.retrieveAll(order);
    // for each person, create a table row with a cell for each attribute
    for (let person of personRecords) {
        let row = tableBodyEl.insertRow();
        row.insertCell().textContent = person.personId;
        row.insertCell().textContent = person.name;
        row.insertCell().textContent = person.dateOfBirth;

        row.insertCell().textContent = GenderEL.labels[person.gender - 1];
        row.insertCell().textContent = PersonTypeEL.stringify(person.type);

    }
    showProgressBar( "hide");
}

export async function setupUserInterface() {
    const tableBodyEl = document.querySelector("table#persons>tbody");

    // fillSelectWithOptions(selectTypeEl, PersonTypeEL.labels);

    // document.getElementById("association").remove();
    // load a list of all person records from Firestore
    const personRecords = await Person.retrieveAll();
    // for each person, create a table row with a cell for each attribute
    for (const personRec of personRecords) {
        const row = tableBodyEl.insertRow();
        row.insertCell().textContent = personRec.personId;
        row.insertCell().textContent = personRec.name;
        row.insertCell().textContent = personRec.dateOfBirth;

        row.insertCell().textContent = GenderEL.enumLitNames[personRec.gender - 1];
        row.insertCell().textContent = PersonTypeEL.stringify(personRec.type);
        // console.log("personRec:" + personRec +  "/" + personRec.type + typeof personRec.type);
    }

    // selectTypeEl.addEventListener("change", async function () {
    //     let type = selectTypeEl.value;
    //
    //     if (typeof type === 'string') {
    //         type = parseInt(type);
    //     }
    //     console.log("type: " + type + "/type: " + typeof type);
    //     if (type+1 === PersonTypeEL.MEMBER) {
    //         console.log("MEMBER");
    //         document.getElementById("type").remove();
    //     } else if (type+1 === PersonTypeEL.PLAYER) {
    //         console.log("PLAYER");
    //     } else if (type+1 === PersonTypeEL.COACH) {
    //         console.log("COACH");
    //     } else if (type+1 === PersonTypeEL.PRESIDENT) {
    //         console.log("PRESIDENT");
    //     } else {
    //         console.log("ALL");
    //     }
    //
    // });

  }