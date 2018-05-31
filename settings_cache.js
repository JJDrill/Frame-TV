/*
  This script will pull all the settings from the DB and populate
  them into the settings object every WAIT_TIME seconds.
*/
<<<<<<< HEAD:Web_Site/server_scripts/settings_cache.js
const DEBUG = true;
const db = require('../data/frame_tv_db');
const WAIT_TIME = 60000;
var cache = require('./local_cache');
=======
const DEBUG = false;
const db = require('./data/frame_tv_db');
const WAIT_TIME = 10000;
var settings = {};
>>>>>>> 3c2bba099fd8ad75424b661ef7e5ea9cee8a84d5:settings_cache.js

Update_Cache();

setInterval(() => {
console.log("Running settings manager")
  Update_Cache();
}, WAIT_TIME);

function Update_Cache(){

  db.Get_App_Config_Data().then(function(data){
    data.forEach(function(item){
      if (item.setting_name != "TV Mode") {
        settings[item.setting_name] = item.setting_value
      }
    })
  }).then(function(){
    return db.Get_Target_Mode().then(function(data){
      settings["Target TV Mode"] = data
    })
  }).then(function(){
    if (DEBUG) {
      console.log("\nUpdating settings...");
      console.log("************************************");
      for (var key in settings) {
        console.log(key + ": " + settings[key]);
      }
      console.log("************************************\n");
    }
  })
}

module.exports = {

  get_setting: function(key){
    return settings[key];
  }
}
