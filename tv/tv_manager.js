const db = require('../data/frame_tv_db');
const { execSync } = require('child_process');
const TURN_TV_ON = "echo on 0 | cec-client -s -d 1";
const TURN_TV_OFF = "echo standby 0 | cec-client -s -d 1";
const GET_TV_STATUS = "echo pow 0 | cec-client -s -d 1 | grep 'power status:'";
const RESPONDER = false;

if (true) {
  db.Add_Log(null, "RESPONDER", "WARNING! tv_control is set to responder mode.").then()
}

module.exports = {

  Turn_On: function(){
    if (RESPONDER){ return true; }
    execSync(TURN_TV_ON);
  },

  Turn_Off: function(){
    if (RESPONDER){ return true; }
    execSync(TURN_TV_OFF);
  },

  Get_State: function(){
    if (!RESPONDER) {
      var result = execSync(GET_TV_STATUS);

      if (result === "power status: on") {
        return "ON"
      } else if (result === "power status: standby") {
        return "OFF"
      }

    } else {
      rand = Math.floor(Math.random() * 2);

      if (rand === 0) {
        return "ON"
      } else {
        return "OFF"
      }
    }
  }
}
