/**
 * @fileOverview  View methods for the use case "update person"
 * @authors Gerd Wagner & Juan-Francisco Reyes
 */
import Person, {GenderEL, PersonTypeEL} from "../../m/Person.mjs";
import {
    fillSelectWithOptions,
    createChoiceWidget,
    displaySegmentFields,
    undisplayAllSegmentFields, fillSelectWithOptionsClub, createMultiSelectionWidget
} from "../../../lib/util.mjs";
import Player from "../../m/Player.mjs";
import FootballAssociation from "../../m/FootballAssociation.mjs";
import FootballClub from "../../m/FootballClub.mjs";
import Member from "../../m/Member.mjs";
import Coach from "../../m/Coach.mjs";
import President from "../../m/President.mjs";
import {db} from "../../c/initialize.mjs";

/***************************************************************
 Load data
 ***************************************************************/
const personRecords = await Person.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Person"],
    submitButton = formEl["commit"],
    selectPersonEl = formEl.selectPerson,
    typeFieldsetEl  = formEl.querySelector("fieldset[data-bind='type']"),
    genderFieldsetEl = formEl.querySelector("fieldset[data-bind='gender']");

// selectAssoClubsEl = formEl.selectAssoClubs,
// selectAssoAssociationsEl = formEl.selectAssoAssociations,
let selectClubPlayerEl = formEl.selectClubPlayer,
    selectClubCoachEl = formEl.selectClubCoach,
    selectAssoPresidentEl = formEl.selectAssoPresident;
const assoClubsUpWidget = formEl.querySelector(".MultiSelectionWidgetClub"),
    assoAssociationsUpWidget = formEl.querySelector(".MultiSelectionWidgetAsso");

formEl.reset();
/***************************************************************
 Initialize subscription to DB-UI synchronization
 ***************************************************************/
let cancelSyncDBwithUI = null;

/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the person selection list
fillSelectWithOptions( selectPersonEl, personRecords, {valueProp:"personId", displayProp:"name"});

// for (const personRec of personRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = personRec.name;
//     optionEl.value = personRec.personId;
//     selectPersonEl.add( optionEl, null);
// }
undisplayAllSegmentFields( formEl, PersonTypeEL.labels);


// load all football association records
const associationRecords = await FootballAssociation.retrieveAll();
// load all football club records
const clubRecords = await FootballClub.retrieveAll();

// // for type 'Member' (associated Clubs)
// for (const clubRec of clubRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = clubRec.name + " (" +
//         GenderEL.enumLitNames[clubRec.gender - 1] + ")";
//     optionEl.value = clubRec.clubId;
//
//     selectAssoClubsEl.add( optionEl, null);
// }
//
// // for type 'Member' (associated associations)
// for (const associationRec of associationRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = associationRec.name;
//     optionEl.value = associationRec.assoId;
//
//     selectAssoAssociationsEl.add( optionEl, null);
// }

// for type 'Player' (associated clubs)

fillSelectWithOptionsClub( selectClubPlayerEl,
    await FootballClub.retrieveAll().then(value=>value),
    "clubId", "name");

// for type 'Coach' (associated clubs)
fillSelectWithOptionsClub( selectClubCoachEl, await FootballClub.retrieveAll("clubId").then(value=>value), "clubId", "name");

// for type 'President' (associated associations)
for (const associationRec of associationRecords) {
    const optionEl = document.createElement("option");
    optionEl.text = associationRec.name;
    optionEl.value = associationRec.assoId;

    selectAssoPresidentEl.add( optionEl, null);
}

