// var Gpio = require('onoff').Gpio;
var Stopwatch = require("node-stopwatch").Stopwatch;
var stopwatch = Stopwatch.create();
var waitTime = 1000

// Set the GPIO pin number the motion sensor is connected to
// var motion_gpio = new Gpio(15, 'in');
// Set up GPIO and set to input
// echo "$GPIO" > /sys/class/gpio/export
// echo "in" > /sys/class/gpio/gpio$GPIO/direction

setInterval(() => {
  motion_result = Math.floor(Math.random() * 2);

  if (motion_result === 1) {
    stopwatch.start();

    while (motion_result <= 998) {
      motion_result = Math.floor(Math.random() * 1000);
      // console.log("motion_result: ", motion_result);
    }

    stopwatch.stop();
    result = {}
    result["Status"] = "Motion"
    result["TimeStamp"] = Date()
    result["diff"] = stopwatch.elapsedMilliseconds
    console.log("Registering motion detection: ", result);
    // TODO: make the call to register the motion detection
  }
}, waitTime);
