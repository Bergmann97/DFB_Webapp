/**
 * @fileOverview  View methods for the use case "create person"
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 */
import Person, { GenderEL, PersonTypeEL  } from "../../m/Person.mjs";
import {
    undisplayAllSegmentFields,
    displaySegmentFields,
    createChoiceWidget,
    fillSelectWithOptionsClub, showProgressBar, createMultiSelectionWidget
} from "../../../lib/util.mjs";
import FootballClub from "../../m/FootballClub.mjs";
import FootballAssociation from "../../m/FootballAssociation.mjs";
import Member from "../../m/Member.mjs";
import Player from "../../m/Player.mjs";
import Coach from "../../m/Coach.mjs";
import President from "../../m/President.mjs";


// /***************************************************************
//  Set up general, use-case-independent UI elements
//  ***************************************************************/
// // neutralize the submit event for all use cases
// for (const frm of document.querySelectorAll("div > form")) {
//     frm.addEventListener("submit", function (e) {
//         e.preventDefault();
//         frm.reset();
//     });
// }

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms['Person'],
    genderFieldsetEl = formEl.querySelector("fieldset[data-bind='gender']"),
    typeFieldsetEl = formEl.querySelector("fieldset[data-bind='type']"),
    // selectAssoClubsEl = formEl.selectAssoClubs,
    // selectAssoAssociationsEl = formEl.selectAssoAssociations,
    assoClubsCrtWidget = formEl.querySelector(
        ".MultiSelectionWidgetClub"),
    assoAssociationsCrtWidget = formEl.querySelector(
        ".MultiSelectionWidgetAsso"),

    selectClubPlayerEl = formEl.selectClubPlayer,
    selectClubCoachEl = formEl.selectClubCoach,
    selectAssoPresidentEl = formEl.selectAssoPresident,
    saveButton = formEl.commit;

createMultiSelectionWidget( assoClubsCrtWidget, [],
    "crtAssoClubs", "Enter ID", 0);
createMultiSelectionWidget( assoAssociationsCrtWidget, [],
    "crtAssoAssociations", "Enter ID", 0);

formEl.reset();

/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the gender radio button group
createChoiceWidget( genderFieldsetEl, "gender", [],
    "radio", GenderEL.labels);

// set up the type radio button group
createChoiceWidget( typeFieldsetEl, "type", [],
    "checkbox", PersonTypeEL.labels);

// set up event handlers for responsive constraint validation
formEl.personId.addEventListener("input", async function () {
    let responseValidation = await Person.checkPersonIdAsId( formEl.personId.value);
    formEl["personId"].setCustomValidity( responseValidation.message);
});

// load all football association records
const associationRecords = await FootballAssociation.retrieveAll("assoId");
// load all football club records
const clubRecords = await FootballClub.retrieveAll();


// for (const [key, value] of Object.entries(clubRecords)) {
//     console.log(key, value);
// }

// // set up a multiple selection list for selecting associated clubs
// fillSelectWithOptions( selectAssoClubsEl, clubRecords,
//     "clubId", {displayProp: "name"});
// // set up a multiple selection list for selecting associated associations
// fillSelectWithOptions( selectAssoAssociationsEl, FootballAssociation.instances,
//     "assoId", {displayProp: "name"});


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
// console.log(await FootballClub.retrieve("1").then(value => value));
// console.log(await FootballClub.retrieveAll().then(value => value));
// for (const clubRec of clubRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = clubRec.name + " (" +
//         GenderEL.enumLitNames[clubRec.gender - 1] + ")";
//     optionEl.value = clubRec.clubId;
//
//     selectClubPlayerEl.add( optionEl, null);
// }

// for type 'Coach' (associated clubs)
fillSelectWithOptionsClub( selectClubCoachEl, await FootballClub.retrieveAll("clubId").then(value=>value), "clubId", "name");

// for (const clubRec of clubRecords) {
//     const optionEl = document.createElement("option");
//     optionEl.text = clubRec.name + " (" +
//         GenderEL.enumLitNames[clubRec.gender - 1] + ")";
//     optionEl.value = clubRec.clubId;
//
//     selectClubCoachEl.add( optionEl, null);
// }

// for type 'President' (associated associations)
for (const associationRec of associationRecords) {
    const optionEl = document.createElement("option");
    optionEl.text = associationRec.name;
    optionEl.value = associationRec.assoId;

    selectAssoPresidentEl.add( optionEl, null);
}



undisplayAllSegmentFields( formEl, PersonTypeEL.labels);

typeFieldsetEl.addEventListener("change", handleTypeSelectChangeEvent);

