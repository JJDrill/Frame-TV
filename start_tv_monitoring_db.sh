#!/bin/sh
export PGPASSWORD="password"

# Set the GPIO pin number the motion sensor is connected to
GPIO="15"

# How often we check the staus of the TV
TvStatusCheck=5
TV_SCHEDULE_CHECK=50
ON_OFF_SLEEP=10

# Turn the TV OFF settings in seconds
# e.g. - Every 300 seconds (Tv_Off_Check) if there are less
# 	 than 100 motion detections (Tv_Off_Threshold)
#	 turn the TV to standby mode.
QUERY="SELECT setting_value FROM app_config WHERE setting_name = 'TV Timeout'"
Tv_Off_Check=`psql -tc "$QUERY" Frame_TV_DB postgres`

QUERY="SELECT setting_value FROM app_config WHERE setting_name = 'TV Timeout Motion Threshold'"
Tv_Off_Threshold=`psql -tc "$QUERY" Frame_TV_DB postgres`

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

# Set up GPIO and set to input
echo "$GPIO" > /sys/class/gpio/export
echo "in" > /sys/class/gpio/gpio$GPIO/direction

motionCount=0
motionTotal=0
FIRST_RUN=true
# set this to 60 at first so we get our schedule for the script start
TV_SCHEDULE_COUNT=100
TV_SCHEDULE=''

