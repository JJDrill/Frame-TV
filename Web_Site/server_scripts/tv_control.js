const cp = require('child_process');

module.exports = {

  Turn_On: function(){
    cmd = "echo on 0 | cec-client -s -d 1"
    cp.spawnSync(cmd);
  },

  Turn_Off: function(){
    cmd = "echo standby 0 | cec-client -s -d 1"
    cp.spawnSync(cmd);
  },

  Get_State: function(){
    cmd = "echo pow 0 | cec-client -s -d 1 | grep 'power status:'"
    cp.spawnSync(cmd);
  }

}
