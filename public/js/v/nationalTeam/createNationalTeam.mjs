/**
 * @fileOverview  View methods for the use case "create person"
 * @authors Gerd Wagner & Juan-Francisco Reyes
 */
import FootballClub from "../../m/FootballClub.mjs";
import Person, {GenderEL} from "../../m/Person.mjs";

import {
    undisplayAllSegmentFields,
    displaySegmentFields,
    createChoiceWidget,
    fillSelectWithOptionsClub, showProgressBar, fillSelectWithOptions, createMultiSelectionWidget
} from "../../../lib/util.mjs";
import Coach from "../../m/Coach.mjs";
import Player from "../../m/Player.mjs";
import NationalTeam from "../../m/NationalTeam.mjs";
import Member from "../../m/Member.mjs";
import {MandatoryValueConstraintViolation} from "../../../lib/errorTypes.mjs";

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms['Team'],
    genderFieldsetEl = formEl.querySelector("fieldset[data-bind='gender']"),
    selectCoachEl = formEl.selectCoach,
    // selectPlayersEl = formEl.selectPlayers,
    playersCrtWidget = formEl.querySelector(
        ".MultiSelectionWidget"),
    saveButton = formEl.commit;
createMultiSelectionWidget( playersCrtWidget, [],
    "crtPlayers", "Enter ID", 11);
formEl.reset();


/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the gender radio button group
createChoiceWidget( genderFieldsetEl, "gender", [],
    "radio", GenderEL.labels);

const coachRecords = await Coach.retrieveAll();
// const playerRecords = await Player.retrieveAll();
//
// // fillSelectWithOptions(selectCoachEl,
// //     await Coach.retrieveAll().then(value=>value),
// //     "personId", "name");
//
//
for (const coachRecord of coachRecords) {
    const optionEl = document.createElement("option");
    optionEl.text = coachRecord.name;
    optionEl.value = coachRecord.personId;

    selectCoachEl.add( optionEl, null);
}
//
// for (const playerRecord of playerRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = playerRecord.name + " (" +
//         GenderEL.enumLitNames[playerRecord.gender - 1] + ")";
//     optionEl.value = playerRecord.personId;
//
//     selectPlayersEl.add( optionEl, null);
// }
genderFieldsetEl.addEventListener("click", async function () {
    let responseValidation = await NationalTeam.checkGenderAsId( genderFieldsetEl.getAttribute("data-value"));
    formEl.gender[0].setCustomValidity( responseValidation.message);
});
/***************************************************************
 Add event listeners for responsive validation
 ***************************************************************/
// add event listeners for responsive validation
// formEl.teamId.addEventListener("input", function () {
//     formEl.teamId.setCustomValidity( NationalTeam.checkTeamId
//     ( formEl.teamId.value).message);
// });
genderFieldsetEl.addEventListener("click", function () {
    formEl.gender[0].setCustomValidity(
        (!genderFieldsetEl.getAttribute("data-value")) ?
            "A gender must be selected!":"" );
});
selectCoachEl.addEventListener("click", function () {
    formEl.selectCoach.setCustomValidity(
        formEl.selectCoach.value.length > 0 ? "" :
            "No coach selected!"
    );
});
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
    const formEl = document.forms['Team'],
        playersListEl = playersCrtWidget.querySelector("ul"),
        playersSpanEl = document.querySelector("div.widget > label > span");

    const slots = {
        // teamId: formEl.teamId.value,
        gender: parseInt(genderFieldsetEl.getAttribute("data-value")),
        coach_id: parseInt(formEl.selectCoach.value),
        playerIdRefs: []
    };

    showProgressBar( "show");
    const selectedGender = genderFieldsetEl.getAttribute("data-value");
    // console.log(slots.gender + "/type: " + typeof slots.gender);
    // formEl.teamId.setCustomValidity(( await NationalTeam.checkTeamIdAsId(slots.teamId)).message);
    // selectedGender.setCustomValidity( await NationalTeam.checkGenderAsId( slots.gender).message);

    let responseValidation = await NationalTeam.checkGenderAsId( genderFieldsetEl.getAttribute("data-value"));
    formEl.gender[0].setCustomValidity( responseValidation.message);

    formEl.selectCoach.setCustomValidity(
        (formEl.selectCoach.value.length > 0) ? "" : "No coach selected!"
    );

    // get the list of selected players
    for (const el of playersListEl.children) {
        slots.playerIdRefs.push( parseInt(el.getAttribute("data-value")));
    }
    console.log(slots.playerIdRefs + "/length: " + slots.playerIdRefs.length);
    if (slots.playerIdRefs.length > 0) {
        for (const p of slots.playerIdRefs) {
            // console.log("ac: " + ac + "/type: " + typeof ac);
            let responseValidation = await NationalTeam.checkPlayer(p);
            if (responseValidation.message) {
                formEl["crtPlayers"].setCustomValidity( responseValidation.message);
                break;
            }  else formEl["crtPlayers"].setCustomValidity( "");
        }
    }
    // else{
    //     formEl["crtPlayers"].setCustomValidity( "");
    // }

    // get the list of selected players
    // const selPlayerOptions = formEl.selectPlayers.selectedOptions;
    if (formEl.checkValidity()) {
        // // construct a list of actor ID references
        // for (const opt of selPlayerOptions) {
        //     slots.playerIdRefs.push( opt.value);
        // }
        if (slots.playerIdRefs.length >= 11) {

            await NationalTeam.add( slots);
            playersListEl.innerHTML = "";
            formEl.reset();
        } else {
            alert("At least 11 players must be selected!");
        }

    }
    showProgressBar( "hide");
}