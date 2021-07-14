/**
 * @fileOverview  View methods for the use case "create football association"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
import FootballAssociation from "../../m/FootballAssociation.mjs";

import {
    showProgressBar
} from "../../../lib/util.mjs";

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms['Association'],
    // selectPresidentEl = formEl.selectPresident,
    // selectSupAssosEl = formEl.selectSupAssos,
    // selectMembersEl = formEl.selectMembers,
    // selectClubsEl = formEl.selectClubs,
    saveButton = formEl.commit;


/***************************************************************
 Set up (choice) widgets
 ***************************************************************/

// const presidentRecords = await President.retrieveAll();
// const assoRecords = await FootballAssociation.retrieveAll();
// const coachRecords = await Coach.retrieveAll();
// const memberRecords = await Member.retrieveAll();
// const clubRecords = await FootballClub.retrieveAll();

// for (const presidentRecord of presidentRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = presidentRecord.name;
//     optionEl.value = presidentRecord.personId;
//
//     selectPresidentEl.add( optionEl, null);
// }
//
// for (const assoRecord of assoRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = assoRecord.name;
//     optionEl.value = assoRecord.assoId;
//
//     selectSupAssosEl.add( optionEl, null);
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
//
// for (const clubRecord of clubRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = clubRecord.name + " (" +
//         GenderEL.enumLitNames[clubRecord.gender - 1] + ")";
//     optionEl.value = clubRecord.personId;
//
//     selectClubsEl.add( optionEl, null);
// }

/***************************************************************
 Add event listeners for responsive validation
 ***************************************************************/
// add event listeners for responsive validation
formEl.assoId.addEventListener("input", function () {
    formEl.assoId.setCustomValidity( FootballAssociation.checkAssoId
    ( formEl.assoId.value).message);
});
formEl.name.addEventListener("input", function () {
    formEl.name.setCustomValidity( FootballAssociation.checkName
    ( formEl.name.value).message);
});
// selectPresidentEl.addEventListener("click", function () {
//     formEl.selectPresident.setCustomValidity(
//         formEl.selectPresident.value.length > 0 ? "" :
//             "No president selected!"
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

    const slots = {
        assoId: formEl.assoId.value,
        name: formEl.name.value
        // president_id: formEl.selectPresident.value

        // supAssociationIdRefs: [],
        // memberIdRefs: [],
        // clubIdRefs: []
    };
    // // get the list of selected supAssociations, members, clubs
    // const selSupAssoOptions = formEl.selectSupAssos.selectedOptions;
    // const selMemberOptions = formEl.selectMembers.selectedOptions;
    // const selClubOptions = formEl.selectClubs.selectedOptions;
    // if(selSupAssoOptions.length) {
    //     slots.supAssociationIdRefs = [];
    //     for (const opt of selSupAssoOptions) {
    //         slots.supAssociationIdRefs.push( opt.value);
    //     }
    // }
    // if(selMemberOptions.length) {
    //     slots.memberIdRefs = [];
    //     for (const opt of selMemberOptions) {
    //         slots.memberIdRefs.push( opt.value);
    //     }
    // }
    // if(selClubOptions.length) {
    //     slots.clubIdRefs = [];
    //     for (const opt of selClubOptions) {
    //         slots.clubIdRefs.push( opt.value);
    //     }
    // }

    showProgressBar( "show");
    formEl.assoId.setCustomValidity(( await FootballAssociation.checkAssoIdAsId(slots.assoId)).message);
    formEl.name.setCustomValidity( FootballAssociation.checkName( slots.name).message);
    // formEl.selectPresident.setCustomValidity( FootballAssociation.checkPresident( slots.president_id).message);

    if (formEl.checkValidity()) {
        await FootballAssociation.add( slots);
        formEl.reset();
    }
    showProgressBar( "hide");
}