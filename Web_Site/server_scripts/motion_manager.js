const db = require('../data/frame_tv_db');
var moment = require('moment');
var cache = require('./local_cache');
var tv = require('./tv_control');

const DEBUG = true;
var wait_time = 1000;
var seconds_counter = 0;
var motion_count = 0;

setInterval(() => {
  seconds_counter += wait_time / 1000
  alerts = cache.purge_montior_alerts()

  alerts.forEach(function(item) {
    console.log('Found motion alert: ', item);
    log_to_db(item.TimeStamp, item.diff)
    motion_count += 1
  })

  var tv_timeout = cache.get_setting("TV Timeout")
  var tv_timeout_motion_threshold = cache.get_setting("TV Timeout Motion Threshold")
  var target_tv_mode = cache.get_setting("Target TV Mode")
  // console.log("target_tv_mode: ", target_tv_mode);

  if (target_tv_mode === "OFF") {
    current_tv_state = tv.Get_State(DEBUG);

  } else if (target_tv_mode === "ON") {
    current_tv_state = tv.Get_State(DEBUG);

  } else if (target_tv_mode === "MOTION") {

    if (seconds_counter >= tv_timeout) {
      console.log("Checking tv state...");

      // if out motion detections are less than the threshold just keep the tv on
      if (motion_count < tv_timeout_motion_threshold) {
        current_tv_state = tv.Get_State(DEBUG);
        console.log("current_tv_state: ", current_tv_state);
      }

      seconds_counter = 0
      motion_count = 0
    }
  }

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

// function get_target_tv_mode(){
//   target_tv_mode = cache.get_setting("TV Mode")
//
//   if (target_tv_mode === db.TV_Modes.DB_STATIC_ON) {
//     return "ON"
//
//   } else if (target_tv_mode === db.TV_Modes.DB_STATIC_OFF) {
//     return "OFF"
//
//   } else if (target_tv_mode === db.TV_Modes.DB_STATIC_MOTION) {
//     return "MOTION"
//
//   } else if (target_tv_mode === db.TV_Modes.DB_SCHEDULED) {
//     return cache.get_setting("Scheduled Mode")
//
//   } else {
//     message = "ERROR: Mode not supported: " + target_tv_mode
//     console.log(message)
//     return message
//   }
// }
