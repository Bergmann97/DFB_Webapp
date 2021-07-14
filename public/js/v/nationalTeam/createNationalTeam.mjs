/**
 * @fileOverview  View methods for the use case "create national team"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
import {GenderEL} from "../../m/Person.mjs";

import {
    createChoiceWidget,
    showProgressBar
} from "../../../lib/util.mjs";
import NationalTeam from "../../m/NationalTeam.mjs";

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms['NationalTeam'],
    genderFieldsetEl = formEl.querySelector("fieldset[data-bind='gender']"),
    // selectCoachEl = formEl.selectCoach,
    // selectPlayersEl = formEl.selectPlayers,
    saveButton = formEl.commit;


/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the gender radio button group
createChoiceWidget( genderFieldsetEl, "gender", [],
    "radio", GenderEL.labels);

// const coachRecords = await Coach.retrieveAll();
// const playerRecords = await Player.retrieveAll();
//
// // fillSelectWithOptions(selectCoachEl,
// //     await Coach.retrieveAll().then(value=>value),
// //     "personId", "name");
//
//
// for (const coachRecord of coachRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = coachRecord.name;
//     optionEl.value = coachRecord.personId;
//
//     selectCoachEl.add( optionEl, null);
// }
//
// for (const playerRecord of playerRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = playerRecord.name + " (" +
//         GenderEL.enumLitNames[playerRecord.gender - 1] + ")";
//     optionEl.value = playerRecord.personId;
//
//     selectPlayersEl.add( optionEl, null);
// }

/***************************************************************
 Add event listeners for responsive validation
 ***************************************************************/
// add event listeners for responsive validation
formEl.teamId.addEventListener("input", function () {
    formEl.teamId.setCustomValidity( NationalTeam.checkTeamId
    ( formEl.teamId.value).message);
});
genderFieldsetEl.addEventListener("click", function () {
    formEl.gender[0].setCustomValidity(
        (!genderFieldsetEl.getAttribute("data-value")) ?
            "A gender must be selected!":"" );
});
// selectCoachEl.addEventListener("click", function () {
//     formEl.selectCoach.setCustomValidity(
//         formEl.selectCoach.value.length > 0 ? "" :
//             "No coach selected!"
//     );
// });
//
// selectPlayersEl.addEventListener("click", function () {
//     formEl.selectPlayers.setCustomValidity(
//         formEl.selectPlayers.value.length >= 11 ? "" :
//             "11 Players should be selected!"
//     );
// });

/******************************************************************
 Add further event listeners, especially for the save/submit button
 ******************************************************************/
// set an event handler for the submit/save button
saveButton.addEventListener("click", handleSaveButtonClickEvent);

// neutralize the submit event
formEl.addEventListener( 'submit', function (e) {
    e.preventDefault();
    formEl.reset();
});

// set a handler for the event when the browser window/tab is closed
// window.addEventListener("beforeunload", Person.saveAll);

async function handleSaveButtonClickEvent() {
    const formEl = document.forms['NationalTeam']

    const slots = {
        teamId: formEl.teamId.value,
        gender: genderFieldsetEl.getAttribute("data-value")
        // coach_id: formEl.selectCoach.value,
        // playerIdRefs: [],
    };

    showProgressBar( "show");
    formEl.teamId.setCustomValidity(( await NationalTeam.checkTeamIdAsId(slots.teamId)).message);
    formEl.gender[0].setCustomValidity( NationalTeam.checkGender( slots.gender).message);
    // formEl.coach_id.setCustomValidity( NationalTeam.checkCoach( slots.coach_id).message);

    // formEl.playerIdRefs[0].setCustomValidity(
    //     NationalTeam.checkPlayer( slots.type).message);

    // get the list of selected players
    // const selPlayerOptions = formEl.selectPlayers.selectedOptions;
    if (formEl.checkValidity()) {
        // // construct a list of actor ID references
        // for (const opt of selPlayerOptions) {
        //     slots.playerIdRefs.push( opt.value);
        // }
        await NationalTeam.add( slots);
        formEl.reset();
    }
    showProgressBar( "hide");
}