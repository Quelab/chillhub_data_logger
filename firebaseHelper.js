var fb = require('firebase');
var fs = require('fs');

var token = "";
var chUUID = "";
var url = "";
var attachments = [];

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
                  connectToFirebase(fb, token, chUUID, url, callback);
               }
            });
         } else { // if configFile
         callback(new UndefinedPropertyError('configFile'));
      } } else { // if callback
         throw new UndefinedPropertyError('callback');
      }
   }

var connectToFirebase = function(fb, token, chUUID, url, callback) {
   var firebase = new fb(url);
   firebase.authWithCustomToken(token, function(e, auth) {
      if (e) {
         console.log("Error logging into firebase.");
         printError(e);
         // pass the error back to the host
         callback(e);
      } else {
         console.log("Successful firebase login.");
         new_firebase = new fb(url + '/users/' + auth.uid + '/devices/chillhubs/' + chUUID);
         callback(null, new_firebase);
      }
   } );
}

module.exports = {
   startConnection: startConnection
};
