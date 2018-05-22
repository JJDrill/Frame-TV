const { execSync } = require('child_process');
const TURN_TV_ON = "echo on 0 | cec-client -s -d 1"
const TURN_TV_OFF = "echo standby 0 | cec-client -s -d 1"
const GET_TV_STATUS = "echo pow 0 | cec-client -s -d 1 | grep 'power status:'"

module.exports = {

  Turn_On: function(mock){
    mock = mock || false
    if (mock){
      console.log("Warning! Using responser for function 'Turn_On'!");
      return true;
    }
    execSync(TURN_TV_ON);
  },

  Turn_Off: function(mock){
    mock = mock || false
    if (mock){
      console.log("Warning! Using responser for function 'Turn_Off'!");
      return true;
    }
    execSync(TURN_TV_OFF);
  },

  Get_State: function(mock){
    mock = mock || false

    if (!mock) {

      var result = execSync(GET_TV_STATUS);

      if (result === "power status: on") {
        return "ON"
      } else if (result === "power status: standby") {
        return "OFF"
      }

    } else {
      console.log("Warning! Using responser for function 'Get_State'!");
      rand = Math.floor(Math.random() * 2);

      if (rand === 0) {
        return "ON"
      } else {
        return "OFF"
      }
    }
  }
}
