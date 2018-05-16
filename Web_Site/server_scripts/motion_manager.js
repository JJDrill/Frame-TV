const db = require('../data/frame_tv_db');
var moment = require('moment');
var cache = require('./local_cache');

var wait_time = 1000;
var seconds_counter = 0;
var motion_count = 0;


setInterval(() => {
  seconds_counter += wait_time / 1000
  alerts = cache.purge_montior_alerts()

  alerts.forEach(function(item) {
    console.log(item);
    log_to_db(item.TimeStamp, item.diff)
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
