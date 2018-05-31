cd ..
forever start -s --minUptime 1000 --spinSleepTime 1000 index.js
forever start -s --minUptime 1000 --spinSleepTime 1000 ./slideshow/slideshow_manager.js
forever start -s --minUptime 1000 --spinSleepTime 1000 ./motion_control/motion_manager.js
forever start -s --minUptime 1000 --spinSleepTime 1000 local_server.js
