var fb = require('firebase');
var fs = require('fs');

var token = "";
var chUUID = "";
var url = "";
var attachments = [];
var hostCallback = {};

var printError = function(e) {
   for(var propName in e) {
      console.log(propName + ": " + e[propName]);
   }
}

function UndefinedPropertyError(property) {
  this.kind = 'error#undefined-property';
  this.property = property;
}

function ConfigFileNotFoundError(error) {
  this.kind = 'error#config-file-not-found';
  this.method = 'readFile';
  this.error = error;
}

var startConnection = function(configFile, callback) {
   if(callback) {
      if (configFile) {
            hostCallback = callback;
            fs.readFile(configFile, function(e, data) {
               if (e) {
                  console.log("Error opening config file.");
                  printError(e);
                  hostCallback(new ConfigFileNotFoundError(e));
               } else {
                  console.log("Config file opened.");
                  var obj = JSON.parse(data);
                  token = obj.token;
                  chUUID = obj.uuid;
                  url = obj.firebaseUrl
                  connectToFirebase(fb, token, chUUID, url);
               }
            });
         } else { // if configFile
         callback(new UndefinedPropertyError('configFile'));
      } } else { // if callback
         throw new UndefinedPropertyError('callback');
      }
   }

var listenForHumidityChange = function(fb){
  var ref = new fb("https://quelab-chillhub.firebaseio.com/users/simplelogin%3A1/devices/chillhubs/d84f6894-b3c0-4dd5-9b82-5632b8a7d1ce/chilldemo/41e1b18e-2d12-4306-9211-c1068bf7f76d");
  ref.on("value", function(snapshot) {
    var data = snapshot.val();
    var value = {};
    var timestamp = new Date().getTime();
    value['Humidity'] = data['Humidity'];
    value['Temperature'] = data['Temperature'];
    value['Time'] = Math.floor(timestamp/1000);
    value['Time'] = fb.ServerValue.TIMESTAMP
    pushDataPoint(value);
    console.log(value);
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});
}

var pushDataPoint = function(data){
  var ref = new fb("https://quelab-chillhub.firebaseio.com/users/simplelogin%3A1/devices/chillhubs/d84f6894-b3c0-4dd5-9b82-5632b8a7d1ce/serial_data");
  ref.push(data);
}

var connectToFirebase = function(fb, token, chUUID, url) {
   var firebase = new fb(url);
   firebase.authWithCustomToken(token, function(e, auth) {
      if (e) {
         console.log("Error logging into firebase.");
         printError(e);
         // pass the error back to the host
         hostCallback(e);
      } else {
         console.log("Successful firebase login.");
         listenForHumidityChange(fb);
      }
   } );
}


module.exports = {
   startConnection: startConnection
};
