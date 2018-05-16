const settings_key = "settings"
const monitor_alerts_key = "monitor_alerts"
var cache = {}
cache[settings_key] = {}
cache[monitor_alerts_key] = []

module.exports = {

  get_setting: function(key){
    return cache[settings_key][key];
  },

  get_settings: function(){
    return cache[settings_key];
  },

  set_setting: function(key, val){
    cache[settings_key][key] = val;
  },

  add_monitor_alert: function(new_alert){
    cache[monitor_alerts_key].push(new_alert)
  },

  get_monitor_alerts: function(){
    return cache[monitor_alerts_key]
  },

  purge_montior_alerts: function(){
    var return_array = cache[monitor_alerts_key].slice()
    cache[monitor_alerts_key] = []
    return return_array
  }
}
