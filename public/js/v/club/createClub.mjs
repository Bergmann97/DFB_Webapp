/**
 * @fileOverview  View methods for the use case "create football club"
 * @authors Gerd Wagner & Juan-Francisco Reyes
 */
import FootballClub from "../../m/FootballClub.mjs";
import Person, {GenderEL} from "../../m/Person.mjs";

import {
    undisplayAllSegmentFields,
    displaySegmentFields,
    createChoiceWidget,
    fillSelectWithOptionsClub, showProgressBar, fillSelectWithOptions
} from "../../../lib/util.mjs";
import FootballAssociation from "../../m/FootballAssociation.mjs";
import Coach from "../../m/Coach.mjs";
import Player from "../../m/Player.mjs";
import Member from "../../m/Member.mjs";

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms['Club'],
    genderFieldsetEl = formEl.querySelector("fieldset[data-bind='gender']"),
    selectAssoEl = formEl.selectAsso,
    // selectCoachEl = formEl.selectCoach,
    // selectPlayersEl = formEl.selectPlayers,
    // selectMembersEl = formEl.selectMembers,
    saveButton = formEl.commit;


/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the gender radio button group
createChoiceWidget( genderFieldsetEl, "gender", [],
    "radio", GenderEL.labels);


// const coachRecords = await Coach.retrieveAll();
// const playerRecords = await Player.retrieveAll();
// const memberRecords = await Member.retrieveAll();
//
// fillSelectWithOptions(selectAssoEl,
//     await FootballAssociation.retrieveAll().then(value=>value),
//     "assoId", "name");
// // load all football association records
const assoRecords = await FootballAssociation.retrieveAll();
for (const assoRec of assoRecords) {
    const optionEl = document.createElement("option");
    optionEl.text = assoRec.name;
    optionEl.value = assoRec.assoId;

    selectAssoEl.add( optionEl, null);
}
// // fillSelectWithOptions(selectCoachEl,
// //     await Coach.retrieveAll().then(value=>value),
// //     "personId", "name");
//
// for (const assoRecord of assoRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = assoRecord.name;
//     optionEl.value = assoRecord.assoId;
//
//     selectCoachEl.add( optionEl, null);
// }
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
//
// for (const memberRecord of memberRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = memberRecord.name + " (" +
//         GenderEL.enumLitNames[memberRecord.gender - 1] + ")";
//     optionEl.value = memberRecord.personId;
//
//     selectMembersEl.add( optionEl, null);
// }

/***************************************************************
 Add event listeners for responsive validation
 ***************************************************************/
// add event listeners for responsive validation
formEl.clubId.addEventListener("input", function () {
    formEl.clubId.setCustomValidity( FootballClub.checkClubId
    ( formEl.clubId.value).message);
});
formEl.name.addEventListener("input", function () {
    formEl.name.setCustomValidity( FootballClub.checkName
    ( formEl.name.value).message);
});
genderFieldsetEl.addEventListener("click", function () {
    formEl.gender[0].setCustomValidity(
        (!genderFieldsetEl.getAttribute("data-value")) ?
            "A gender must be selected!":"" );
});
selectAssoEl.addEventListener("click", function () {
    formEl.selectAsso.setCustomValidity(
        formEl.selectAsso.value.length > 0 ? "" :
            "No association selected!"
    );
});
//
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
    const formEl = document.forms['Club']

    const slots = {
        clubId: formEl.clubId.value,
        name: formEl.name.value,
        gender: genderFieldsetEl.getAttribute("data-value"),
        association_id: parseInt(formEl.selectAsso.value),
        // coach_id: formEl.selectCoach.value,
        //
        // playerIdRefs: [],
        // memberIdRefs: []
    };
    // if (formEl.selectMembers.value) {
    //     slots.memberIdRefs = [];
    // }

    showProgressBar( "show");
    formEl.clubId.setCustomValidity(( await FootballClub.checkClubIdAsId(slots.clubId)).message);
    formEl.name.setCustomValidity( FootballClub.checkName( slots.name).message);
    formEl.gender[0].setCustomValidity( FootballClub.checkGender( slots.gender).message);
    formEl.selectAsso.setCustomValidity(
        (formEl.selectAsso.value.length > 0) ? "" : "No association selected!"
    );
    // formEl.association.setCustomValidity( FootballClub.checkAssociation( slots.association).message);
    // formEl.coach_id.setCustomValidity( FootballClub.checkCoach( slots.coach_id).message);

    // formEl.playerIdRefs[0].setCustomValidity(
    //     FootballClub.checkPlayer( slots.type).message);

    // get the list of selected players
    // const selPlayerOptions = formEl.selectPlayers.selectedOptions;
    if (formEl.checkValidity()) {
        // // construct a list of actor ID references
        // for (const opt of selPlayerOptions) {
        //     slots.playerIdRefs.push( opt.value);
        // }
        await FootballClub.add( slots);
        selectAssoEl.innerHTML = "";
        formEl.reset();
    }
    showProgressBar( "hide");
}
// }