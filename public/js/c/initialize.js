/**
 * @fileOverview  Defining the main namespace ("public library") and its MVC subnamespaces
 * @authors Gerd Wagner & Juan-Francisco Reyes
 */
'use strict';
// main namespace pl = "public library"
// const pl = {m:{}, v:{}, c:{}};

// initialize Cloud Firestore through Firebase
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyB_lo7E_7ySfyYyvnUEGJw7cwWtIovn2iE",
    authDomain: "dfbproject-7aeac.firebaseapp.com",
    projectId: "dfbproject-7aeac"
  });
} else { // if already initialized
  firebase.app();
}
// initialize Firestore database interface
const db = firebase.firestore();
// initialize Firebase user authentication interface
var auth = firebase.auth();