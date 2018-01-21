#!/bin/sh

#mongo frametv --eval 'db.test.insert({"name" : "script test"});'

# Set the GPIO pin number the motion sensor is connected to
GPIO="15"

# How often we check the staus of the TV
TvStatusCheck=5

# Turn the TV OFF settings in seconds
# e.g. - Every 300 seconds (Tv_Off_Check) if there are less
# 	 than 100 motion detections (Tv_Off_Threshold)
#	 turn the TV to standby mode.
Tv_Off_Check=1800
Tv_Off_Threshold=15

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

getTvPowerStatus()
{
	status=$( echo pow 0 | cec-client -s -d 1 | grep "power status:" )

	if [ "$status" = "power status: on" ]; then
		echo "on"
	elif [ "$status" = "power status: standby" ]; then
		echo "standby"
	else
		echo "Status undefined: $status"
	fi
}

setTvPower()
{
	if [ "$1" = "on" ]; then
		echo on 0 | cec-client -s -d 1
	elif [ "$1" = "standby" ]; then
		echo standby 0 | cec-client -s -d 1
	else
		echo "Power undefined: $1"
	fi
}

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

logToMongoDB()
{
	DATA="$1"
	mongo frametv --eval "db.logging.insert( $DATA );"
}

# Set up GPIO and set to input
echo "$GPIO" > /sys/class/gpio/export
echo "in" > /sys/class/gpio/gpio$GPIO/direction

motionCount=0
motionTotal=0

while true; do
	MotionStatus=$( getMotionStatus )
	motionTotal=$(($motionTotal + 1))

	if [ "$MotionStatus" = "Motion" ]; then
		motionCount=$(($motionCount + 1))
		echo Motion detected - $( getTime ): $motionTotal / $motionCount
		
		DOC="{'activity' : 'Motion',
		      'time' : '$( getTime )',
		      'motionTotal' : '$motionTotal',
		      'motion_count' : '$motionCount'
		      }"
		mongo frametv --eval "db.logging.insert( $DOC );"
		
		#echo $( getTime ): $motionTotal / $motionCount
		tvStatus=$( getTvPowerStatus )

		# Debug
		#echo TV Status: $tvStatus

		if [ "$tvStatus" = "standby" ]; then
			DOC="{'activity' : 'TV On',
			      'time' : '$( getTime )',
			      'motionTotal' : '$motionTotal',
			      'motion_count' : '$motionCount'
			      }"
			mongo frametv --eval "db.logging.insert( $DOC );"
			echo Turning TV On - $( getTime ): $motionTotal / $motionCount
			setTvPower "on"
			echo
			sleep $CEC_Wait
			motionCount=0
			motionTotal=0
		fi
	fi

	if [ "$motionTotal" -ge "$Tv_Off_Check" ]; then
		echo "\nChecking if TV should be turned off"
		tvStatus=$( getTvPowerStatus )
		
		if [ "$tvStatus" = "on" ]; then
			if [ $motionCount -le $Tv_Off_Threshold ]; then
				echo Turning TV Off - $( getTime ): $motionTotal / $motionCount
				DOC="{'activity' : 'TV Off',
				      'time' : '$( getTime )',
				      'motionTotal' : '$motionTotal',
				      'motion_count' : '$motionCount'
				      }"
				mongo frametv --eval "db.logging.insert( $DOC );"
				
				setTvPower "standby"
				echo
				sleep $CEC_Wait
			fi
		fi
		motionCount=0
		motionTotal=0
	fi
	
	sleep 1.0
done
