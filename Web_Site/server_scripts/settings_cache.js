const db = require('../data/frame_tv_db');
const NodeCache = require( "node-cache" );
const WAIT_TIME = 10000;
var myCache;

setInterval(() => {
  Update_Cache();
}, WAIT_TIME);

function Update_Cache(){
  db.Get_App_Config_Data().then(function(settings){
    obj = {}
    settings.forEach(function(item){
      obj[item.setting_name] = item.setting_value
      myCache.set( "Settings", obj, function( err, success ){})
    })
  })
}

module.exports = {

  Start: function(theCache){
    myCache = theCache
    Update_Cache();
    console.log("Starting...");
  }

}
