/**
 * @fileOverview  The model class Person with attribute definitions and storage management methods
 * @authors Gerd Wagner & Juan-Francisco Reyes (modified by Mina Lee)
 * @copyright Copyright 2013-2021 Gerd Wagner (Chair of Internet Technology) and Juan-Francisco Reyes, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import {createIsoDateString, isIntegerOrIntegerString, isNonEmptyString} from "../../lib/util.mjs";
import {
  NoConstraintViolation,
  MandatoryValueConstraintViolation,
  RangeConstraintViolation,
  UniquenessConstraintViolation,
  IntervalConstraintViolation
}
  from "../../lib/errorTypes.mjs";

import Enumeration from "../../lib/Enumeration.mjs";

/**
 * Define two Enumerations
 */
const PersonTypeEL = new Enumeration(["Member", "Player", "Coach", "President"]);
const GenderEL = new Enumeration({"M":"Male", "F":"Female", "U":"Undetermined"});

/**
 * Constructor function for the class Person
 */
class Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor({personId, name, dateOfBirth, gender, type}) {
    this.personId = personId; // number (integer)
    this.name = name; // string
    this.dateOfBirth = dateOfBirth; // date
    this.gender = gender; // GenderEL
    this.type = type; // PersonTypeEL
  }
  get personId() {
    return this._personId;
  }
  static checkPersonId(id) {
    if (!id) {
      return new NoConstraintViolation();  // may be optional as an IdRef
    } else {
      // convert to integer
      id = parseInt( id);
      if (isNaN( id) || !Number.isInteger( id) || id < 1) {
        return new RangeConstraintViolation("The person ID must be a positive integer!");
      } else {
        return new NoConstraintViolation();
      }
    }
  }
  /*
     Checks ID uniqueness constraint against the direct type of a Person object
     */
  static checkPersonIdAsId( id, type) {
    if (!type) type = Person;  // default
    id = parseInt( id);
    if (isNaN(id)) {
      return new MandatoryValueConstraintViolation(
          "A positive integer value for the person ID is required!");
    }
    let validationResult = Person.checkPersonId( id);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (type.instances[id]) {
        validationResult = new UniquenessConstraintViolation(
            `There is already a ${type.name} record with this person ID!`);
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set personId( id) {
    // this.constructor may be Person or any category of it
    var validationResult = Person.checkPersonIdAsId( id, this.constructor);
    if (validationResult instanceof NoConstraintViolation) {
      this._personId = parseInt( id);
    } else {
      throw validationResult;
    }
  }
  get name() {
    return this._name;
  }
  static checkName(n) {
    if (!n) {
      return new MandatoryValueConstraintViolation("A name must be provided!");
    } else if (!isNonEmptyString(n)) {
      return new RangeConstraintViolation("The name must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set name( n) {
    const constraintViolation = Person.checkName( n);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._name = n;
    } else {
      throw constraintViolation;
    }
  }

  get dateOfBirth() {
    return this._dateOfBirth;
  }
  static checkDateOfBirth(dob) {
    const BIRTH_DATE_MIN = new Date("1890-01-01");
    if (!dob || dob === "") return new MandatoryValueConstraintViolation(
        "A value for the date of birth must be provided!"
    );
    else {
      if (new Date(dob) < BIRTH_DATE_MIN) {
        return new IntervalConstraintViolation(
            `The value of date of birth must be greater than or equal to 
              ${createIsoDateString(BIRTH_DATE_MIN)}!`);
      } else {
        return new NoConstraintViolation();
      }
    }
  }
  set dateOfBirth(dob) {
    const validationResult = Person.checkDateOfBirth( dob);
    if (validationResult instanceof NoConstraintViolation) {
      this._dateOfBirth = new Date( dob);
    } else {
      throw validationResult;
    }
  }

  get gender() {
    return this._gender;
  }
  static checkGender(g) {
    if (!g) {
      return new NoConstraintViolation();
    } else if (!isIntegerOrIntegerString(g) ||
        parseInt(g) < 1 || parseInt(g) > GenderEL.MAX) {
      return new RangeConstraintViolation(
          `Invalid value for gender: ${g}`);
    } else {
      return new NoConstraintViolation();
    }
  }
  set gender(g) {
    const validationResult = Person.checkGender( g);
    if (validationResult instanceof NoConstraintViolation) {
      this._gender = parseInt( g);
    } else {
      throw validationResult;
    }
  }

  get type() {
    return this._type;
  }
  static checkType(t) {
    if (!t) {
      return new MandatoryValueConstraintViolation(
          "No type form provided!");
    } else if (!Number.isInteger( t) || t < 1 ||
        t > PersonTypeEL.MAX) {
      return new RangeConstraintViolation(`Invalid value for type form: ${t}`);
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkTypes(t) {
    if (!t || (Array.isArray( t) &&
        t.length === 0)) {
      return new MandatoryValueConstraintViolation(
          "No type form provided!");
    } else if (!Array.isArray( t)) {
      return new RangeConstraintViolation(
          "The value of type must be an array!");
    } else {
      for (const i of t.keys()) {
        const validationResult = Person.checkType( t[i]);
        if (!(validationResult instanceof NoConstraintViolation)) {
          return validationResult;
        }
      }
      return new NoConstraintViolation();
    }
  }
  set type(t) {
    const validationResult = Person.checkTypes( t);
    if (validationResult instanceof NoConstraintViolation) {
      this._type = t;
    } else {
      throw validationResult;
    }
  }

}
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/
// Load a person record from Firestore
Person.retrieve = async function (personId) {
  const personsCollRef = db.collection("persons"),
      personDocRef = personsCollRef.doc( personId);
  var personDocSnapshot=null;
  try {
    personDocSnapshot = await personDocRef.get();
  } catch( e) {
    console.error(`Error when retrieving person record: ${e}`);
    return null;
  }
  const personRecord = personDocSnapshot.data();
  return personRecord;
};
// Load all person records from Firestore
Person.retrieveAll = async function () {
  const personsCollRef = db.collection("persons");
  // console.log(await Person.retrieve("1"));
  var personsQuerySnapshot=null;
  try {
    personsQuerySnapshot = await personsCollRef.get();
  } catch( e) {
    console.error(`Error when retrieving person records: ${e}`);
    return null;
  }
  const personDocs = personsQuerySnapshot.docs,
      personRecords = personDocs.map( d => d.data());
  console.log(`${personRecords.length} person records retrieved.`);
  return personRecords;
};
/***********************************************
 *** Class-level ("static") properties **********
 ************************************************/
Person.instances = {}; // initially an empty collection (in the form of a map)
Person.subtypes = [];  // initially an empty collection (in the form of a list)


// Create a Firestore document in the Firestore collection "persons"
Person.add = async function (slots) {
  const personsCollRef = db.collection("persons"),
      personDocRef = personsCollRef.doc( slots.personId);
  try {
    await personDocRef.set( slots);
  } catch( e) {
    console.error(`Error when adding person record: ${e}`);
    return;
  }
  console.log(`Person record '${slots.name}' created.`);
};
// Update a Firestore document in the Firestore collection "persons"
Person.update = async function (slots) {
  const updSlots={};
  // retrieve up-to-date person record
  const personRec = await Person.retrieve( slots.personId);
  // update only those slots that have changed
  if (personRec.name !== slots.name) updSlots.name = slots.name;
  if (personRec.dateOfBirth !== slots.dateOfBirth) updSlots.dateOfBirth = slots.dateOfBirth;
  if (personRec.gender !== slots.gender) updSlots.gender = slots.gender;
  if (personRec.type !== slots.type) updSlots.type = slots.type;

  if (Object.keys( updSlots).length > 0) {
    try {
      await db.collection("persons").doc( slots.personId).update( updSlots);
    } catch( e) {
      console.error(`Error when updating person record: ${e}`);
      return;
    }
    console.log(`Person record '${slots.name}' modified.`);
  }
};
// Delete a Firestore document in the Firestore collection "persons"
Person.destroy = async function (personId) {
  try {
    await db.collection("persons").doc( personId).delete();
  } catch( e) {
    console.error(`Error when deleting person record: ${e}`);
    return;
  }
  console.log(`Person record with person ID '${personId}' deleted.`);
};
/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
// Create test data
Person.generateTestData = async function () {
  let personRecords = [
    {
      personId: "1",
      name: "Manuel Neuer",
      dateOfBirth: "1986-03-27",
      gender: GenderEL.M,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "2",
      name: "Antonio Rudiger",
      dateOfBirth: "1993-03-03",
      gender: GenderEL.M,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "3",
      name: "Marcel Halstenberg",
      dateOfBirth: "1991-09-27",
      gender: GenderEL.M,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "4",
      name: "Matthias Ginter",
      dateOfBirth: "1994-01-19",
      gender: GenderEL.M,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "5",
      name: "Mats Hummels",
      dateOfBirth: "1988-12-16",
      gender: GenderEL.M,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "6",
      name: "Joshua Kimmich",
      dateOfBirth: "1995-02-08",
      gender: GenderEL.M,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "7",
      name: "Kai Havertz",
      dateOfBirth: "1999-06-11",
      gender: GenderEL.M,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "8",
      name: "Toni Kroos",
      dateOfBirth: "1990-01-04",
      gender: GenderEL.M,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "9",
      name: "Kevin Volland",
      dateOfBirth: "1992-07-30",
      gender: GenderEL.M,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "10",
      name: "Serge Gnabry",
      dateOfBirth: "1995-07-14",
      gender: GenderEL.M,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "11",
      name: "Timo Werner",
      dateOfBirth: "1996-03-06",
      gender: GenderEL.M,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "12",
      name: "Joachim Löw",
      dateOfBirth: "1960-02-03",
      gender: GenderEL.M,
      type: [PersonTypeEL.COACH]
    },
    {
      personId: "13",
      name: "Merle Frohms",
      dateOfBirth: "1995-01-28",
      gender: GenderEL.F,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "14",
      name: "Sophia Kleinherne",
      dateOfBirth: "2000-04-12",
      gender: GenderEL.F,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "15",
      name: "Jana Feldkamp",
      dateOfBirth: "1998-03-15",
      gender: GenderEL.F,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "16",
      name: "Leonie Maier",
      dateOfBirth: "1992-09-29",
      gender: GenderEL.F,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "17",
      name: "Lena Sophie Oberdorf",
      dateOfBirth: "2001-12-19",
      gender: GenderEL.F,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "18",
      name: "Lea Schuller",
      dateOfBirth: "1997-11-12",
      gender: GenderEL.F,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "19",
      name: "Sydney Lohmann",
      dateOfBirth: "2000-06-19",
      gender: GenderEL.F,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "20",
      name: "Svenja Huth",
      dateOfBirth: "1991-01-25",
      gender: GenderEL.F,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "21",
      name: "Laura Benkarth",
      dateOfBirth: "1992-10-14",
      gender: GenderEL.F,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "22",
      name: "Laura Freigang",
      dateOfBirth: "1998-02-01",
      gender: GenderEL.F,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "23",
      name: "Tabea Wassmuth",
      dateOfBirth: "1996-08-25",
      gender: GenderEL.F,
      type: [PersonTypeEL.PLAYER]
    },
    {
      personId: "24",
      name: "Martina Voss-Tecklenburg",
      dateOfBirth: "1967-12-22",
      gender: GenderEL.F,
      type: [PersonTypeEL.COACH]
    },
    {
      personId: "25",
      name: "Peter Peters",
      dateOfBirth: "1965-11-10",
      gender: GenderEL.M,
      type: [PersonTypeEL.PRESIDENT]
    },
    {
      personId: "26",
      name: "Britta Carlson",
      dateOfBirth: "1978-03-03",
      gender: GenderEL.F,
      type: [PersonTypeEL.PRESIDENT]
    },
    {
      personId: "27",
      name: "Patrik Grolimund",
      dateOfBirth: "1980-08-19",
      gender: GenderEL.M,
      type: [PersonTypeEL.MEMBER, PersonTypeEL.COACH]
    },
    {
      personId: "28",
      name: "Sandra Starke",
      dateOfBirth: "1993-07-31",
      gender: GenderEL.F,
      type: [PersonTypeEL.MEMBER, PersonTypeEL.PLAYER]
    }
  ];
  // save all person records
  await Promise.all( personRecords.map(
      personRec => db.collection("persons").doc( personRec.personId).set( personRec)
  ));
  console.log(`${Object.keys( personRecords).length} persons saved.`);
};
// Clear test data
Person.clearData = async function () {
  if (confirm("Do you really want to delete all person records?")) {
    // retrieve all person documents from Firestore
    const personRecords = await Person.retrieveAll();
    // delete all documents
    await Promise.all( personRecords.map(
        personRec => db.collection("persons").doc( personRec.personId).delete()));
    // ... and then report that they have been deleted
    console.log(`${Object.values( personRecords).length} persons deleted.`);
  }
};

export default Person;
export { GenderEL, PersonTypeEL };

