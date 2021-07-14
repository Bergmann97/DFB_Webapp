/**
 * @fileOverview  View methods for the use case "update football association"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
import FootballAssociation from "../../m/FootballAssociation.mjs";
import {createChoiceWidget, fillSelectWithOptions} from "../../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
const assoRecords = await FootballAssociation.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Association"],
    selectAssoEl = formEl.selectAssociation,
    // selectPresidentEl = formEl.selectPresident,
    // selectSupAssosEl = formEl.selectSupAssos,
    // selectMembersEl = formEl.selectMembers,
    // selectClubsEl = formEl.selectClubs,
    updateButton = formEl.commit;

/***************************************************************
 Initialize subscription to DB-UI synchronization
 ***************************************************************/
let cancelSyncDBwithUI = null;

/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the football association selection list
fillSelectWithOptions( selectAssoEl, assoRecords, {valueProp:"assoId", displayProp:"name"});

// when a football association is selected, fill the form with its data
selectAssoEl.addEventListener("change", async function () {
    const assoId = selectAssoEl.value;
    if (assoId) {
        // retrieve up-to-date football association record
        const assoRec = await FootballAssociation.retrieve( assoId);
        formEl.assoId.value = assoRec.assoId;
        formEl.name.value = assoRec.name;

    } else {
        formEl.reset();
    }
});

// set up listener to document changes on selected football association record
selectAssoEl.addEventListener("change", async function () {
    cancelSyncDBwithUI = await FootballAssociation.syncDBwithUI( selectAssoEl.value);
});

/***************************************************************
 Add event listeners for responsive validation
 ***************************************************************/
formEl.name.addEventListener("input", function () {
    formEl.name.setCustomValidity(
        FootballAssociation.checkName( formEl.name.value).message);
});

/******************************************************************
 Add further event listeners, especially for the save/delete button
 ******************************************************************/
// Set an event handler for the submit/save button
updateButton.addEventListener("click", handleSubmitButtonClickEvent);
// neutralize the submit event
formEl.addEventListener( "submit", function (e) {
    e.preventDefault();
});
// Set event cancel of DB-UI sync when the browser window/tab is closed
window.addEventListener("beforeunload", function () {
    cancelSyncDBwithUI();
});

/**
 * check data and invoke update
 */
async function handleSubmitButtonClickEvent() {
    const formEl = document.forms["Association"],
        selectAssoEl = formEl.selectAssociation,
        assoId = selectAssoEl.value;
    if (!assoId) return;
    const slots = {
        assoId: formEl.assoId.value,
        name: formEl.name.value,
    };
    // set error messages in case of constraint violations
    formEl.name.setCustomValidity( FootballAssociation.checkName( slots.name).message);

    if (formEl.checkValidity()) {
        FootballAssociation.update( slots);
        // update the selection list option
        selectAssoEl.options[selectAssoEl.selectedIndex].text = slots.name;
        formEl.reset();
    }
}