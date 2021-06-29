/**
 * @fileOverview  View methods for the use case "create person"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
import Person, { GenderEL, PersonTypeEL  } from "../../m/Person.mjs";
import { createChoiceWidget } from "../../../lib/util.mjs";

const formEl = document.forms['Person'],
    genderFieldsetEl = formEl.querySelector("fieldset[data-bind='gender']"),
    typeFieldsetEl = formEl.querySelector("fieldset[data-bind='type']"),
    // selectAssoClubsEl = formEl.selectAssoClubs,
    // selectAssoAssociationsEl = formEl.selectAssoAssociations,
    // selectClubPlayerEl = formEl.selectClubPlayer,
    // selectClubCoachEl = formEl.selectClubCoach,
    // selectAssoEl = formEl.selectAssociation,
    saveButton = formEl["commit"];


// set up the gender radio button group
createChoiceWidget( genderFieldsetEl, "gender", [],
    "radio", GenderEL.labels);

// set up the type check box
createChoiceWidget( typeFieldsetEl, "type", [],
    "checkbox", PersonTypeEL.labels);

// // load all football association records
// const associationRecords = await FootballAssociation.retrieveAll();
// // load all football club records
// const clubRecords = await FootballClub.retrieveAll();

// // set up a multiple selection list for selecting associated clubs
// fillSelectWithOptions( selectAssoClubsEl, clubRecords,
//     "clubId", {displayProp: "name"});
// // set up a multiple selection list for selecting associated associations
// fillSelectWithOptions( selectAssoAssociationsEl, FootballAssociation.instances,
//     "assoId", {displayProp: "name"});

//
// for (const associationRec of associationRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = associationRec.name;
//     optionEl.value = associationRec.assoId;
//
//     selectAssoEl.add( optionEl, null);
// }
//
// for (const clubRec of clubRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = clubRec.name + " (" +
//         GenderEL.enumLitNames[clubRec.gender - 1] + ")";
//     optionEl.value = clubRec.clubId;
//
//     selectClubPlayerEl.add( optionEl, null);
// }
// for (const clubRec of clubRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = clubRec.name + " (" +
//         GenderEL.enumLitNames[clubRec.gender - 1] + ")";
//     optionEl.value = clubRec.clubId;
//
//     selectClubCoachEl.add( optionEl, null);
// }

// undisplayAllSegmentFields( formEl, PersonTypeEL.labels);

// typeFieldsetEl.addEventListener("change", handleTypeSelectChangeEvent);
//
// function handleTypeSelectChangeEvent(e) {
//     const formEl = e.currentTarget.form,
//         selected = formEl.getAttribute("data-value"),
//         selectedValues = [];
//     var checkboxes = document.getElementsByName("type");
//
//     // console.log(formEl.getAttribute("data-value"));
//
//     for(let i = 0; i < checkboxes.length; i++)
//     {
//         // if(checkboxes[i].checked) {
//         if (checkboxes[i].checked) {
//             selectedValues.push(i);
//             }
//
//         }
//     if (selectedValues.length > 0) {
//         for (const v of selectedValues) {
//             displaySegmentFields( formEl, PersonTypeEL.labels,
//                 parseInt(v+1));
//         }
//     } else {
//         undisplayAllSegmentFields( formEl, PersonTypeEL.labels);
//     }
//
//
// }


// set an event handler for the submit/save button
saveButton.addEventListener("click", handleSaveButtonClickEvent);
// neutralize the submit event
formEl.addEventListener( 'submit', function (e) {
    e.preventDefault();
    formEl.reset();
});

async function handleSaveButtonClickEvent() {
    const selectedTypesOptions = typeFieldsetEl.getAttribute("data-value");
    const slots = {
        personId: formEl.personId.value,
        name: formEl.name.value,
        dateOfBirth: formEl.dateOfBirth.value,
        gender: genderFieldsetEl.getAttribute("data-value"),
        type : []
    };

    if (typeof slots.gender === 'string') {
        slots.gender = parseInt(slots.gender);
    }

    slots.type = JSON.parse(selectedTypesOptions);

    await Person.add( slots);
    formEl.reset();
}