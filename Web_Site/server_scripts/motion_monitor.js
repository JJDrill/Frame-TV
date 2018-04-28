// var Gpio = require('onoff').Gpio;
var Stopwatch = require("node-stopwatch").Stopwatch;
const NodeCache = require( "node-cache" );

var stopwatch = Stopwatch.create();
const CACHE_NAME = "Motion";
var waitTime = 10000
var myCache;

// Set the GPIO pin number the motion sensor is connected to
// var motion_gpio = new Gpio(15, 'in');
// Set up GPIO and set to input
// echo "$GPIO" > /sys/class/gpio/export
// echo "in" > /sys/class/gpio/gpio$GPIO/direction

function Get_Motion_Status(){
  motion_result = Math.floor(Math.random() * 2);
  obj = {}

  if (motion_result === 0) {
    obj["Status"] = "No Motion"
  } else {
    stopwatch.start();

    while (motion_result <= 998) {
      motion_result = Math.floor(Math.random() * 1000);
      // console.log("motion_result: ", motion_result);
    }

    stopwatch.stop();
    obj["Status"] = "Motion"
    obj["TimeStamp"] = Date()
    obj["diff"] = stopwatch.elapsedMilliseconds
  }

  return obj
}

module.exports = {

  Start: function(theCache){
    myCache = theCache
    obj = []
    myCache.set( CACHE_NAME, obj, function( err, success ){})

    setInterval(() => {
      obj = Get_Motion_Status()

      motion_array = myCache.get(CACHE_NAME)
      motion_array.push(obj)
      myCache.set( CACHE_NAME, motion_array, function( err, success ){})
    }, 1000);
  }

}
