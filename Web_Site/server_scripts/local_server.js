const db = require('../data/frame_tv_db');
const motion_monitor = require('./motion_monitor.js');
const tv = require('./tv_control.js');
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

// cache names
const CACHE_SETTINGS = "Settings"
const CACHE_MOTION = "Motion"
// database modes
const DB_STATIC_ON = "Static_On"
const DB_STATIC_OFF = "Static_Off"
const DB_STATIC_MOTION = "Static_Motion"
const DB_SCHEDULED = "Scheduled"
// tv actions
const TV_ACTION_ON = "ON"
const TV_ACTION_OFF = "OFF"
const TV_ACTION_MOTION = "MOTION"

setInterval(() => {

  // console.log("Motion: ", myCache.get(CACHE_MOTION))
  // console.log("Settings: ", settings_cache.Get_All_Settings())
  // console.log("Setting: ", settings_cache.Get_Setting("TV Timeout Motion Threshold"))

  // count = parseInt(myCache.get( "Count" ))
  // if ( isNaN(count) ) {
  //   count = 0
  // } else {
  //   count += 1
  // }
  // myCache.set( "Count", count, function( err, success ){})
  // count = myCache.get( "Count" )

  tv_action = ""

  // set our tv_action based on the tv_mode
  // if (cache[DB_TV_MODE] === DB_STATIC_ON) {
  //   tv_action = TV_ACTION_ON
  // } else if (settings[DB_TV_MODE] === DB_STATIC_OFF) {
  //   tv_action = TV_ACTION_OFF
  // } else if (settings[DB_TV_MODE] === DB_STATIC_MOTION) {
  //   tv_action = TV_ACTION_MOTION
  // } else if (settings[DB_TV_MODE] === DB_SCHEDULED) {
  //   // TODO: lookup the action from our schedule
  //   tv_action = "??????"
  // } else {
  //   message = "ERROR: Mode not supported: " + settings[DB_TV_MODE]
  //   console.log(message)
  //   log_error(message)
  // }

  // get the current status of the tv
  current_tv_state = tv.Get_State();

  // perform the tv_action
  // if (TV_ACTION_ON === tv_action) {
  //   if (current_tv_state != TV_ACTION_ON) {
  //     tv.Turn_On();
  //   }
  // } else if (TV_ACTION_OFF === tv_action) {
  //   if (current_tv_state != TV_ACTION_OFF) {
  //     tv.Turn_On();
  //   }
  // } else {
  //   message = "ERROR: Action not supported: " + tv_action
  //   console.log(message)
  //   log_error(message)
  // }

}, 1000);
