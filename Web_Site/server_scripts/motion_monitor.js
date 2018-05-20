/*
  This script will take all GPIO motion dectection and log that
  activity into the local_cache.
*/
var gpio;
use_test_gpio = true;
if (use_test_gpio = true) {
  gpio = require('./gpio_test');
} else {
  gpio = require('onoff').Gpio;
}

var Stopwatch = require("node-stopwatch").Stopwatch;
var moment = require('moment');
const db = require('../data/frame_tv_db');
var cache = require('./local_cache');
var stopwatch = Stopwatch.create();
var waitTime = 1000
var motion_count = 0
var detectingMotion = false
var motionInterval;

// Set the GPIO pin number the motion sensor is connected to
// var motion_gpio = new Gpio(15, 'in');
// Set up GPIO and set to input
// echo "$GPIO" > /sys/class/gpio/export
// echo "in" > /sys/class/gpio/gpio$GPIO/direction

motionInterval = getMotionInterval()

function getMotionInterval(){
  return setInterval(() => {
    if (cache.get_setting("Target TV Mode") === "MOTION") {
      if (gpio.Get_Status() === 1) {

        stopwatch.start();
        while (gpio.Get_Status() === 1) {
          motion_result = gpio.Get_Response_Time();
        }
        stopwatch.stop();

        result = {}
        result["Status"] = "Motion"
        result["TimeStamp"] = moment().format('YYYY-MMM-DD h:mm:ss a')
        result["diff"] = gpio.Get_Response_Time()
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
