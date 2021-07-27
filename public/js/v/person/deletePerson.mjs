/**
 * @fileOverview  Contains various view functions for the use case deletePerson
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/

import Person from "../../m/Person.mjs";
import Member from "../../m/Member.mjs";
import Player from "../../m/Player.mjs";
import Coach from "../../m/Coach.mjs";
import President from "../../m/President.mjs";

import { fillSelectWithOptions } from "../../../lib/util.mjs";
import FootballClub from "../../m/FootballClub.mjs";

/***************************************************************
 Load data
 ***************************************************************/
const personRecords = await Person.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Person"],
    deleteButton = formEl.commit,
    selectPersonEl = formEl["selectPerson"];

/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the person selection list
fillSelectWithOptions( selectPersonEl, personRecords,
    {valueProp:"personId", displayProp:"name"});
// for (const personRec of personRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = personRec.name;
//     optionEl.value = personRec.personId;
//     selectPersonEl.add( optionEl, null);
// }

/******************************************************************
 Add further event listeners, especially for the save/delete button
 ******************************************************************/
// Set an event handler for the delete button
deleteButton.addEventListener("click",
    handleDeleteButtonClickEvent);

const memberRecords = await Member.retrieveAll().then(value=>value);
const playerRecords = await Player.retrieveAll().then(value=>value);
const coachRecords = await Coach.retrieveAll().then(value=>value);
const presidentRecords = await President.retrieveAll().then(value=>value);



// },
// Event handler for deleting a book
async function handleDeleteButtonClickEvent() {
    // const selectPersonEl = document.forms['Person'].selectPerson;
    const personId = selectPersonEl.value;

    if (!personId) return;

    if (confirm("Do you really want to delete this person record?")) {
        await Person.destroy(personId);

        for (let memberRecord of memberRecords) {
            if (selectPersonEl.value === memberRecord.personId) {
                await Member.destroy(personId);
            }
        }
        for (let playerRecord of playerRecords) {
            if (selectPersonEl.value === playerRecord.personId) {
                await Player.destroy(personId);
            }
        }
        for (let coachRecord of coachRecords) {
            if (selectPersonEl.value === coachRecord.personId) {
                await Coach.destroy(personId);
            }
        }
        for (let presidentRecord of presidentRecords) {
            if (selectPersonEl.value === presidentRecord.personId) {
                await President.destroy(personId);
            }
        }
        // remove deleted person from select options
        selectPersonEl.remove( selectPersonEl.selectedIndex);
    }
}
// }