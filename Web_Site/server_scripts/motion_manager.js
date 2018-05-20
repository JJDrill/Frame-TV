const db = require('../data/frame_tv_db');
var cache = require('./local_cache');
var tv = require('./tv_control');
const motion_monitor = require('./motion_monitor');

const DEBUG = false;
var wait_time = 1000;
var tv_timeout = 0;
var tv_timeout_motion_threshold = 0;
var tv_motion_sensitivity = 0;
var seconds_counter = 0;
var motion_count = 0;
var target_tv_mode = ""
var previous_target_tv_mode = ""

setInterval(() => {
  seconds_counter += wait_time / 1000
  tv_timeout = cache.get_setting("TV Timeout")
  tv_timeout_motion_threshold = cache.get_setting("TV Timeout Motion Threshold")
  tv_motion_sensitivity = cache.get_setting("Motion Sensitivity")
  alerts = cache.purge_montior_alerts()
  alerts.forEach(function(item) {
    if (DEBUG) {
      console.log('Found motion alert: ' + item.TimeStamp + " / " + item.MotionDuration);
    }
    log_motion_detection(item.TimeStamp, item.MotionDuration)
  })

  previous_target_tv_mode = target_tv_mode
  target_tv_mode = cache.get_setting("Target TV Mode")

  if (target_tv_mode === "OFF") {
    StopMotionMonitoring();
    Verify_TV_Is_Off();
  } else if (target_tv_mode === "ON") {
    StopMotionMonitoring();
    Verify_TV_Is_On();
  } else if (target_tv_mode === "MOTION") {
    StartMotionMonitoring();
    Verify_TV_Is_Monitoring_Motion();
  }
}, wait_time);


function Verify_TV_Is_Off(){
  if (previous_target_tv_mode != target_tv_mode) {
    current_tv_mode = tv.Get_State(DEBUG);

    if (current_tv_mode != target_tv_mode) {
      if (DEBUG) { console.log("Turning the TV Off."); }
      db.Add_Log(null, "TV OFF", "Turning the TV Off.").then()
      tv.Turn_Off();
    }
  }
}

function Verify_TV_Is_On(){
  current_tv_mode = tv.Get_State(DEBUG);

  if (current_tv_mode != target_tv_mode) {
    if (DEBUG) { cconsole.log("Turning the TV On."); }
    db.Add_Log(null, "TV ON", "Turning the TV On.").then()
    tv.Turn_On();
  }
}

function Verify_TV_Is_Monitoring_Motion(){
  if (seconds_counter >= tv_timeout) {

    if (motion_count < tv_timeout_motion_threshold) {
      current_tv_mode = tv.Get_State(DEBUG);

      if (current_tv_mode != target_tv_mode) {
        message = "Turning the TV off due to lack of motion. " +
        "(Motion Count: " + motion_count + ")"
        if (DEBUG) { console.log(message); }
        db.Add_Log(null, "TV OFF", message).then()
        tv.Turn_Off();
      }
    } else {
      message = "Keeping the TV on. (Motion Count: " + motion_count + ")"
      if (DEBUG) { console.log(message); }
      db.Add_Log(null, "TV ON", message).then()
    }
    seconds_counter = 0
    motion_count = 0
  }
}

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
