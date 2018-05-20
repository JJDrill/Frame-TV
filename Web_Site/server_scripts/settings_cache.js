/*
  This script will pull all the settings from the DB and populate
  them into the local_cache every WAIT_TIME seconds.
*/
const DEBUG = false;
const db = require('../data/frame_tv_db');
const WAIT_TIME = 10000;
var cache = require('./local_cache');

Update_Cache();

setInterval(() => {
  Update_Cache();
}, WAIT_TIME);

function Update_Cache(){

  db.Get_App_Config_Data().then(function(settings){
    settings.forEach(function(item){
      if (item.setting_name != "TV Mode") {
        cache.set_setting(item.setting_name, item.setting_value)
      }
    })
  }).then(function(){
    return db.Get_Target_Mode().then(function(data){
      cache.set_setting("Target TV Mode", data)
    })
  }).then(function(){
    if (DEBUG) {
      console.log("\nUpdating settings...");
      console.log("************************************");
      settings_cache = cache.get_settings()
      for (var key in settings_cache) {
        console.log(key + ": " + settings_cache[key]);
      }
      console.log("************************************\n");
    }
  })
}
