$(document).ready(function() {

  for (var i = 0; i < input_data.length; i++) {

    if ("Screen Saver Duration" === input_data[i].setting_name) {
      $("#screen_saver_duration").val(input_data[i].setting_value);

    } else if ("TV Timeout" === input_data[i].setting_name) {
      $("#tv_timeout").val(input_data[i].setting_value);

    } else if ("TV Timeout Motion Threshold" === input_data[i].setting_name) {
      $("#tv_timeout_motion_threshold").val(input_data[i].setting_value);

    } else if ("TV Mode" === input_data[i].setting_name) {
      disableAllTvModeButtons()

      if ("Static_On" === input_data[i].setting_value) {
        enableTvModeButton("tvModeOn")
      } else if ("Static_Off" === input_data[i].setting_value) {
        enableTvModeButton("tvModeOff")
      } else if ("Static_Motion" === input_data[i].setting_value) {
        enableTvModeButton("tvModeMotion")
      } else if ("Scheduled" === input_data[i].setting_value) {
        enableTvModeButton("tvModeSchedule")
      }
    }
  }

});

function saveSettings() {
  dataToSave = {}
  dataToSave["Screen Saver Duration"] = document.getElementById("screen_saver_duration").value;
  dataToSave["TV Timeout"] = document.getElementById("tv_timeout").value;
  dataToSave["TV Timeout Motion Threshold"] = document.getElementById("tv_timeout_motion_threshold").value;

  if (document.getElementById("tvModeOn").innerHTML === "Enabled") {
    dataToSave["TV Mode"] = "Static_On";
  } else if (document.getElementById("tvModeMotion").innerHTML === "Enabled") {
    dataToSave["TV Mode"] = "Static_Motion";
  } else if (document.getElementById("tvModeOff").innerHTML === "Enabled") {
    dataToSave["TV Mode"] = "Static_Off";
  } else if (document.getElementById("tvModeSchedule").innerHTML === "Enabled") {
    dataToSave["TV Mode"] = "Scheduled";
  }

  $.post('/settings', { settingsChanges: JSON.stringify(dataToSave) });
}

function selectTvMode(buttonClicked) {
  disableAllTvModeButtons()
  enableTvModeButton(buttonClicked.id)
}

function disableAllTvModeButtons() {
  document.getElementById("tvModeOn").innerHTML = "Disabled";
  document.getElementById("tvModeOn").classList.remove("btn-success");
  document.getElementById("tvModeOn").classList.add("btn-secondary");

  document.getElementById("tvModeMotion").innerHTML = "Disabled";
  document.getElementById("tvModeMotion").classList.remove("btn-success");
  document.getElementById("tvModeMotion").classList.add("btn-secondary");

  document.getElementById("tvModeOff").innerHTML = "Disabled";
  document.getElementById("tvModeOff").classList.remove("btn-success");
  document.getElementById("tvModeOff").classList.add("btn-secondary");

  document.getElementById("tvModeSchedule").innerHTML = "Disabled";
  document.getElementById("tvModeSchedule").classList.remove("btn-success");
  document.getElementById("tvModeSchedule").classList.add("btn-secondary");
}

function enableTvModeButton(button) {
  document.getElementById(button).innerHTML = "Enabled";
  document.getElementById(button).classList.add("btn-success");
  document.getElementById(button).classList.remove("btn-secondary");
}
