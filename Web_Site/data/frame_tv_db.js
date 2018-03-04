var knex = require('./knex')

function App_Config(){
  return knex('app_config');
}

function Logs(){
  return knex('logs');
}

function Schedule(){
  return knex('schedule');
}

module.exports = {

  Get_App_Config_Data: function(){
    return App_Config()
    .select('setting_name', 'setting_value')
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

  Get_Log_Days: function(){
    return Logs()
    .distinct('time_stamp')
    .select(knex.raw('to_char("time_stamp", \'YYYY-MM-DD\') as "day"'))
    .orderBy('day', 'DESC')
  },

  Get_Logs_For_Day: function(date){
    rawString = "time_stamp::date = \'" + date + "\'"

    return Logs()
    .select('*', knex.raw('to_char("time_stamp", \'HH24:MI:SS\') as "time"'))
    .where(knex.raw(rawString))
    orderBy('time', 'DESC')
  },

  Delete_Logs: function(date){
    rawString = "time_stamp::date = \'" + date + "\'"

    return Logs()
    .where(knex.raw(rawString))
    .del()
  }
}
