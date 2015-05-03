var Firebase = require('firebase');
var listenForHumidityChange = function(fb){
  var ref = new fb("https://quelab-chillhub.firebaseio.com/users/simplelogin%3A1/devices/chillhubs/d84f6894-b3c0-4dd5-9b82-5632b8a7d1ce/serial_data");
  ref.once("value", function(snapshot) {
    var data = snapshot.val();
    console.log(data);
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});
}
listenForHumidityChange(Firebase);