// formEl.selectAssoClubs.addEventListener("click", function() {
//     for (const opt of selectedAssoClubs) {
//         selectedClubs.push( opt.value);
//     }
//     console.log("selectedClubs: " + selectedClubs + "/type: " + typeof selectedClubs);
// });
// formEl.selectAssoAssociations.addEventListener("click", function() {
//     for (const opt of selectedAssoAssociatons) {
//         selectedAssos.push( opt.value);
//     }
//     console.log("selectedAssos: " + selectedAssos + "/type: " + typeof selectedAssos);
// })
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

// const selectedAssoClubs = formEl.selectAssoClubs.selectedOptions;
// const selectedAssoAssociatons = formEl.selectAssoAssociations.selectedOptions;
// const selectedClubs = [];
// const selectedAssos = [];


async function handleTypeSelectChangeEvent(e) {
    const formEl = e.currentTarget.form,
        selected = formEl.getAttribute("data-value"),
        selectedValues = [];
    var checkboxes = document.getElementsByName("type");

    // console.log(formEl.getAttribute("data-value"));

    for (let i = 0; i < checkboxes.length; i++) {
        // if(checkboxes[i].checked) {
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
                    // console.log(selectClubPlayerEl.value);

                    formEl.selectClubPlayer.setCustomValidity(
                        (formEl.selectClubPlayer.value.length > 0) ? "" : "No associated club selected!"
                    );
                    // formEl.selectClubPlayer.setCustomValidity(
                    //     Player.checkAssoClub(formEl.selectClubPlayer.value).message);
                });


                // selectClubPlayerEl.addEventListener("click", function () {
                //     selectClubPlayerEl.value.setCustomValidity(
                //         (!selectClubPlayerEl.value) ?
                //             "A associated club must be selected!":"" );
                // });
                // console.log("i: " + i + "type: " + typeof i);
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
                // console.log("i: " + i + "type: " + typeof i);
            }
        }

    }
    if (selectedValues.length > 0) {
        for (const v of selectedValues) {
            displaySegmentFields(formEl, PersonTypeEL.labels,
                parseInt(v + 1));
        }
    } else {
        // selectedValues.pop(i);
        undisplayAllSegmentFields(formEl, PersonTypeEL.labels);
    }


}



/******************************************************************
 Add further event listeners, especially for the save/submit button
 ******************************************************************/
// set an event handler for the submit/save button
saveButton.addEventListener("click", handleSaveButtonClickEvent);
// neutralize the submit event
// formEl.addEventListener( 'submit', function (e) {
//     e.preventDefault();
//     formEl.reset();
// });
// // set a handler for the event when the browser window/tab is closed
// window.addEventListener("beforeunload", Person.saveAll);

// console.log("PersonTypeEL.MEMBER: " + PersonTypeEL.MEMBER + "/type: " + typeof PersonTypeEL.MEMBER);

