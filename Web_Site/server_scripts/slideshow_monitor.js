const cp = require('child_process');
const db = require('../data/frame_tv_db')

setInterval(() => {
  // Update the slideshow speed from the DB
  db.Get_App_Config_Setting('Screen Saver Duration').then(function(data){
    slideshow_speed = data[0].setting_value
    console.log('Slideshow Speed: ', slideshow_speed);
  })

  // Generate the slideshow picture list
  db.Generate_Slideshow_Picture_List();

  // Generate the feh command and run it
  var fehCommand = 'feh --auto-rotate -x -F -r -Y -z -A slideshow -D' + slideshow_speed + " -f slideshow_list.txt"
  var ls = cp.spawnSync(fehCommand);

  // var fehCommand = 'ls'
  // var ls = cp.spawnSync(fehCommand, ['../pictures'], { encoding : 'utf8' });
  // console.log(ls.stdout);

}, 2000);
