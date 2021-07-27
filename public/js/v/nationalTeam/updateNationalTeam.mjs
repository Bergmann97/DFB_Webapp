/**
 * @fileOverview  View methods for the use case "update football club"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
import NationalTeam from "../../m/NationalTeam.mjs";
import {GenderEL} from "../../m/Person.mjs";
import {
    createChoiceWidget,
    createMultiSelectionWidget,
    fillSelectWithOptions,
    fillSelectWithOptionsGender
} from "../../../lib/util.mjs";
import Coach from "../../m/Coach.mjs";
import Member from "../../m/Member.mjs";
import President from "../../m/President.mjs";

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
    selectCoachEl = formEl.selectCoach,
    playersUpWidget = formEl.querySelector(".MultiSelectionWidget"),
    // selectPlayersEl = document.getElementById("players"),
    updateButton = formEl.commit;
formEl.reset();
/***************************************************************
 Initialize subscription to DB-UI synchronization
 ***************************************************************/
let cancelSyncDBwithUI = null;

/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the national team selection list
fillSelectWithOptionsGender( selectTeamEl, teamRecords, "gender");

const coachRecords = await Coach.retrieveAll();
for (const coachRecord of coachRecords) {
    const optionEl = document.createElement("option");
    optionEl.text = coachRecord.name;
    optionEl.value = coachRecord.personId;

    selectCoachEl.add( optionEl, null);
}


// when a national team is selected, fill the form with its data
selectTeamEl.addEventListener("change", async function () {
    const gender = selectTeamEl.value;

    if (gender) {
        // retrieve up-to-date national team record
        const teamRec = await NationalTeam.retrieve( gender);

        // set up the gender radio button group
        createChoiceWidget( genderFieldsetEl, "gender",
            [teamRec.gender], "radio", GenderEL.labels);
        genderFieldsetEl.disabled = true;

        selectCoachEl.value = teamRec.coach;

        const players = await NationalTeam.retrieve(gender).then(value => value.players);
        console.log(players);
        if (players) {
            createMultiSelectionWidget(playersUpWidget, players,
                "upPlayers", "Enter ID", 11);
        }

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
// genderFieldsetEl.addEventListener("click", function () {
//     formEl.gender[0].setCustomValidity(
//         (!genderFieldsetEl.getAttribute("data-value")) ? "A gender must be selected!":"" );
// });
selectCoachEl.addEventListener("click", function () {
    formEl.selectCoach.setCustomValidity(
        formEl.selectCoach.value.length > 0 ? "" :
            "No coach selected!"
    );
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
    cancelSyncDBwithUI;
});

/**
 * check data and invoke update
 */
async function handleSubmitButtonClickEvent() {
    const formEl = document.forms["NationalTeam"],
        selectTeamEl = formEl.selectTeam,
        gender = selectTeamEl.value,
        playersListEl = playersUpWidget.querySelector("ul");

    if (!gender) return;
    const slots = {
        gender: parseInt(selectTeamEl.value),
        coach_id: parseInt(formEl.selectCoach.value)
        // gender: genderFieldsetEl.getAttribute("data-value")
    };

    // set error messages in case of constraint violations
    // formEl.gender[0].setCustomValidity( NationalTeam.checkGender( slots.gender).message);

    formEl.selectCoach.setCustomValidity(
        (formEl.selectCoach.value.length > 0) ? "" : "No coach selected!"
    );

    // construct playerIdRefs-ToAdd/ToRemove lists
    const playerIdRefsToAdd = [], playerIdRefsToRemove = [];
    for (const playerItemEl of playersListEl.children) {
        if (playerItemEl.classList.contains("removed")) {
            playerIdRefsToRemove.push(parseInt(playerItemEl.getAttribute("data-value")));
        }
        if (playerItemEl.classList.contains("added")) {
            playerIdRefsToAdd.push(parseInt(playerItemEl.getAttribute("data-value")));
        }
    }
    // if the add/remove list is non-empty, create a corresponding slot
    if (playerIdRefsToRemove.length > 0) {
        slots.playerIdRefsToRemove = playerIdRefsToRemove;
    }
    if (playerIdRefsToAdd.length > 0) {
        slots.playerIdRefsToAdd = playerIdRefsToAdd;
    }
    /* MISSING CODE */
    // add event listeners for responsive validation
    if (slots.playerIdRefsToAdd) {
        for (const p of slots.playerIdRefsToAdd) {
            let responseValidation = await NationalTeam.checkPlayer( p);
            if (responseValidation.message !== "") {
                formEl["upPlayers"].setCustomValidity( responseValidation.message);
                break;
            } else formEl["upPlayers"].setCustomValidity("");
        }
    }


    if (formEl.checkValidity()) {
        let cntRemovedPlayer = 0;
        for (const playerItemEl of playersListEl.children) {
            if (playerItemEl.classList.contains("removed")) {
                cntRemovedPlayer += 1;
            }
        }
        console.log(cntRemovedPlayer + "/type: " + typeof cntRemovedPlayer);
        console.log(playersListEl.children.length - parseInt(cntRemovedPlayer));
        if (playersListEl.children.length - parseInt(cntRemovedPlayer) >= 11) {
            await NationalTeam.update(slots);
            playersListEl.innerHTML = "";
            selectTeamEl.options[selectTeamEl.selectedIndex].text = GenderEL.enumLitNames[slots.gender - 1];
            formEl.reset();
        } else{
            alert("At least 11 players must be selected!");
        }

    }
}