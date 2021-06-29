/**
 * @fileOverview  Contains various view functions for the use case listPersons
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */

import Person, {GenderEL, PersonTypeEL} from "../../m/Person.mjs";
import {fillSelectWithOptions} from "../../../lib/util.mjs";

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