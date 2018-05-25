/*
  This script will take all GPIO motion dectection and log that
  activity into the local_cache.
*/
var Gpio;
var motion_gpio;
const use_test_gpio = false;

if (use_test_gpio) {
  gpio = require('./gpio_test');
} else {
  Gpio = require('onoff').Gpio;
  var motion_gpio = new Gpio(15, 'in');
}

var moment = require('moment');
const db = require('../data/frame_tv_db');
var cache = require('./local_cache');
var waitTime = 250
var motionInterval;
var motionResult = 0;
var previousMotionResult = 0;
var startTime;
var endTime;

motionInterval = getMotionInterval()


function getMotionInterval(){
  return setInterval(() => {
    previousMotionResult = motionResult
    motionResult = motion_gpio.readSync();

    if (motionResult === 1) {
      if (previousMotionResult != motionResult) {
        // starting a new motion detection loop
        startTime = moment()
      } else {
        // see if we should end the detection early
        var tv_motion_sensitivity = cache.get_setting("Motion Sensitivity")
        currentDuration = moment() - startTime
        if (tv_motion_sensitivity < currentDuration) {
          endTime = moment()
          result = {}
          result["Status"] = "Motion"
          result["TimeStamp"] = moment().format('YYYY-MMM-DD h:mm:ss a')
          result["MotionDuration"] = endTime - startTime
          cache.add_monitor_alert(result)
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
        cache.add_monitor_alert(result)
      }
    }
  }, waitTime);
}

module.exports = {

  Start: function(){
    motionInterval = getMotionInterval()
  },

  Stop: function(){
    clearInterval(motionInterval);
  },

  Get_Status: function(){
    if (motionInterval["_idleTimeout"] === -1) {
      return false;
    } else {
      return true;
    }
  }
}
