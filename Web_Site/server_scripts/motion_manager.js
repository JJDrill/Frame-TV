const db = require('../data/frame_tv_db');
var moment = require('moment');
var cache = require('./local_cache');

var wait_time = 1000;
var seconds_counter = 0;
var motion_count = 0;

// database modes
// const SETTING_TV_MODE = "TV Mode"
const DB_STATIC_ON = "Static_On"
const DB_STATIC_OFF = "Static_Off"
const DB_STATIC_MOTION = "Static_Motion"
const DB_SCHEDULED = "Scheduled"

setInterval(() => {
  seconds_counter += wait_time / 1000
  alerts = cache.purge_montior_alerts()

  alerts.forEach(function(item) {
    console.log('Found motion alert: ', item);
    log_to_db(item.TimeStamp, item.diff)
    var tv_action = get_tv_action()
    // get the current state of the tv
  })
}, wait_time);


function log_to_db(time_stamp, time_duration){
  motion_sensitivity = cache.get_setting("Motion Sensitivity")
  var message = ""

  if (time_duration >= motion_sensitivity) {
    motion_count += 1
    message = "Motion detected after " + seconds_counter + " seconds. (Count: " +
              motion_count + " - Duration: " + time_duration + ")"
  } else {
    message = "Motion of " + time_duration +
              " milliseconds detected but did not reach sensitivity of " +
              motion_sensitivity + " milliseconds."
  }

  db.Add_Log(time_stamp, "MOTION", message).then(function(){})
}

function get_tv_action(){
  // set our tv_action based on the tv_mode
  mode = cache.get_setting("TV Mode")
  tv_action = ""

  if (mode === DB_STATIC_ON) {
    return TV_ACTION_ON

  } else if (mode === DB_STATIC_OFF) {
    return TV_ACTION_OFF

  } else if (mode === DB_STATIC_MOTION) {
    return TV_ACTION_MOTION

  } else if (mode === DB_SCHEDULED) {
    return cache.get_setting("Scheduled Mode")

  } else {
    message = "ERROR: Mode not supported: " + mode
    console.log(message)
    return message
  }
}
