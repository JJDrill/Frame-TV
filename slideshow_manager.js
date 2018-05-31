const { execSync } = require('child_process');
const db = require('./data/frame_tv_db');
var fs = require('fs')
var slideshow_speed = 600;
var pictures_directory = "";
const DEBUG = false;

if (DEBUG) {
  db.Add_Log(null, "DEBUG",
  "WARNING! Slideshow manager is in debug mode.").then()
}

setInterval(() => {
  if (DEBUG) { console.log("\n************* Start *************"); }
  // Update the slideshow speed from the DB
  db.Get_App_Config_Setting('Screen Saver Duration').then(function(data){
    slideshow_speed = data[0].setting_value
    if (DEBUG) console.log('Slideshow Speed: ', slideshow_speed);

  }).then(function(){
    // Get the pictures directory
    return db.Get_App_Config_Setting('Picture Directory').then(function(data){
      pictures_directory = data[0].setting_value
      if (DEBUG) console.log('Pictures Directory: ', pictures_directory);
    }).then();

  }).then(function(){
    // Generate the slideshow picture list
    var pic_list;
    return db.Get_Slideshow_List().then(function(pic_list){
      return pic_list;
    }).then();
  }).then(function(pic_list){
    return fs.writeFileSync( pictures_directory + "/slideshow_list.txt", pic_list, function (err) {
        if (err) throw err;
    })
    console.log("Done writing file!")
  }).then(function(){
    if (!DEBUG) {
      // Generate the feh command and run it
      var fehCommand = 'feh --auto-rotate -x -F -r -Y -z -A slideshow -D' + slideshow_speed + " -f " + pictures_directory + "/slideshow_list.txt"
      execSync(fehCommand);
    } else {
      console.log("DEBUG Mode: Here's where the slidshow would run.");
    }
  })
}, 1000);
