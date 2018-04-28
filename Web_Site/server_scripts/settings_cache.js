const db = require('../data/frame_tv_db');
const WAIT_TIME = 10000;
var local_settings = {}

Update_Cache();

setInterval(() => {
  console.log("Updating settings");
  Update_Cache();
}, WAIT_TIME);

function Update_Cache(){
  db.Get_App_Config_Data().then(function(settings){
    obj = {}
    settings.forEach(function(item){
      local_settings[item.setting_name] = item.setting_value
    })
  })
}

module.exports = {

  Get_All_Settings: function(){
    return local_settings
  },

  Get_Setting: function(setting_name){
    return local_settings[setting_name]
  }

}