while true; do
	# Get the TV mode
	QUERY="SELECT setting_value FROM app_config WHERE setting_name='TV Mode'"
        TV_MODE=`psql -tc "$QUERY" Frame_TV_DB postgres`
	echo TV_Mode: $TV_MODE

	if [ $TV_MODE = "Static_On" ]; then
		TV_SCHEDULE="ON"
	elif [ $TV_MODE = "Static_Off" ]; then
		TV_SCHEDULE="OFF"
	elif [ $TV_MODE = "Scheduled" ]; then
		CURRENT_MINUTE=$(date +%m)

		if [ $TV_SCHEDULE_COUNT -ge $TV_SCHEDULE_CHECK ]; then
			if   [ $CURRENT_MINUTE -lt "15" ]; then M=00
			elif [ $CURRENT_MINUTE -lt "30" ]; then M=15
			elif [ $CURRENT_MINUTE -lt "45" ]; then M=30
			else M=45
			fi

			CURRENT_DAY=$(date +%A)
			CURRENT_TIME=$(date +%H):$M:00
			QUERY="SELECT tv_state FROM schedule WHERE day='$CURRENT_DAY' and time_range='$CURRENT_TIME'"
			TV_SCHEDULE=`psql -tc "$QUERY" Frame_TV_DB postgres`
			echo $QUERY
			echo TV_Schedule: $TV_SCHEDULE
			TV_SCHEDULE_COUNT=0
		fi

  	# Get the TV schedule for this period
		CURRENT_MINUTE=$(date +%-M)

		if [ $TV_SCHEDULE_COUNT -ge $TV_SCHEDULE_CHECK ]; then

			if   [ $CURRENT_MINUTE -lt "15" ]; then M=00
			elif [ $CURRENT_MINUTE -lt "30" ]; then M=15
			elif [ $CURRENT_MINUTE -lt "45" ]; then M=30
			else M=45
			fi

			CURRENT_DAY=$(date +%A)
			CURRENT_TIME=$(date +%H):$M:00
			QUERY="SELECT tv_state FROM schedule WHERE day='$CURRENT_DAY' and time_range='$CURRENT_TIME'"
			TV_SCHEDULE=`psql -tc "$QUERY" Frame_TV_DB postgres`
			echo $QUERY
			echo TV_Schedule: $TV_SCHEDULE
			TV_SCHEDULE_COUNT=0
		fi
	fi

	# TV state is ON or OFF
	if [ $TV_SCHEDULE = 'ON' ]; then
		tvStatus=$( getTvPowerStatus )

		if [ "$tvStatus" = "standby" ]; then
			motionCount=0
			motionTotal=0
			QUERY="INSERT INTO logs (time_stamp, activity, description) VALUES ('$( date '+%Y-%m-%d %H:%M:%S' )', 'TV ON', 'TV turned on per schedule.')"
			psql -c "$QUERY" Frame_TV_DB postgres
			echo Turning TV On - $( getTime )
			setTvPower "on"
		fi

		sleep $ON_OFF_SLEEP
		TV_SCHEDULE_COUNT=$(($TV_SCHEDULE_COUNT + $ON_OFF_SLEEP))
		continue
	fi

	if [ $TV_SCHEDULE = 'OFF' ]; then
		tvStatus=$( getTvPowerStatus )

		if [ "$tvStatus" = "on" ]; then
			echo Turning TV Off - $( getTime )
			QUERY="INSERT INTO logs (time_stamp, activity, description) VALUES ('$( date '+%Y-%m-%d %H:%M:%S' )', 'TV OFF', 'TV turned off per schedule.')"
			psql -c "$QUERY" Frame_TV_DB postgres
			setTvPower "standby"
			echo
		fi

		sleep $ON_OFF_SLEEP
		TV_SCHEDULE_COUNT=$(($TV_SCHEDULE_COUNT + $ON_OFF_SLEEP))
		continue
	fi

	# TV state is MOTION
	MotionStatus=$( getMotionStatus )
	motionTotal=$(($motionTotal + 1))

	if [ "$MotionStatus" = "Motion" ]; then
		motionCount=$(($motionCount + 1))
		echo Motion detected - $( getTime ): $motionTotal / $motionCount
		QUERY="INSERT INTO logs (time_stamp, activity, description) VALUES ('$( date '+%Y-%m-%d %H:%M:%S' )', 'MOTION', 'Motion dectected after $motionTotal seconds. Motion count is $motionCount.')"
		psql -c "$QUERY" Frame_TV_DB postgres

		tvStatus=$( getTvPowerStatus )

		if [ "$tvStatus" = "standby" ]; then
			motionCount=0
			motionTotal=0
			QUERY="INSERT INTO logs (time_stamp, activity, description) VALUES ('$( date '+%Y-%m-%d %H:%M:%S' )', 'TV ON', 'TV turned on becuase of motion dectection.')"
			psql -c "$QUERY" Frame_TV_DB postgres

			echo Turning TV On - $( getTime ): $motionTotal / $motionCount
			setTvPower "on"
			echo
			sleep $CEC_Wait
		fi
	fi

	if [ "$motionTotal" -ge "$Tv_Off_Check" ]; then
		echo "\nChecking if TV should be turned off"
		tvStatus=$( getTvPowerStatus )

		if [ "$tvStatus" = "on" ]; then

			if [ $motionCount -le $Tv_Off_Threshold ]; then
				echo Turning TV Off - $( getTime ): $motionTotal / $motionCount
				QUERY="INSERT INTO logs (time_stamp, activity, description) VALUES ('$( date '+%Y-%m-%d %H:%M:%S' )', 'TV OFF', 'TV turned off becuase of lack of motion.')"
				psql -c "$QUERY" Frame_TV_DB postgres

				setTvPower "standby"
				echo
				sleep $CEC_Wait
			fi
		fi
		motionCount=0
		motionTotal=0

		# Get updated motion settings
		QUERY="SELECT setting_value FROM app_config WHERE setting_name = 'TV Timeout'"
		Tv_Off_Check=`psql -tc "$QUERY" Frame_TV_DB postgres`

		QUERY="SELECT setting_value FROM app_config WHERE setting_name = 'TV Timeout Motion Threshold'"
		Tv_Off_Threshold=`psql -tc "$QUERY" Frame_TV_DB postgres`
		echo "Motion metrics updated. Tv_Off_Check - $Tv_Off_Check / Tv_Off_Threshold - $Tv_Off_Threshold"
	fi

	sleep 1.0
	TV_SCHEDULE_COUNT=$(($TV_SCHEDULE_COUNT + 1))
done
