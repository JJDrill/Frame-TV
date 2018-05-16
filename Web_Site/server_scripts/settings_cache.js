/*
  This script will pull all the settings from the DB and populate
  them into the local_cache every WAIT_TIME seconds.
*/
const db = require('../data/frame_tv_db');
const WAIT_TIME = 10000;
var cache = require('./local_cache');

Update_Cache();

setInterval(() => {
  Update_Cache();
}, WAIT_TIME);

function Update_Cache(){
  console.log("Updating settings");
  db.Get_App_Config_Data().then(function(settings){
    settings.forEach(function(item){
      cache.set_setting(item.setting_name, item.setting_value)
    })
  })
}
