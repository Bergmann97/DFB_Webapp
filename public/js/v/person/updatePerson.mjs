/**
 * @fileOverview  View methods for the use case "update person"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
import Person, {GenderEL, PersonTypeEL} from "../../m/Person.mjs";
import {createChoiceWidget, fillSelectWithOptions} from "../../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
const personRecords = await Person.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Person"],
    updateButton = formEl.commit,
    selectPersonEl = formEl.selectPerson,
    typeFieldsetEl  = formEl.querySelector("fieldset[data-bind='type']"),
    genderFieldsetEl = formEl.querySelector("fieldset[data-bind='gender']");

/***************************************************************
 Initialize subscription to DB-UI synchronization
 ***************************************************************/
let cancelSyncDBwithUI = null;

/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the person selection list
fillSelectWithOptions( selectPersonEl, personRecords, {valueProp:"personId", displayProp:"name"});

// when a person is selected, fill the form with its data
selectPersonEl.addEventListener("change", async function () {
    const personId = selectPersonEl.value;
    if (personId) {
        // retrieve up-to-date person record
        const personRec = await Person.retrieve( personId);
        formEl.personId.value = personRec.personId;
        formEl.name.value = personRec.name;
        formEl.dateOfBirth.value = personRec.dateOfBirth;

        // set up the gender radio button group
        createChoiceWidget( genderFieldsetEl, "gender",
            [personRec.gender], "radio", GenderEL.labels);

        // set up the type check box
        createChoiceWidget( typeFieldsetEl, "type", personRec.type,
            "checkbox", PersonTypeEL.labels);

    } else {
        formEl.reset();
    }
});

// set up listener to document changes on selected person record
selectPersonEl.addEventListener("change", async function () {
    cancelSyncDBwithUI = await Person.syncDBwithUI( selectPersonEl.value);
});

/***************************************************************
 Add event listeners for responsive validation
 ***************************************************************/
formEl.name.addEventListener("input", function () {
    formEl.name.setCustomValidity(
        Person.checkName( formEl.name.value).message);
});
formEl.dateOfBirth.addEventListener("input", function () {
    formEl.dateOfBirth.setCustomValidity(
        Person.checkDateOfBirth( formEl.dateOfBirth.value).message);
});
genderFieldsetEl.addEventListener("click", function () {
    formEl.gender[0].setCustomValidity(
        (!genderFieldsetEl.getAttribute("data-value")) ? "A gender must be selected!":"" );
});
typeFieldsetEl.addEventListener("click", function () {
    formEl.type[0].setCustomValidity(
        (!typeFieldsetEl.getAttribute("data-value")) ?
            "A type must be selected!":"" );
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
    const formEl = document.forms["Person"],
        selectPersonEl = formEl.selectPerson,
        personId = selectPersonEl.value;
    if (!personId) return;
    const slots = {
        personId: formEl.personId.value,
        name: formEl.name.value,
        dateOfBirth: formEl.dateOfBirth.value,
        gender: genderFieldsetEl.getAttribute("data-value"),
        type: JSON.parse( typeFieldsetEl.getAttribute("data-value"))
    };
    // set error messages in case of constraint violations
    formEl.name.setCustomValidity( Person.checkName( slots.name).message);
    formEl.dateOfBirth.setCustomValidity( Person.checkDateOfBirth( slots.dateOfBirth).message);
    formEl.gender[0].setCustomValidity( Person.checkGender( slots.gender).message);
    formEl.type[0].setCustomValidity( Person.checkTypes( slots.type).message);

    if (formEl.checkValidity()) {
        Person.update( slots);
        // update the selection list option
        selectPersonEl.options[selectPersonEl.selectedIndex].text = slots.name;
        formEl.reset();
    }
}