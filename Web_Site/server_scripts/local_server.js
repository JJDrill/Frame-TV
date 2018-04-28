const db = require('../data/frame_tv_db');
const settings_cache = require('./settings_cache.js');
const motion_monitor = require('./motion_monitor.js');
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

settings_cache.Start(myCache);
motion_monitor.Start(myCache);

setInterval(() => {

  console.log("Settings: ", myCache.get(CACHE_SETTINGS))
  console.log("Motion: ", myCache.get(CACHE_MOTION))

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
  // if (settings[DB_TV_MODE] === DB_STATIC_ON) {
  //   tv_action = TV_ACTION_ON
  // } else if (settings[DB_TV_MODE] === DB_STATIC_OFF) {
  //   tv_action = TV_ACTION_OFF
  // } else if (settings[DB_TV_MODE] === DB_SCHEDULED) {
  //   tv_action = TV_ACTION_MOTION
  // } else {
  //   console.log("ERROR: Mode not supported: ", settings[DB_TV_MODE]);
  //   log_error("ERROR: Mode not supported: ", settings[DB_TV_MODE])
  // }

  // get the current status of the tv
  // current_tv_state = get_tv_state()

  // perform the tv_action
  // if (TV_ACTION_ON === tv_action) {
  //
  // } else if (TV_ACTION_OFF === tv_action) {
  //
  // } else if (TV_ACTION_MOTION === tv_action) {
  //
  // }

}, 1000);
