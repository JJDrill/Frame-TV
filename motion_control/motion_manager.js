/*
  This script will take all GPIO motion dectection and log that
  activity into the local_cache.
*/
const db = require('../data/frame_tv_db');
var settings = require('../settings_cache');
var moment = require('moment');
var Gpio;
var motion_gpio;
const use_test_gpio = false;

if (use_test_gpio) {
  motion_gpio = require('./gpio_test');
} else {
  Gpio = require('onoff').Gpio;
  var motion_gpio = new Gpio(15, 'in');
}

if (use_test_gpio) {
  db.Add_Log(null, "RESPONDER",
  "WARNING! Motion monitor is using GPIO test data.").then()
}

var waitTime = 250;
var motionInterval;
var motionResult = 0;
var previousMotionResult = 0;
var startTime;
var endTime;

var ipc = require('node-ipc');
ipc.config.id   = 'motion_monitor';
ipc.config.retry= 1500;

motionInterval = getMotionInterval()

function getMotionInterval(){
  return setInterval(() => {
    previousMotionResult = motionResult
    motionResult = motion_gpio.readSync();

    if (motionResult === 1) {
    console.log(moment())
      if (previousMotionResult != motionResult) {
        // starting a new motion detection loop
        startTime = moment()
      } else {
        // see if we should end the detection early
        var tv_motion_sensitivity = settings.get_setting("Motion Sensitivity")
        currentDuration = moment() - startTime
        if (tv_motion_sensitivity < currentDuration) {
          endTime = moment()
          result = {}
          result["Status"] = "Motion"
          result["TimeStamp"] = moment().format('YYYY-MMM-DD h:mm:ss a')
          result["MotionDuration"] = endTime - startTime
          Submit_Alert(result);

          // fake the end of a motion detection
          motionResult = 0
        }
      }

    } else {
      // ending a motion detection loop
      if (previousMotionResult != motionResult) {
        endTime = moment()
        result = {}
        result["Status"] = "Motion"
        result["TimeStamp"] = moment().format('YYYY-MMM-DD h:mm:ss a')
        result["MotionDuration"] = endTime - startTime
        Submit_Alert(result);
      }
    }
  }, waitTime);
}

function Submit_Alert(alert){
  ipc.connectTo('world', function(){
    ipc.of.world.emit('montion_alert', alert);
  });
}

// module.exports = {
//
//   Start: function(){
//     motionInterval = getMotionInterval()
//   },
//
//   Stop: function(){
//     clearInterval(motionInterval);
//   },
//
//   Get_Status: function(){
//     if (motionInterval["_idleTimeout"] === -1) {
//       return false;
//     } else {
//       return true;
//     }
//   }
// }
