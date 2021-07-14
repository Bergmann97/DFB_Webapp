/**
 * @fileOverview  View methods for the use case "update national team"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
import NationalTeam from "../../m/NationalTeam.mjs";
import {GenderEL} from "../../m/Person.mjs";
import {createChoiceWidget, fillSelectWithOptions} from "../../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
const teamRecords = await NationalTeam.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["NationalTeam"],
    genderFieldsetEl = formEl.querySelector("fieldset[data-bind='gender']"),
    selectTeamEl = formEl.selectTeam,
    // selectCoachEl = formEl.selectCoach,
    // selectPlayersEl = document.getElementById("players"),
    updateButton = formEl.commit;

/***************************************************************
 Initialize subscription to DB-UI synchronization
 ***************************************************************/
let cancelSyncDBwithUI = null;

/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the national team selection list
fillSelectWithOptions( selectTeamEl, teamRecords, {valueProp:"teamId", displayProp:"gender"});

// when a national team is selected, fill the form with its data
selectTeamEl.addEventListener("change", async function () {
    const teamId = selectTeamEl.value;
    if (teamId) {
        // retrieve up-to-date national team record
        const teamRec = await NationalTeam.retrieve( teamId);
        formEl.teamId.value = teamId.teamId;

        // set up the gender radio button group
        createChoiceWidget( genderFieldsetEl, "gender",
            [teamRec.gender], "radio", GenderEL.labels);

    } else {
        formEl.reset();
    }
});

// set up listener to document changes on selected national team record
selectTeamEl.addEventListener("change", async function () {
    cancelSyncDBwithUI = await NationalTeam.syncDBwithUI( selectTeamEl.value);
});

/***************************************************************
 Add event listeners for responsive validation
 ***************************************************************/
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
    const formEl = document.forms["NationalTeam"],
        selectTeamEl = formEl.selectTeam,
        teamId = selectTeamEl.value;
    if (!teamId) return;
    const slots = {
        teamId: formEl.teamId.value,
        gender: genderFieldsetEl.getAttribute("data-value")
    };
    // set error messages in case of constraint violations
    formEl.gender[0].setCustomValidity( NationalTeam.checkGender( slots.gender).message);

    if (formEl.checkValidity()) {
        NationalTeam.update( slots);
        // update the selection list option
        selectTeamEl.options[selectTeamEl.selectedIndex].text = slots.teamId;
        formEl.reset();
    }
}