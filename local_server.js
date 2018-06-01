const db = require('./data/frame_tv_db');
var settings = require('./settings_cache');
var tv = require('./tv/tv_manager');
const DEBUG = true;

if (DEBUG) {
  db.Add_Log(null, "DEBUG", "WARNING! Motion manager has been set to debug mode.").then()
}
var wait_time = 1000;
var tv_timeout = 0;
var tv_timeout_motion_threshold = 0;
var tv_motion_sensitivity = 0;
var seconds_counter = 0;
var motion_count = 0;
var motion_was_detected = false;
var target_tv_mode = ""
var previous_target_tv_mode = ""
var alerts = []

var ipc=require('node-ipc');
ipc.config.id   = 'world';
ipc.config.retry= 1500;

ipc.serve(
  function(){ ipc.server.on('montion_alert',
    function(data, socket){
      alerts.push(data)
      // if ( DEBUG ) console.log("Alert Recieved: ", alerts)
    }
  )}
);

ipc.server.start();

setInterval(() => {
  if ( DEBUG ) console.log("\n**********************************************")
  seconds_counter += wait_time / 1000
  tv_timeout = settings.get_setting("TV Timeout")
  tv_timeout_motion_threshold = settings.get_setting("TV Timeout Motion Threshold")
  tv_motion_sensitivity = settings.get_setting("Motion Sensitivity")
  previous_target_tv_mode = target_tv_mode
  target_tv_mode = settings.get_setting("Target TV Mode")
  var alert = alerts.pop()

  if (alert) {
    if (DEBUG) {
      console.log('Found motion alert: ' + alert.TimeStamp + " / " + alert.MotionDuration);
    }
    Log_Motion_Detection(alert.TimeStamp, alert.MotionDuration)
  } else {
    motion_was_detected = false
  }


  if ( DEBUG ) console.log("target_tv_mode: ", target_tv_mode)

  if (target_tv_mode === "OFF") {
    // Stop_Motion_Monitor();
    Verify_TV_Is_Off();
  } else if (target_tv_mode === "ON") {
    // Stop_Motion_Monitor();
    Verify_TV_Is_On();
  } else if (target_tv_mode === "MOTION") {
    // Start_Motion_Monitor();
    Monitoring_Motion();
  }
}, wait_time);


function Verify_TV_Is_Off(){
console.log("previous: ", previous_target_tv_mode)
console.log("target: ", target_tv_mode)
  if (previous_target_tv_mode != target_tv_mode) {
    current_tv_mode = tv.Get_State();

    if (current_tv_mode != target_tv_mode) {
      if (DEBUG) { console.log("Turning the TV Off."); }
      db.Add_Log(null, "TV OFF", "Turning the TV Off.").then()
      tv.Turn_Off();
    }
  }
}

function Verify_TV_Is_On(){
  current_tv_mode = tv.Get_State();

  if (current_tv_mode != target_tv_mode) {
    if (DEBUG) { console.log("Turning the TV On."); }
    db.Add_Log(null, "TV ON", "Turning the TV On.").then()
    tv.Turn_On();
  }
}

function Monitoring_Motion(){
  current_tv_mode = tv.Get_State();
console.log(current_tv_mode)
console.log(motion_was_detected)
  // if our tv is off just turn it on since we found motion
  if (current_tv_mode === "OFF" && motion_was_detected === true) {
    message = "Motion detected. Turning on TV."
    if (DEBUG) { console.log(message); }
    db.Add_Log(null, "TV ON", message).then()
    tv.Turn_On();
    seconds_counter = 0
    motion_count = 0

  } else {
    // otherwise check our motion counts
    if (seconds_counter >= tv_timeout) {

      if (motion_count < tv_timeout_motion_threshold) {
        current_tv_mode = tv.Get_State();

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
}

function Log_Motion_Detection(time_stamp, time_duration){
  motion_sensitivity = settings.get_setting("Motion Sensitivity")
  var message = ""

  if (time_duration >= motion_sensitivity) {
    motion_count += 1
    motion_was_detected = true
    message = "Motion detected after " + seconds_counter + " seconds. (Count: " +
              motion_count + " - Duration: " + time_duration + ")"
  } else {
    motion_was_detected = false
    message = "Motion of " + time_duration +
              " milliseconds detected but did not reach sensitivity of " +
              motion_sensitivity + " milliseconds."
  }

  db.Add_Log(time_stamp, "MOTION", message).then()
}

function Start_Motion_Monitor(){
  ipc.connectTo('world', function(){
    ipc.of.world.emit('motion_manager', "Start");
  });
}

function Stop_Motion_Monitor(){
  ipc.connectTo('world', function(){
    ipc.of.world.emit('motion_manager', "Stop");
  });
}
