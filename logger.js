// Packages...
var fs = require('fs');
var Firebase = require("firebase");
var util = require("util");
var fb = require('./firebaseHelper.js');

// Configs
var packageFile = "./package.json";
var configFile = "./share/chillhub.json";

var additionalKeysToExclude = [];

Object.filterOutKeys = function( obj, keys) {
    var result = {}, key;
    for (key in obj) {
        if (keys.indexOf(key) < 0) {
            result[key] = obj[key];
        }
    }

    return result;
};

var startFirebase = function(keysToExclude) {
   fb.startConnection(configFile, function(e, attachments) {
      if (e) {
         console.log("Error connecting to firebase.");
      } else {
         // got our attachment point
         console.log("Connected to firebase, configuring loggers.");
         configureLoggers(attachments, keysToExclude);
      }
   });
}

var useServerOffset = function(ref, callback){
   var offset = 0;
   var parent = ref.root();
    parent.child('.info/serverTimeOffset').on('value', function(snap) {
       offset = snap.val();
       console.log(new Date(Date.now() + offset).toISOString());
       callback(offset);
    });
}

var createLogger = function(event_ref, log_ref, offset){
  event_ref.on("value", function(snapshot){
    var ignoreKeys = ['status', 'created'];
    var data = Object.filterOutKeys(snapshot.val(), ignoreKeys);
    var current_day = new Date(Date.now() + offset).toISOString().substring(0, 10);
    var new_log_ref = log_ref.child(current_day)

    data['Time'] =  Firebase.ServerValue.TIMESTAMP;
    console.log(data);
    new_log_ref.push(data);
  })
}

var configureLoggers = function(ref, keysToExclude){
  ref.once("value", function(snapshot) {
    var ignoreList = [ 'created', 'hardware_version', 'serial_data','software_version', 'status', 'updated', 'chilldemo']
    ignoreList = ignoreList.concat(keysToExclude);
    var data = Object.filterOutKeys(snapshot.val(), ignoreList);
    var chillHubKeys = Object.keys(data);
    console.log(chillHubKeys);
    useServerOffset(ref, function(offset){
      chillHubKeys.forEach(function(device_type){
        Object.keys(data[device_type]).forEach(function(device_uuid){
          console.log(ref.child(device_type).child(device_uuid).toString());
          var event_ref = ref.child(device_type).child(device_uuid);
          var log_ref =   ref.root().child(device_type).child(device_uuid);
          createLogger(event_ref, log_ref, offset);
        });
      })
    })

}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});
}

process.argv.forEach(function (val, index, array) {
  if (index > 1){ additionalKeysToExclude.push(val); }
});
console.log("Excluding the following keys:" + additionalKeysToExclude);
startFirebase(additionalKeysToExclude);