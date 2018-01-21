#!/bin/sh

# Set the GPIO pin number the motion sensor is connected to
GPIO="15"

# How often we check the staus of the TV
TvStatusCheck=5

# Turn the TV ON settings in seconds
# e.g. - Every 5 seconds (Tv_On_Check) see if there are
# 	 more than 2 motion detections (Tv_On_Threshold)
#	 turn the TV on.
Tv_On_Check=5
Tv_On_Threshold=2

# Turn the TV OFF settings in seconds
# e.g. - Every 300 seconds (Tv_Off_Check) if there are less
# 	 than 100 motion detections (Tv_Off_Threshold)
#	 turn the TV to standby mode.
Tv_Off_Check=60
Tv_Off_Threshold=70

# TV Activity Wait
# Wait time to give the TV some rest after performing some CEC activity
CEC_Wait=1

cleanup()
{
	printf "\nCleaning up!\n"
	echo "$GPIO" > /sys/class/gpio/unexport
	exit
}
trap cleanup 1 2 3 6

getMotionStatus()
{
	status=$( cat /sys/class/gpio/gpio$GPIO/value )

	if [ "$status" = "0" ]; then
		echo "No Motion"
	else
		echo "Motion"
	fi
}

getTime()
{
	date +"%T"
}

# Set up GPIO and set to input
echo "$GPIO" > /sys/class/gpio/export
echo "in" > /sys/class/gpio/gpio$GPIO/direction
InMotionFoundState=false

while true; do
	MotionStatus=$( getMotionStatus )
	
	if [ "$MotionStatus" = "Motion" ]; then
		if [ "$InMotionFoundState" = "false" ]; then
			echo "Motion Detected"
			StartTime=$( getTime )
			InMotionFoundState=true
		fi
	elif [ "$MotionStatus" = "No Motion" ]; then
		if [ "$InMotionFoundState" = "true" ]; then
			echo Dection Range: $StartTime / $( getTime )
			StartTime=$( getTime )
			InMotionFoundState=false
		fi
	fi
	sleep 0.5
done
