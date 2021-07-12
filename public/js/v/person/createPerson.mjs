/**
 * @fileOverview  View methods for the use case "create person"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
import Person, { GenderEL, PersonTypeEL  } from "../../m/Person.mjs";
import { createChoiceWidget, showProgressBar } from "../../../lib/util.mjs";

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms['Person'],
    genderFieldsetEl = formEl.querySelector("fieldset[data-bind='gender']"),
    typeFieldsetEl = formEl.querySelector("fieldset[data-bind='type']"),
    saveButton = formEl.commit;

/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the gender radio button group
createChoiceWidget( genderFieldsetEl, "gender", [],
    "radio", GenderEL.labels);

// set up the type check box
createChoiceWidget( typeFieldsetEl, "type", [],
    "checkbox", PersonTypeEL.labels);

/***************************************************************
 Add event listeners for responsive validation
 ***************************************************************/
// add event listeners for responsive validation
formEl.personId.addEventListener("input", function () {
    formEl.personId.setCustomValidity( Person.checkPersonId( formEl.personId.value).message);
});
formEl.name.addEventListener("input", function () {
    formEl.name.setCustomValidity( Person.checkName( formEl.name.value).message);
});
formEl.dateOfBirth.addEventListener("input", function () {
    formEl.dateOfBirth.setCustomValidity( Person.checkDateOfBirth( formEl.dateOfBirth.value).message);
});
genderFieldsetEl.addEventListener("click", function () {
    formEl.gender[0].setCustomValidity(
        (!genderFieldsetEl.getAttribute("data-value")) ?
            "A gender must be selected!":"" );
});
// mandatory value check
typeFieldsetEl.addEventListener("click", function () {
    const val = typeFieldsetEl.getAttribute("data-value");
    formEl.type[0].setCustomValidity(
        (!val || Array.isArray(val) && val.length === 0) ?
            "At least one type must be selected!":"" );
});

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

async function handleSaveButtonClickEvent() {
    const selectedTypesOptions = typeFieldsetEl.getAttribute("data-value");
    const slots = {
        personId: formEl.personId.value,
        name: formEl.name.value,
        dateOfBirth: formEl.dateOfBirth.value,
        gender: genderFieldsetEl.getAttribute("data-value"),
        type : []
    };

    // if (typeof slots.gender === 'string') {
    //     slots.gender = parseInt(slots.gender);
    // }

    slots.type = JSON.parse(selectedTypesOptions);

    showProgressBar( "show");
    formEl.personId.setCustomValidity(( await Person.checkPersonIdAsId(slots.personId)).message);
    formEl.name.setCustomValidity( Person.checkName( slots.name).message);
    formEl.dateOfBirth.setCustomValidity( Person.checkDateOfBirth( slots.dateOfBirth).message);
    formEl.gender[0].setCustomValidity( Person.checkGender( slots.gender).message);
    formEl.type[0].setCustomValidity(
        Person.checkTypes( slots.type).message);

    if (formEl.checkValidity()) {
        Person.add(slots);
        formEl.reset();
    }
    showProgressBar( "hide");
}