var knex = require('./knex')
var fs = require('fs')
var moment = require('moment');
const DEBUG = false;

const TV_MODES = {
  DB_STATIC_ON: "Static_On",
  DB_STATIC_OFF: "Static_Off",
  DB_STATIC_MOTION: "Static_Motion",
  DB_SCHEDULED: "Scheduled"
}

function App_Config(){
  return knex('app_config');
}

function Logs(){
  return knex('logs');
}

function Schedule(){
  return knex('schedule');
}

function Pictures(){
  return knex('pictures');
}

module.exports = {
  TV_Modes: TV_MODES,

  Get_App_Config_Data: function(){
    return App_Config()
    .select('setting_name', 'setting_value')
  },

  Get_App_Config_Setting: function(settingName){
    return App_Config()
    .where('setting_name', settingName)
    .select('setting_value')
  },

  Update_App_Config_Data: function(setting_name, new_value){
    return App_Config()
    .where('setting_name', setting_name)
    .update({
      setting_value: new_value
    })
  },

  Get_Schedule: function(){
    return Schedule()
    .select('day', 'time_range', 'tv_state')
    .orderBy('time_range')
  },

  Update_Schedule: function(new_day, new_time_range, new_tv_state){
    return Schedule()
    .where({
      day: new_day,
      time_range:  new_time_range
    })
    .update({
      tv_state: new_tv_state
    })
  },

  Get_Target_Mode: function(){
    return App_Config()
    .where('setting_name', "TV Mode")
    .select('setting_value').then(function(data){
      tv_mode = data[0]["setting_value"]

      if (tv_mode === TV_MODES.DB_STATIC_ON) {
        return "ON"

      } else if (tv_mode === TV_MODES.DB_STATIC_OFF) {
        return "OFF"

      } else if (tv_mode === TV_MODES.DB_STATIC_MOTION) {
        return "MOTION"

      } else if (tv_mode === TV_MODES.DB_SCHEDULED) {
        var datetime = moment()
        var current_day = datetime.format("dddd")
        var current_hour = datetime.format("HH")
        var current_minute = datetime.format("m")
        var minute_range = ""

        if (current_minute < "15") {
          minute_range = "00"
        } else if (current_minute < "30") {
          minute_range = "15"
        } else if (current_minute < "45") {
          minute_range = "30"
        } else {
          minute_range = "45"
        }

        full_time = current_hour + ":" + minute_range + ":00"

        return Schedule()
        .where({
          day: current_day,
          time_range:  full_time
        })
        .select('tv_state').then(function(data){
          return data[0]["tv_state"]
        })
      }
    })
  },

  // set newTimeStamp to null and it will use the current time stamp
  Add_Log: function(newTimeStamp, newActivity, newDescription){
    if (newTimeStamp === null) {
      newTimeStamp = moment().format('YYYY-MMM-DD h:mm:ss a')
    }

    return Logs()
    .insert({
      time_stamp: newTimeStamp,
      activity: newActivity,
      description: newDescription
    })
  },

  Get_Log_Days: function(){
    return Logs()
    .distinct(knex.raw('to_char("time_stamp", \'YYYY-MM-DD\') as "day"'))
    .orderBy('day', 'desc')
  },

  Get_Logs_For_Day: function(date){
    rawString = "time_stamp::date = \'" + date + "\'"

    return Logs()
    .select('*', knex.raw('to_char("time_stamp", \'HH24:MI:SS\') as "time"'))
    .where(knex.raw(rawString))
    .orderBy('time', 'desc')
  },

  // deletes logs from a specific day
  Delete_Logs: function(date){
    rawString = "time_stamp::date = \'" + date + "\'"

    return Logs()
    .where(knex.raw(rawString))
    .del()
  },

  // delete all logs previous to the given date
  Purge_Logs: function(date){
    rawString = "time_stamp::date <= \'" + date + "\'"

    return Logs()
    .where(knex.raw(rawString))
    .del()
  },

  Add_Picture: function(name){
    return Pictures()
    .insert({
      name: name,
      enabled: true
    })
  },

  Get_Pictures: function(){
    return Pictures()
    .select('id', 'name', 'enabled')
    .orderBy('name')
  },

  Get_Picture_Info: function(id){
    return Pictures()
    .where('id', id)
    .select('id', 'name', 'enabled')
    .orderBy('name')
  },

  Does_Picture_Exist: function(name){
    return Pictures()
    .where('name', name)
    .first()
  },

  Update_Picture: function(id, enabled){
    return Pictures()
    .where('id', id)
    .update({
      enabled: enabled
    })
  },

  Delete_Picture: function(id){
    return Pictures()
    .where('id', id)
    .del()
  },

  Get_Slideshow_List: function(){

    return App_Config()
    .where('setting_name', 'Picture Directory')
    .select('setting_value').then(function(data){
      pic_dir = data[0]["setting_value"]

    }).then(function(){

      return knex('pictures')
      .where('enabled', 'true')
      .select('name')
      .orderBy('name')
      .then(function(pic_list){
        var fileData = "";

        pic_list.forEach(function(element){
          // fileData += pic_dir + "/" + element.name + "\n"
          fileData += "/home/pi/Slideshow_Pictures/" + element.name + "\n"
        })

        if (DEBUG) {
          console.log("******* File Data *******");
          console.log(fileData);
        }

        return fileData;
      })
    })
  }
}
