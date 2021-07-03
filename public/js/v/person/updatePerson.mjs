/**
 * @fileOverview  View methods for the use case "update person"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
import Person, {GenderEL, PersonTypeEL} from "../../m/Person.mjs";
import { createChoiceWidget } from "../../../lib/util.mjs";

const formEl = document.forms["Person"],
    updateButton = formEl.commit,
    selectPersonEl = formEl.selectPerson,
    typeFieldsetEl  = formEl.querySelector("fieldset[data-bind='type']"),
    genderFieldsetEl = formEl.querySelector("fieldset[data-bind='gender']");

// load all person records
const personRecords = await Person.retrieveAll();
for (const personRec of personRecords) {
    const optionEl = document.createElement("option");
    optionEl.text = personRec.name;
    optionEl.value = personRec.personId;
    selectPersonEl.add( optionEl, null);
}

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
        typeSelEl.innerHTML = "";
    }
});

// set an event handler for the submit/save button
updateButton.addEventListener("click",
    handleSaveButtonClickEvent);
// neutralize the submit event
formEl.addEventListener("submit", function (e) {
    e.preventDefault();
});

// save data
async function handleSaveButtonClickEvent() {
    const formEl = document.forms["Person"],
        selectPersonEl = formEl.selectPerson;
    const slots = {
        personId: formEl.personId.value,
        name: formEl.name.value,
        dateOfBirth: formEl.dateOfBirth.value,
        gender: genderFieldsetEl.getAttribute("data-value"),
        type: []
    };
    if (typeof slots.gender === 'string') {
        slots.gender = parseInt(slots.gender);
    }

    slots.type = JSON.parse(typeFieldsetEl.getAttribute("data-value"));
    await Person.update( slots);
    // update the selection list option element
    selectPersonEl.options[selectPersonEl.selectedIndex].text = slots.name;
    formEl.reset();
}