// when a person is selected, fill the form with its data
selectPersonEl.addEventListener("change", async function () {
    const personId = selectPersonEl.value;
    if (personId) {
        // retrieve up-to-date person record
        const personRec = await Person.retrieve( personId);
        // const memberRec = await Member.retrieve( personId);
        // const playerRec = await Player.retrieve( personId);
        // const coachRec = await Coach.retrieve( personId);
        // const presidentRec = await President.retrieve( personId);

        formEl.personId.value = personRec.personId;
        formEl.name.value = personRec.name;
        formEl.dateOfBirth.value = personRec.dateOfBirth;
        // formEl.gender.value = personRec.gender;
        // formEl.type.value = personRec.type;

        // set up the gender radio button group
        createChoiceWidget( genderFieldsetEl, "gender",
            [personRec.gender], "radio", GenderEL.labels);

        // set up the type check box
        createChoiceWidget( typeFieldsetEl, "type", personRec.type,
            "checkbox", PersonTypeEL.labels);

        typeFieldsetEl.addEventListener("change", handleTypeSelectChangeEvent);


        if (personRec.type.length > 0) {
            for (const v of personRec.type) {
                displaySegmentFields( formEl, PersonTypeEL.labels,
                    parseInt(v));
                // console.log("v: " + v + "/type: " + typeof v);

                if (v === PersonTypeEL.MEMBER) {
                    console.log("personId: " + personId + "/type: " + typeof personId);
                    console.log("MEMBER");
                    // console.log(await Member.retrieve(personId).then(value => value.assoClubs));
                    // console.log(await Member.retrieve(personId).then(value => value.assoAssociations));
                    const assoClubs = await Member.retrieve(personId).then(value => value.assoClubs);
                    const assoAssociations = await Member.retrieve(personId).then(value => value.assoAssociations);
                    console.log(assoClubs + "/type: " + typeof assoClubs);
                    console.log(assoAssociations + "/type: " + typeof assoClubs);
                    if (assoClubs) {
                        createMultiSelectionWidget(assoClubsUpWidget, assoClubs,
                            "upAssoClubs", "Enter ID", 0);
                    }
                    if (assoAssociations) {
                        createMultiSelectionWidget(assoAssociationsUpWidget, assoAssociations,
                            "upAssoAssociations", "Enter ID", 0);
                    }

                } else if (v === PersonTypeEL.PLAYER) {
                    console.log("PLAYER");
                    // console.log(await Player.retrieve(personId).then(value => value.assoClub));
                    // if (await Player.retrieve(personId).then(value => value.assoClub) === undefined) {
                    //     console.log("no");
                    // } else {
                    //     console.log("yes");
                    // }
                    const playerRetrieveCheck = (await db.collection("players").doc( personId)
                        .withConverter( Player.converter).get()).data();

                    if (typeof playerRetrieveCheck !== 'undefined') {
                        selectClubPlayerEl.value = await Player.retrieve(personId).then(value => value.assoClub);
                    }

                } else if (v === PersonTypeEL.COACH) {
                    console.log("COACH");
                    const coachRetrieveCheck = (await db.collection("coaches").doc( personId)
                        .withConverter( Coach.converter).get()).data();

                    // console.log(await Coach.retrieve(personId).then(value => value.assoClub));
                    if (coachRetrieveCheck !== 'undefined') {
                        selectClubCoachEl.value = await Coach.retrieve(personId).then(value => value.assoClub);
                    }


                } else if (v === PersonTypeEL.PRESIDENT) {
                    console.log("PRESIDENT");
                    const presidentRetrieveCheck = (await db.collection("presidents").doc( personId)
                        .withConverter( President.converter).get()).data();

                    // console.log(await Coach.retrieve(personId).then(value => value.assoClub));
                    if (presidentRetrieveCheck !== 'undefined') {
                        selectAssoPresidentEl.value = await President.retrieve(personId).then(value => value.assoAssociation);
                    }
                    // console.log(await President.retrieve(personId).then(value => value.assoAssociation));


                }
            }
        } else {
            undisplayAllSegmentFields( formEl, PersonTypeEL.labels);
        }

    } else {
        formEl.reset();
        typeFieldsetEl.innerHTML = "";
    }
});

