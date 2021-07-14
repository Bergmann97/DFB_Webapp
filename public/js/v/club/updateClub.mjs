/**
 * @fileOverview  View methods for the use case "update football club"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
import FootballClub from "../../m/FootballClub.mjs";
import {GenderEL} from "../../m/Person.mjs";
import {createChoiceWidget, fillSelectWithOptions} from "../../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
const clubRecords = await FootballClub.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Club"],
    selectClubEl = formEl.selectClub,
    genderFieldsetEl = formEl.querySelector("fieldset[data-bind='gender']"),
    // selectAssoEl = formEl.selectAsso,
    // selectCoachEl = formEl.selectCoach,
    // selectPlayersEl = document.getElementById("players"),
    // selectMembersEl = document.getElementById("members"),
    updateButton = formEl.commit;

/***************************************************************
 Initialize subscription to DB-UI synchronization
 ***************************************************************/
let cancelSyncDBwithUI = null;

/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the football club selection list
fillSelectWithOptions( selectClubEl, clubRecords, {valueProp:"clubId", displayProp:"name"});

// when a football club is selected, fill the form with its data
selectClubEl.addEventListener("change", async function () {
    const clubId = selectClubEl.value;
    if (clubId) {
        // retrieve up-to-date football club record
        const clubRec = await FootballClub.retrieve( clubId);
        formEl.clubId.value = clubRec.clubId;
        formEl.name.value = clubRec.name;

        // set up the gender radio button group
        createChoiceWidget( genderFieldsetEl, "gender",
            [clubRec.gender], "radio", GenderEL.labels);

    } else {
        formEl.reset();
    }
});

// set up listener to document changes on selected football club record
selectClubEl.addEventListener("change", async function () {
    cancelSyncDBwithUI = await FootballClub.syncDBwithUI( selectClubEl.value);
});

/***************************************************************
 Add event listeners for responsive validation
 ***************************************************************/
formEl.name.addEventListener("input", function () {
    formEl.name.setCustomValidity(
        FootballClub.checkName( formEl.name.value).message);
});
genderFieldsetEl.addEventListener("click", function () {
    formEl.gender[0].setCustomValidity(
        (!genderFieldsetEl.getAttribute("data-value")) ? "A gender must be selected!":"" );
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
    const formEl = document.forms["Club"],
        selectClubEl = formEl.selectClub,
        clubId = selectClubEl.value;
    if (!clubId) return;
    const slots = {
        clubId: formEl.clubId.value,
        name: formEl.name.value,
        gender: genderFieldsetEl.getAttribute("data-value")
    };
    // set error messages in case of constraint violations
    formEl.name.setCustomValidity( FootballClub.checkName( slots.name).message);
    formEl.gender[0].setCustomValidity( FootballClub.checkGender( slots.gender).message);

    if (formEl.checkValidity()) {
        FootballClub.update( slots);
        // update the selection list option
        selectClubEl.options[selectClubEl.selectedIndex].text = slots.name;
        formEl.reset();
    }
}