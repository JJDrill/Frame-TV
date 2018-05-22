const cp = require('child_process');

module.exports = {

  Turn_On: function(mock){
    mock = mock || false
    if (mock){
      // console.log("Warning! Using responser for function 'Turn_On'!");
      return true;
    }

    cmd = "echo on 0 | cec-client -s -d 1"
    cp.spawnSync(cmd);
  },

  Turn_Off: function(mock){
    mock = mock || false
    if (mock){
      // console.log("Warning! Using responser for function 'Turn_Off'!");
      return true;
    }
    // example
    // const child = spawn('find', ['.', '-type', 'f']);

    cmd = "echo standby 0 | cec-client -s -d 1"
    result = cp.exec(cmd);
    var args = ['echo', 'standby', '0', '|', 'cec-client', '-s', '-d', '1']
    // result = cp.exec('echo', args);
    // console.log(result['stdout'].toString('utf8'))
  },

  Get_State: function(mock){
    mock = mock || false

    if (!mock) {
      cmd = "echo pow 0 | cec-client -s -d 1 | grep 'power status:'"
      result = cp.spawnSync(cmd);

      if (result === "power status: on") {
        return "ON"
      } else if (result === "power status: standby") {
        return "OFF"
      }

    } else {
      // console.log("Warning! Using responser for function 'Get_State'!");
      rand = Math.floor(Math.random() * 2);

      if (rand === 0) {
        return "ON"
      } else {
        return "OFF"
      }
    }
  }
}