async function handleTypeSelectChangeEvent(e) {
    const formEl = e.currentTarget.form,
        selected = formEl.getAttribute("data-value"),
        selectedValues = [];
    var checkboxes = document.getElementsByName("type");

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            selectedValues.push(i);

            if (i === ((PersonTypeEL.MEMBER) - 1)) {
                console.log("MEMBER");
                // const assoClubsListEl = assoClubsCrtWidget.querySelector("ul"),
                //     assoAssociationsListEl = assoAssociationsCrtWidget.querySelector("ul"),
                // widgetbtn = document.querySelector("div.widget > label > span > button");
                //
                // widgetbtn.addEventListener("click", async function() {
                //     console.log(document.querySelectorAll("div#crtAssoClubs > ul > li")[0]);
                //     if (assoClubsListEl.children) {
                //         // console.log(assoClubsListEl.children[0].getAttribute("data-value"));
                //         for (const el of assoClubsListEl.children) {
                //             console.log("FOR");
                //             console.log(el.getAttribute("data-value") + "/type: " +
                //                 typeof el.getAttribute("data-value"));
                //             // assoClubIdRefs.push(el.getAttribute("data-value"));
                //         }
                //         // let responseValidation = await Member.checkAssoClub(ac);
                //         //         if (responseValidation.message) {
                //         //             formEl["crtAssoClubs"].setCustomValidity(responseValidation.message);
                //         //             break;
                //         //         } else formEl["crtAssoClubs"].setCustomValidity("");
                //     }
                //     for (const el of assoClubsListEl.children) {
                //         console.log(el.getAttribute("data-value") + "/type: " +
                //         typeof el.getAttribute("data-value"));
                //         // assoClubIdRefs.push(el.getAttribute("data-value"));
                //     }
                // });

                // const assoClubIdRefs = [], assoAssociationIdRefs = [];
                // // get the list of selected assoClubs
                // for (const el of assoClubsListEl.children) {
                //     // console.log(el.getAttribute("data-value") + "/type: " +
                //     // typeof el.getAttribute("data-value"));
                //     assoClubIdRefs.push(el.getAttribute("data-value"));
                // }
                // if (assoClubIdRefs.length > 0) {
                //     for (const ac of assoClubIdRefs) {
                //         // console.log("ac: " + ac + "/type: " + typeof ac);
                //         let responseValidation = await Member.checkAssoClub(ac);
                //         if (responseValidation.message) {
                //             formEl["crtAssoClubs"].setCustomValidity(responseValidation.message);
                //             break;
                //         } else formEl["crtAssoClubs"].setCustomValidity("");
                //     }
                // }
                //
                // // get the list of selected assoAssociations
                // for (const el of assoAssociationsListEl.children) {
                //     slots.assoAssociationIdRefs.push(el.getAttribute("data-value"));
                // }
                // if (slots.assoAssociationIdRefs.length > 0) {
                //     for (const aa of slots.assoAssociationIdRefs) {
                //         let responseValidation = await Member.checkAssoAssociation(aa);
                //         if (responseValidation.message) {
                //             formEl["crtAssoAssociations"].setCustomValidity(responseValidation.message);
                //             break;
                //         } else formEl["crtAssoAssociations"].setCustomValidity("");
                //     }
                // }
                // formEl.selectAssoClubs.addEventListener("click", function() {
                //         console.log(formEl.selectAssoClubs.selectedOptions);
                //     }
                // );
                // formEl.selectAssoAssociations.addEventListener("click", function() {
                //         console.log(formEl.selectAssoAssociations.selectedOptions);
                //     }
                // );

                // console.log("i: " + i + "type: " + typeof i);
            } else if (i === ((PersonTypeEL.PLAYER) - 1)) {
                console.log("PLAYER");
                // formEl.selectClubPlayer.addEventListener("input", function () {
                //     formEl.selectClubPlayer.setCustomValidity(
                //         Player.checkAssoClub(formEl.selectClubPlayer.value).message);
                // });

                formEl.selectClubPlayer.addEventListener("change", function () {
                    console.log(selectClubPlayerEl.value);

                    formEl.selectClubPlayer.setCustomValidity(
                        (formEl.selectClubPlayer.value.length > 0) ? "" : "No associated club selected!"
                    );
                    // formEl.selectClubPlayer.setCustomValidity(
                    //     Player.checkAssoClub(formEl.selectClubPlayer.value).message);
                });
            } else if (i === ((PersonTypeEL.COACH) - 1)) {
                console.log("COACH");
                formEl.selectClubCoach.addEventListener("change", function () {
                    console.log(selectClubCoachEl.value);

                    formEl.selectClubCoach.setCustomValidity(
                        (formEl.selectClubCoach.value.length > 0) ? "" : "No associated club selected!"
                    );
                    // formEl.selectClubPlayer.setCustomValidity(
                    //     Player.checkAssoClub(formEl.selectClubPlayer.value).message);
                });

                formEl.selectClubCoach.addEventListener("input", function () {
                    formEl.selectClubCoach.setCustomValidity(
                        Coach.checkAssoClub(formEl.selectClubCoach.value).message);
                });
                // console.log("i: " + i + "type: " + typeof i);
            } else if (i === ((PersonTypeEL.PRESIDENT) - 1)) {
                console.log("PRESIDENT");
                formEl.selectAssoPresident.addEventListener("change", function () {
                    console.log(selectAssoPresidentEl.value);

                    formEl.selectAssoPresident.setCustomValidity(
                        (formEl.selectAssoPresident.value.length > 0) ? "" : "No associated association selected!"
                    );
                    // formEl.selectClubPlayer.setCustomValidity(
                    //     Player.checkAssoClub(formEl.selectClubPlayer.value).message);
                });

                formEl.selectAssoPresident.addEventListener("input", function () {
                    formEl.selectAssoPresident.setCustomValidity(
                        President.checkAssoAssociation(formEl.selectAssoPresident.value).message);
                });
            }
        }

    }
    if (selectedValues.length > 0) {
        for (const v of selectedValues) {
            displaySegmentFields(formEl, PersonTypeEL.labels,
                parseInt(v + 1));
        }
    } else {
        undisplayAllSegmentFields(formEl, PersonTypeEL.labels);
    }


}

