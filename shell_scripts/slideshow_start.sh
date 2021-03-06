#!/bin/bash
# slideshow_start.sh

# url: ###
# This script is licensed under GNU GPL version 2.0 or above

# Uses elements from lightsOn.sh
# Copyright (c) 2011 iye.cba at gmail com
# url: https://github.com/iye/lightsOn
# This script is licensed under GNU GPL version 2.0 or above

# Description: ####
# slideshow_start.sh needs xprintidle and feh to work.

# HOW TO USE: Start the script with the number of seconds you want the checks
# for fullscreen to be done. Example:
# "./slideshow_start.sh 120"
export PGPASSWORD="password"

QUERY="SELECT setting_value FROM app_config WHERE setting_name = 'Screen Saver Duration'"
slideshow_speed=`psql -tc "$QUERY" frame_tv_db postgres`
echo "Slideshow Speed: " $slideshow_speed

DIR=/home/pi/Google_Drive/Picture_Frame/Pictures
delay=$1

# If argument empty use default.
if [ -z "$1" ]; then
   delay=5
fi

# If argument is not integer quit.
if [[ $1 = *[^0-9]* ]]; then
   echo "The Argument \"$1\" is not valid, not an interger"
   exit 1
fi

IDLE_TIME=$(($delay*1000))

cd $DIR
feh --auto-rotate -x -F -r -Y -z -A slideshow -D $slideshow_speed

while sleep $((1)); do
   idle=$(xprintidle)
   if [ $idle -ge $IDLE_TIME ]; then
   	slideshow_speed=`psql -tc "$QUERY" frame_tv_db postgres`
	echo "Slideshow Speed: " $slideshow_speed
	feh --auto-rotate -x -F -r -Y -z -A slideshow -D $slideshow_speed
   fi
done

exit 0
