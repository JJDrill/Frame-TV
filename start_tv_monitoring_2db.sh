#!/bin/sh
export PGPASSWORD="password"

# Set the GPIO pin number the motion sensor is connected to
GPIO="15"

# How often we check the staus of the TV
TvStatusCheck=5
ON_OFF_SLEEP=60

# Turn the TV OFF settings in seconds
# e.g. - Every 300 seconds (Tv_Off_Check) if there are less
# 	 than 100 motion detections (Tv_Off_Threshold)
#	 turn the TV to standby mode.
QUERY="SELECT setting_value FROM app_config WHERE setting_name = 'TV Timeout'"
Tv_Off_Check=`psql -tc "$QUERY" Frame_TV_DB postgres`
#Tv_Off_Check=1800

QUERY="SELECT setting_value FROM app_config WHERE setting_name = 'TV Timeout Motion Threshold'"
Tv_Off_Threshold=`psql -tc "$QUERY" Frame_TV_DB postgres`
#Tv_Off_Threshold=15

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

while true; do
  	# Get the TV schedule for this period
	CURRENT_MINUTE=$(date +%m)
	modulo=$(( $CURRENT_MINUTE % 15 ))

	if [ $FIRST_RUN = "true" ]; then
		if   [ $CURRENT_MINUTE -lt "15" ]; then
			M=00
			ON_OFF_SLEEP=$(( (15 - $CURRENT_MINUTE)*60 ))
		elif [ $CURRENT_MINUTE -lt "30" ]; then
			M=15
			ON_OFF_SLEEP=$(( (30-$CURRENT_MINUTE)*60 ))
		elif [ $CURRENT_MINUTE -lt "45" ]; then
			M=30
			ON_OFF_SLEEP=$(( (45-$CURRENT_MINUTE)*60 ))
		else
			M=45
			ON_OFF_SLEEP=$(( (60-$CURRENT_MINUTE)*60 ))
		fi

		CURRENT_DAY=$(date +%A)
		CURRENT_TIME=$(date +%H):$M:00
		QUERY="SELECT tv_state FROM schedule WHERE day='$CURRENT_DAY' and time_range='$CURRENT_TIME'"
		TV_SCHEDULE=`psql -tc "$QUERY" Frame_TV_DB postgres`
		#echo $QUERY
		echo TV_Schedule: $TV_SCHEDULE
		FIRST_RUN=false
	elif [ "$modulo" -eq 0 ]; then
		CURRENT_DAY=$(date +%A)
		CURRENT_TIME=$(date +%H:%M):00

		QUERY="SELECT tv_state FROM schedule WHERE day='$CURRENT_DAY' and time_range='$CURRENT_TIME'"
		TV_SCHEDULE=`psql -tc "$QUERY" Frame_TV_DB postgres`
		echo $TV_SCHEDULE
#		ON_OFF_SLEEP=60
	fi

  	# TV state is ON or OFF
	if [ $TV_SCHEDULE = 'ON' ]; then
		tvStatus=$( getTvPowerStatus )

		if [ "$tvStatus" = "standby" ]; then
                        motionCount=0
			motionTotal=0
			QUERY="INSERT INTO logs (activity, time_stamp, motion_total, motion_count) VALUES ('TV ON', '$( date '+%Y-%m-%d %H:%M:%S' )', '0', '0')"
                        psql -c "$QUERY" Frame_TV_DB postgres
                        echo Turning TV On - $( getTime )
                        setTvPower "on"
		fi

		sleep $ON_OFF_SLEEP
		continue
	fi

	if [ $TV_SCHEDULE = 'OFF' ]; then
                tvStatus=$( getTvPowerStatus )

                if [ "$tvStatus" = "on" ]; then
                        echo Turning TV Off - $( getTime )
			QUERY="INSERT INTO logs (activity, time_stamp, motion_total, motion_count) VALUES ('TV OFF', '$( date '+%Y-%m-%d %H:%M:%S' )', '0', '0')"
                	psql -c "$QUERY" Frame_TV_DB postgres
               		setTvPower "standby"
                	echo
                fi
                sleep $ON_OFF_SLEEP
                continue
        fi

	# TV state is MOTION
	MotionStatus=$( getMotionStatus )
	motionTotal=$(($motionTotal + 1))

	if [ "$MotionStatus" = "Motion" ]; then
		motionCount=$(($motionCount + 1))
		echo Motion detected - $( getTime ): $motionTotal / $motionCount

		QUERY="INSERT INTO logs (activity, time_stamp, motion_total, motion_count) VALUES ('MOTION', '$( date '+%Y-%m-%d %H:%M:%S' )', '$motionTotal', '$motionCount')"
		psql -c "$QUERY" Frame_TV_DB postgres

		#echo $( getTime ): $motionTotal / $motionCount
		tvStatus=$( getTvPowerStatus )

		# Debug
		#echo TV Status: $tvStatus

		if [ "$tvStatus" = "standby" ]; then
			motionCount=0
			motionTotal=0

			QUERY="INSERT INTO logs (activity, time_stamp, motion_total, motion_count) VALUES ('TV ON', '$( date '+%Y-%m-%d %H:%M:%S' )', '$motionTotal', '$motionCount')"
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
				QUERY="INSERT INTO logs (activity, time_stamp, motion_total, motion_count) VALUES ('TV OFF', '$( date '+%Y-%m-%d %H:%M:%S' )', '$motionTotal', '$motionCount')"
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
done