// set up listener to document changes on selected person record
selectPersonEl.addEventListener("change", async function () {
    cancelSyncDBwithUI = await Person.syncDBwithUI( selectPersonEl.value);
});

// // set an event handler for the submit/save button
// updateButton.addEventListener("click",
//     handleSaveButtonClickEvent);
// // neutralize the submit event
// formEl.addEventListener("submit", function (e) {
//     e.preventDefault();
// });

/***************************************************************
 Add event listeners for responsive validation
 ***************************************************************/
formEl.name.addEventListener("input", function () {
    formEl.name.setCustomValidity(
        Person.checkName( formEl.name.value).message);
});
formEl.dateOfBirth.addEventListener("input", function () {
    formEl.dateOfBirth.setCustomValidity(
        Person.checkDateOfBirth( formEl.dateOfBirth.value).message);
});
genderFieldsetEl.addEventListener("change", function () {
    genderFieldsetEl.setCustomValidity(
        (!genderFieldsetEl.value) ? "A gender must be selected!":"" );
});
// typeFieldsetEl.addEventListener("click", function () {
//     formEl.type[0].setCustomValidity(
//         (!typeFieldsetEl.getAttribute("data-value")) ?
//             "A type must be selected!":"" );
// });
typeFieldsetEl.addEventListener("click", function () {
    const val = typeFieldsetEl.getAttribute("data-value");
    formEl.type[0].setCustomValidity(
        (!val || Array.isArray(val) && val.length === 0) ?
            "At least one type form must be selected!":"" );
});

/******************************************************************
 Add further event listeners, especially for the save/delete button
 ******************************************************************/

// Set an event handler for the submit/save button
submitButton.addEventListener("click", handleSubmitButtonClickEvent);
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
    const formEl = document.forms['Person'],
        selectPersonEl = formEl.selectPerson,
        personId = selectPersonEl.value,
        assoClubsListEl = assoClubsUpWidget.querySelector("ul"),
        assoAssociationsListEl = assoAssociationsUpWidget.querySelector("ul");

    // const selectedTypesOptions = typeFieldsetEl.getAttribute("data-value");
    if (!personId) return;
    const slots = {
        personId: formEl.personId.value,
        name: formEl.name.value,
        dateOfBirth: formEl.dateOfBirth.value,
        gender: genderFieldsetEl.getAttribute("data-value"),
        type: JSON.parse(typeFieldsetEl.getAttribute("data-value"))

        // originalLanguage: formEl.originalLanguage.value,
        // otherAvailableLanguages: [],
        // category: categoryFieldsetEl.getAttribute("data-value"),
        // publicationForms: JSON.parse( pubFormsFieldsetEl.getAttribute("data-value"))
    };

    // if (typeof slots.gender === 'string') {
