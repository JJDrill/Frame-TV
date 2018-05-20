const db = require('../data/frame_tv_db');
// var moment = require('moment');
var cache = require('./local_cache');
var tv = require('./tv_control');
const motion_monitor = require('./motion_monitor');

const DEBUG = true;
var wait_time = 1000;
var seconds_counter = 0;
var motion_count = 0;
var target_tv_mode = ""
var previous_target_tv_mode = ""

setInterval(() => {
  seconds_counter += wait_time / 1000
  alerts = cache.purge_montior_alerts()

  alerts.forEach(function(item) {
    console.log('Found motion alert: ', item);
    log_motion_detection(item.TimeStamp, item.diff)
    motion_count += 1
  })

  var tv_timeout = cache.get_setting("TV Timeout")
  var tv_timeout_motion_threshold = cache.get_setting("TV Timeout Motion Threshold")
  previous_target_tv_mode = target_tv_mode
  target_tv_mode = cache.get_setting("Target TV Mode")
  // console.log("target_tv_mode: ", target_tv_mode);
  // console.log("current_tv_mode: ", current_tv_mode);

  if (target_tv_mode != previous_target_tv_mode) {

  }

  if (target_tv_mode === "OFF") {
    StopMotionMonitoring();

    if (true) {
      current_tv_mode = tv.Get_State(DEBUG);
    }

    if (current_tv_mode != target_tv_mode) {
      console.log("Turning the TV Off.");
      db.Add_Log(null, "TV OFF", "Turning the TV Off.").then()
      tv.Turn_Off();
    }

  } else if (target_tv_mode === "ON") {
    StopMotionMonitoring();
    current_tv_mode = tv.Get_State(DEBUG);

    if (current_tv_mode != target_tv_mode) {
      console.log("Turning the TV On.");
      db.Add_Log(null, "TV ON", "Turning the TV On.").then()
      tv.Turn_On();
    }

  } else if (target_tv_mode === "MOTION") {
    StartMotionMonitoring();

    if (seconds_counter >= tv_timeout) {
      // if out motion detections are less than the threshold just keep the tv on
      if (motion_count < tv_timeout_motion_threshold) {
        // current_tv_mode = tv.Get_State(DEBUG);
        // console.log("current_tv_state: ", current_tv_state);
      }

      seconds_counter = 0
      motion_count = 0
    }
  }

}, wait_time);


function log_motion_detection(time_stamp, time_duration){
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

  db.Add_Log(time_stamp, "MOTION", message).then()
}

function StartMotionMonitoring(){
  if (motion_monitor.Get_Status() != true) {
    motion_monitor.Start();
  }
}

function StopMotionMonitoring(){
  if (motion_monitor.Get_Status() != false) {
    motion_monitor.Stop();
  }
}