async function handleSaveButtonClickEvent() {
    const formEl = document.forms['Person'],
        assoClubsListEl = assoClubsCrtWidget.querySelector("ul"),
        assoAssociationsListEl = assoAssociationsCrtWidget.querySelector("ul");

    const selectedTypesOptions = typeFieldsetEl.getAttribute("data-value");
    const slots = {
        personId: formEl.personId.value,
        name: formEl.name.value,
        dateOfBirth: formEl.dateOfBirth.value,
        gender: genderFieldsetEl.getAttribute("data-value"),
        type: []
    };

    // if (typeof slots.gender === 'string') {
    //     slots.gender = parseInt(slots.gender);
    // }
    slots.type = JSON.parse(selectedTypesOptions);

    // await Person.add( slots);

    // set error messages in case of constraint violations
    showProgressBar( "show");
    formEl.personId.setCustomValidity(( await Person.checkPersonIdAsId(slots.personId)).message);
    formEl.name.setCustomValidity( Person.checkName( slots.name).message);
    formEl.dateOfBirth.setCustomValidity( Person.checkDateOfBirth( slots.dateOfBirth).message);
    formEl.gender[0].setCustomValidity( Person.checkGender( slots.gender).message);
    formEl.type[0].setCustomValidity(
        Person.checkTypes( slots.type).message);



    // get the list of selected assoClubs & assoAssociations
    // const selClubOptions = formEl.selectAssoClubs.selectedOptions;
    // const selAssoOptions = formEl.selectAssoAssociations.selectedOptions;



    if (slots.type) {
        // check type and save association entities depending on types
        if (slots.type.includes(PersonTypeEL.MEMBER)) {
            console.log("contains MEMBER");
            slots.assoClubIdRefs = [];
            slots.assoAssociationIdRefs = [];

            // get the list of selected assoClubs
            for (const el of assoClubsListEl.children) {
                // console.log(el.getAttribute("data-value") + "/type: " +
                // typeof el.getAttribute("data-value"));
                // console.log(el);
                slots.assoClubIdRefs.push( parseInt(el.getAttribute("data-value")));
            }
            if (slots.assoClubIdRefs.length > 0) {
                for (const ac of slots.assoClubIdRefs) {
                    // console.log("ac: " + ac + "/type: " + typeof ac);
                    let responseValidation = await Member.checkAssoClub( String(ac));
                    if (responseValidation.message) {
                        formEl["crtAssoClubs"].setCustomValidity( responseValidation.message);
                        break;
                    }  else formEl["crtAssoClubs"].setCustomValidity( "");
                }
            } else {
                formEl["crtAssoClubs"].setCustomValidity( "");
            }

            // get the list of selected assoAssociations
            for (const el of assoAssociationsListEl.children) {
                slots.assoAssociationIdRefs.push( parseInt(el.getAttribute("data-value")));
            }
            if (slots.assoAssociationIdRefs.length > 0) {
                for (const aa of slots.assoAssociationIdRefs) {
                    let responseValidation = await Member.checkAssoAssociation( String(aa));
                    if (responseValidation.message) {
                        formEl["crtAssoAssociations"].setCustomValidity( responseValidation.message);
                        break;
                    }  else formEl["crtAssoAssociations"].setCustomValidity( "");
                }
            } else {
                formEl["crtAssoAssociations"].setCustomValidity( "");
            }
            // else {
            //     formEl["crtAssoAssociations"].setCustomValidity(
            //         formEl["crtAssoAssociations"].value ? "" : "No associated association selected!"
            //     );
            // }

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

                await Member.add(slots);

                // drop widget content
                assoClubsListEl.innerHTML = "";
                assoAssociationsListEl.innerHTML = "";
                // formEl.reset();
            }

            // await Member.add(slots);
        }
        if (slots.type.includes(PersonTypeEL.PLAYER)) {
            console.log("contains PLAYER");

            // formEl.selectClubPlayer.setCustomValidity(
            //     formEl.selectClubPlayer.value.length > 0 ? "" :
            //         "No associated club selected!"
            // );
            // selectClubPlayerEl.addEventListener("change", function() {
            //     console.log(selectClubPlayerEl.value);
            // })
            // console.log(formEl.selectClubPlayer.value);
            // console.log(selectClubPlayerEl.value);

            formEl.selectClubPlayer.setCustomValidity(
                (formEl.selectClubPlayer.value.length > 0) ? "" : "No associated club selected!"
            );

            // console.log(formEl.selectClubPlayer.value.length);
            // selectClubPlayerEl.addEventListener("click", function () {
            //     formEl.selectClubPlayer[0].setCustomValidity(
            //         (!selectClubPlayerEl.value) ?
            //             "A associated club must be selected!":"" );
            // });
            // console.log(slots);
            if (formEl.checkValidity()) {
                slots.assoClub_id = parseInt(formEl.selectClubPlayer.value);
                // console.log("checkValidity");
                // console.log(slots);
                await Player.add(slots);
            }

        }
        if (slots.type.includes(PersonTypeEL.COACH)) {
            console.log("contains COACH");

            formEl.selectClubCoach.setCustomValidity(
                formEl.selectClubCoach.value.length > 0 ? "" :
                    "No associated club selected!"
            );
            if (formEl.checkValidity()) {
                slots.assoClub_id = parseInt(formEl.selectClubCoach.value);
                await Coach.add(slots);
            }

        }
        if (slots.type.includes(PersonTypeEL.PRESIDENT)) {
            console.log("contains PRESIDENT");

            formEl.selectAssoPresident.setCustomValidity(
                formEl.selectAssoPresident.value.length > 0 ? "" :
                    "No associated association selected!"
            );
            if (formEl.checkValidity()) {
                slots.assoAssociation_id = parseInt(formEl.selectAssoPresident.value);
                await President.add(slots);

            }
        }
    }
    if (formEl.checkValidity()) {
        await Person.add(slots.personId, slots.name, slots.dateOfBirth, slots.gender, slots.type);
        // undisplayAllSegmentFields( formEl, PersonTypeEL.labels);
        // formEl.reset();
    }

    if (formEl.checkValidity()) {
        undisplayAllSegmentFields( formEl, PersonTypeEL.labels);
        formEl.reset();
    }
    showProgressBar( "hide");

    // formEl.reset();




    // console.log("slots.type: " + slots.type + "/type: " + typeof slots.type);

    // // construct the list of selected type
    // for (const g of selectedTypesOptions) {
    //     slots.type.push( parseInt( g.value));
    // }


}


// neutralize the submit event
formEl.addEventListener("submit", function (e) {

    e.preventDefault();
});