//         slots.gender = parseInt(slots.gender);
//     }
//     slots.type = JSON.parse(typeFieldsetEl.getAttribute("data-value"));
//
//     await Person.update( slots);
//     // update the selection list option element
//     selectPersonEl.options[selectPersonEl.selectedIndex].text = slots.name;
//     formEl.reset();

    // set error messages in case of constraint violations
    formEl.name.setCustomValidity(Person.checkName(slots.name).message);
    formEl.dateOfBirth.setCustomValidity(Person.checkDateOfBirth(slots.dateOfBirth).message);
    formEl.gender[0].setCustomValidity(Person.checkGender(slots.gender).message);
    formEl.type[0].setCustomValidity(Person.checkTypes(slots.type).message);

    if (formEl.checkValidity()) {
        await Person.update(slots);
        // update the selection list option
        // selectPersonEl.options[selectPersonEl.selectedIndex].text = slots.name;
        // selectPersonEl.innerHTML = "";
        // selectPersonEl.options[selectPersonEl.selectedIndex].text = slots.name;

        // formEl.reset();
    }

    if (slots.type) {

        // check type and save association entities depending on types
        if (slots.type.includes(PersonTypeEL.MEMBER)) {
            console.log("contains MEMBER");

            // construct assoClubIdRefs-ToAdd/ToRemove lists
            const assoClubIdRefsToAdd = [], assoClubIdRefsToRemove = [];
            for (const assoClubItemEl of assoClubsListEl.children) {
                if (assoClubItemEl.classList.contains("removed")) {
                    assoClubIdRefsToRemove.push(assoClubItemEl.getAttribute("data-value"));
                }
                if (assoClubItemEl.classList.contains("added")) {
                    assoClubIdRefsToAdd.push(assoClubItemEl.getAttribute("data-value"));
                }
            }
            // if the add/remove list is non-empty, create a corresponding slot
            if (assoClubIdRefsToRemove.length > 0) {
                slots.assoClubIdRefsToRemove = assoClubIdRefsToRemove;
            }
            if (assoClubIdRefsToAdd.length > 0) {
                slots.assoClubIdRefsToAdd = assoClubIdRefsToAdd;
            }
            /* MISSING CODE */
            // add event listeners for responsive validation
            if (slots.assoClubIdRefsToAdd) {
                for (const ac of slots.assoClubIdRefsToAdd) {
                    let responseValidation = await Member.checkAssoClub( ac);
                    if (responseValidation.message !== "") {
                        formEl["upAssoClubs"].setCustomValidity( responseValidation.message);
                        break;
                    } else formEl["upAssoClubs"].setCustomValidity("");
                }
            }

            // construct assoAssociationIdRefs-ToAdd/ToRemove lists
            const assoAssociationIdRefsToAdd = [], assoAssociationIdRefsToRemove = [];
            for (const assoAssociationItemEl of assoAssociationsListEl.children) {
                if (assoAssociationItemEl.classList.contains("removed")) {
                    assoAssociationIdRefsToRemove.push(assoAssociationItemEl.getAttribute("data-value"));
                }
                if (assoAssociationItemEl.classList.contains("added")) {
                    assoAssociationIdRefsToAdd.push(assoAssociationItemEl.getAttribute("data-value"));
                }
            }
            // if the add/remove list is non-empty, create a corresponding slot
            if (assoAssociationIdRefsToRemove.length > 0) {
                slots.assoAssociationIdRefsToRemove = assoAssociationIdRefsToRemove;
            }
            if (assoAssociationIdRefsToAdd.length > 0) {
                slots.assoAssociationIdRefsToAdd = assoAssociationIdRefsToAdd;
            }
            /* MISSING CODE */
            // add event listeners for responsive validation
            if (slots.assoAssociationIdRefsToAdd) {
                for (const aa of slots.assoAssociationIdRefsToAdd) {
                    let responseValidation = await Member.checkAssoAssociation( aa);
                    if (responseValidation.message !== "") {
                        formEl["upAssoAssociations"].setCustomValidity( responseValidation.message);
                        break;
                    } else formEl["upAssoAssociations"].setCustomValidity("");
                }
            }
            // slots.assoClubIdRefs = [];
            // slots.assoAssociationIdRefs = [];

            // formEl.selectAssoClubs.setCustomValidity(
            //     formEl.selectAssoClubs.value.length > 0 ? "" :
            //         "No associated club selected!"
            // );
            // formEl.selectAssoAssociations.setCustomValidity(
            //     formEl.selectAssoAssociations.value.length > 0 ? "" :
            //         "No associated association selected!"
            // );
            if (formEl.checkValidity()) {
                // // construct a list of assoClub ID references
                // for (const c_opt of selClubOptions) {
                //     slots.assoClubIdRefs.push(c_opt.value);
                // }
                // // construct a list of assoAssociation ID references
                // for (const a_opt of selAssoOptions) {
                //     slots.assoAssociationIdRefs.push(a_opt.value);
                // }
                // console.log(slots);
                // console.log("slots.assoClubIdRefs: " + slots.assoClubIdRefs +
                //     "/type: " + typeof slots.assoClubIdRefs);
                // console.log("slots.assoAssociationIdRefs: " + slots.assoAssociationIdRefs +
                //     "/type: " + typeof slots.assoAssociationIdRefs);
                // await Member.update(slots);


                const memberExistCheck = await Member.retrieve(personId);

                if (!memberExistCheck) {
                    await Member.add(slots);
                } else {
                    await Member.update(slots);
                }
                assoClubsListEl.innerHTML = "";
                assoAssociationsListEl.innerHTML = "";
                // formEl.reset();
                // selectPersonEl.innerHTML = "";
            } else {
                const memberRetrieveCheck = await Member.retrieve(personId);
                if (memberRetrieveCheck) {
                    await Member.destroy(personId);
                }
            }

            // await Member.add(slots);
        }
        if (slots.type.includes(PersonTypeEL.PLAYER)) {
            console.log("contains PLAYER");

            // formEl.selectClubPlayer.setCustomValidity(
            //     formEl.selectClubPlayer.value.length > 0 ? "" :
            //         "No associated club selected!"
            // );
            // console.log(selectClubPlayerEl.value);

            formEl.selectClubPlayer.setCustomValidity(
                (formEl.selectClubPlayer.value.length > 0) ? "" : "No associated club selected!"
            );
            // selectClubPlayerEl.addEventListener("click", function () {
            //     formEl.selectClubPlayer[0].setCustomValidity(
            //         (!selectClubPlayerEl.value) ?
            //             "A associated club must be selected!":"" );
            // });

            if (formEl.checkValidity()) {
                const playerExistCheck = await Player.retrieve(personId);
                slots.assoClub = parseInt(formEl.selectClubPlayer.value);

                if (!playerExistCheck) {
                    await Player.add(slots);
                } else {
                    await Player.update(slots);
                }
            }

        } else {
            const playerRetrieveCheck = await Player.retrieve(personId);
            if (playerRetrieveCheck) {
                await Player.destroy(personId);
            }
        }
        if (slots.type.includes(PersonTypeEL.COACH)) {
            console.log("contains COACH");

            formEl.selectClubCoach.setCustomValidity(
                formEl.selectClubCoach.value.length > 0 ? "" :
                    "No associated club selected!"
            );

            if (formEl.checkValidity()) {

                const coachExistCheck = await Coach.retrieve(personId);
                slots.assoClub = parseInt(formEl.selectClubCoach.value);

                if (!coachExistCheck) {
                    await Coach.add(slots);
                } else {
                    await Coach.update(slots);
                }
                // await Coach.update(slots);
            }

        } else {
            const coachRetrieveCheck = await Coach.retrieve(personId);
            if (coachRetrieveCheck) {
                await Coach.destroy(personId);
            }
        }
        if (slots.type.includes(PersonTypeEL.PRESIDENT)) {
            console.log("contains PRESIDENT");

            formEl.selectAssoPresident.setCustomValidity(
                formEl.selectAssoPresident.value.length > 0 ? "" :
                    "No associated association selected!"
            );
            if (formEl.checkValidity()) {
                // slots.assoAssociation_id = parseInt(formEl.selectAssoPresident.value);
                // await President.update(slots);

                const presidentExistCheck = await President.retrieve(personId);
                slots.assoAssociation = parseInt(formEl.selectAssoPresident.value);

                if (!presidentExistCheck) {
                    await President.add(slots);
                } else {
                    await President.update(slots);
                }
            }
        } else {
            const presidentRetrieveCheck = await President.retrieve(personId);
            if (presidentRetrieveCheck) {
                await President.destroy(personId);
            }
        }
    }


    if (formEl.checkValidity()) {
        await Person.update(slots);
        // update the selection list option
        // selectPersonEl.options[selectPersonEl.selectedIndex].text = slots.name;
        // selectPersonEl.innerHTML = "";
        selectPersonEl.options[selectPersonEl.selectedIndex].text = slots.name;
        undisplayAllSegmentFields( formEl, PersonTypeEL.labels);
        formEl.reset();
    }

// // save data
// async function handleSaveButtonClickEvent() {
//     const formEl = document.forms["Person"],
//         selectPersonEl = formEl.selectPerson;
//     const slots = {
//         personId: formEl.personId.value,
//         name: formEl.name.value,
//         dateOfBirth: formEl.dateOfBirth.value,
//         gender: genderFieldsetEl.getAttribute("data-value"),
//         type: []
//     };
//
//     if (typeof slots.gender === 'string') {
//         slots.gender = parseInt(slots.gender);
//     }
//     slots.type = JSON.parse(typeFieldsetEl.getAttribute("data-value"));
//
//     await Person.update( slots);
//     // update the selection list option element
//     selectPersonEl.options[selectPersonEl.selectedIndex].text = slots.name;
//     formEl.reset();
}