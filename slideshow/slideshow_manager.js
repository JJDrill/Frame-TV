const { execSync } = require('child_process');
const db = require('../data/frame_tv_db')

setInterval(() => {
  // Update the slideshow speed from the DB
  db.Get_App_Config_Setting('Screen Saver Duration').then(function(data){
    slideshow_speed = data[0].setting_value
    console.log('Slideshow Speed: ', slideshow_speed);

  }).then(function(){
    // Generate the slideshow picture list
    return db.Generate_Slideshow_Picture_List().then();

  }).then(function(){
    // Generate the feh command and run it
    var fehCommand = 'feh --auto-rotate -x -F -r -Y -z -A slideshow -D' + slideshow_speed + " -f slideshow_list.txt"
    execSync(fehCommand, ['~/Slideshow_Pictures']);
  })
}, 2000);
