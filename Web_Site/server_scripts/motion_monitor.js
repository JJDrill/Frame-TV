var gpio;
use_test_gpio = true;
if (use_test_gpio = true) {
  gpio = require('./gpio_test');
} else {
  gpio = require('onoff').Gpio;
}

var moment = require('moment');
var Stopwatch = require("node-stopwatch").Stopwatch;

const db = require('../data/frame_tv_db');
const app_settings = require('./settings_cache.js');
var stopwatch = Stopwatch.create();
var waitTime = 1000
var motion_count = 0

// Set the GPIO pin number the motion sensor is connected to
// var motion_gpio = new Gpio(15, 'in');
// Set up GPIO and set to input
// echo "$GPIO" > /sys/class/gpio/export
// echo "in" > /sys/class/gpio/gpio$GPIO/direction

setInterval(() => {

  if (gpio.Get_Status() === 1) {

    stopwatch.start();
    while (gpio.Get_Status() === 1) {
      motion_result = gpio.Get_Response_Time();
      console.log("motion_result: ", motion_result);
    }
    stopwatch.stop();

    result = {}
    result["Status"] = "Motion"
    result["TimeStamp"] = Date()
    // result["diff"] = stopwatch.elapsedMilliseconds
    result["diff"] = gpio.Get_Response_Time()
    console.log("Registering motion detection: ", result);

    log_motion_detection(result["diff"])
  }
}, waitTime);


function log_db_message(activity, description){
  date = moment().format('YYYY-MMM-DD h:mm:ss a')
  db.Add_Log(date, activity, description).then(function(){})
}

function log_motion_detection(time_duration){
  if (time_duration >= app_settings.Get_Setting("Motion Sensitivity")) {
    motion_count += 1
    message = "Motion detected after " + "TODO" + " seconds. (Count: " +
              motion_count + " - Duration: " + time_duration + ")"
    log_db_message("MOTION", message)
  } else {
    message = "Motion of " + time_duration +
              " milliseconds detected but did not reach sensitivity of " +
              app_settings.Get_Setting("Motion Sensitivity") + " milliseconds."
    log_db_message("MOTION", message)
  }
}
