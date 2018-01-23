$(document).ready(function() {
  scheduleChanges=[]
  scheduleData=normalizeInputData(input_data)

  // AM Table
  var am_table = $("<table/>").addClass('table table-bordered table-sm');

  // AM Header
  var row = $("<tr/>");
  for (var i = 0; i < 13; i++) {
    if (i===0) {
      row.append($("<th scope='col' colspan='4'></th>").text(""));
    } else if (i===1) {
      row.append($("<th scope='col' colspan='4'></th>").text("12 AM"));
    } else {
      row.append($("<th scope='col' colspan='4'></th>").text(i-1 + " AM"));
    }
  }
  am_table.append(row);

  // AM Table
  for (day_name in scheduleData){
    row = $("<tr/>");
    row.append($("<th scope='col' colspan='4'></th>").text(day_name));

    for (var i = 0; i < 48; i++) {
      row.append($("<td scope='col' \
        id='tableCell' \
        onclick='changeScheduleState(this)' \
        data-day='" + scheduleData[day_name][i].Day + "' \
        data-time='" + scheduleData[day_name][i].Time + "' \
        data-state='" + scheduleData[day_name][i].State + "'></td>").text(""));
    }

    am_table.append(row);
  }
  $('div.am_schedule').append(am_table);

  // PM Table
  var pm_table = $("<table/>").addClass('table table-bordered table-sm');

  // PM Header
  var row = $("<tr/>");
  for (var i = 14; i < 27; i++) {
    if (i===14) {
      row.append($("<th scope='col' colspan='4'></th>").text(""));
    } else if (i===15) {
      row.append($("<th scope='col' colspan='4'></th>").text("12 PM"));
    } else {
      row.append($("<th scope='col' colspan='4'></th>").text(i-15 + " PM"));
    }
  }
  pm_table.append(row);

  // PM Table
  for (day_name in scheduleData){
    row = $("<tr/>");
    row.append($("<th scope='col' colspan='4'></th>").text(day_name));

    for (var i = 48; i < 96; i++) {
      row.append($("<td scope='col' \
        id='tableCell' \
        onclick='changeScheduleState(this)' \
        data-day='" + scheduleData[day_name][i].Day + "' \
        data-time='" + scheduleData[day_name][i].Time + "' \
        data-state='" + scheduleData[day_name][i].State + "'></td>").text(""));
    }

    pm_table.append(row);
  }

  $('div.pm_schedule').append(pm_table);
});

function saveChanges() {
  $.post('/schedule', scheduleChanges)
  // $.post('/schedule', scheduleChanges).function(response){
  //   console.log(response);
  // }
}

function changeScheduleState(cell) {
  // MOTION --> ON --> OFF
  changes=[]
  changes['day']=cell.getAttribute('data-day')
  changes['time']=cell.getAttribute('data-time')
  currentState = cell.getAttribute("data-state")
  myKey=changes['day'] + changes['time']

  if (currentState === "MOTION") {
    cell.setAttribute('data-state', 'ON')
    changes['newState']="ON"
  } else if (currentState === "ON") {
    cell.setAttribute('data-state', 'OFF')
    changes['newState']="OFF"
  } else if (currentState === "OFF") {
    cell.setAttribute('data-state', 'MOTION')
    changes['newState']="MOTION"
  } else {
    console.log("State is not defined: " + currentState);
  }

  scheduleChanges[myKey]=changes
  console.log(scheduleChanges);
}

function normalizeInputData(data) {
  schedule=[]
  schedule["Sunday"]=[]
  schedule["Monday"]=[]
  schedule["Tuesday"]=[]
  schedule["Wednesday"]=[]
  schedule["Thursday"]=[]
  schedule["Friday"]=[]
  schedule["Saturday"]=[]

  for (var i = 0; i < input_data.length; i++) {
    var data = []
    data["Day"]=input_data[i].day
    data["Time"]=input_data[i].time_range
    data["State"]=input_data[i].tv_state
    schedule[input_data[i].day].push(data)
  }

  return schedule
}
