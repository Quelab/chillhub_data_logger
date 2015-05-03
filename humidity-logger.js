// Packages...
var fs = require('fs');
var firebase = require("firebase");
var util = require("util");
var fb = require('./firebaseHelper.js');
// Configs
var packageFile = "./package.json";
var configFile = "./chillhub.json";

var startFirebase = function() {
   fb.startConnection(configFile, function(e, attachments) {
      if (e) {
         console.log("Error connecting to firebase.");
      } else {
         // got our attachment point
         console.log("Connected to firebase, initializing devices.");
      }
   });
}
startFirebase();