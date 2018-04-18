const express = require('express')
const app = express()
var bodyParser = require('body-parser')
const tv = require('./data/tv_control')
const db = require('./data/frame_tv_db')

var path = require('path')
var urlencodedParser = bodyParser.urlencoded({ extended: false})

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.render('index');
})

app.get('/pictures', function (req, res) {
  db.Get_Pictures().then(function(result){
    res.render('pictures');
  })
})

app.post('/pictures', urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)

  db.Does_Picture_Exist(req.body.name).then(function(picExists){
    if (picExists.length === 0) {
      db.Add_Picture(req.body.name).then(function(result){})
    }
  })
  res.render('pictures');
})

app.get('/pictures/:id', function (req, res) {
  db.Get_Picture_Info(req.params.id).then(function(data){
    console.log(data);
    res.end();
  })
})

app.put('/pictures/:id', urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)

  db.Does_Picture_Exist(req.body.name).then(function(picExists){
    if (picExists.length === 0) {
      db.Update_Picture(req.params.id, req.body.name, req.body.enabled).then(function(){})
    }
  })
  res.render('pictures');
})

app.delete('/pictures/:id', function (req, res) {
  db.Delete_Picture(req.params.id).then(function(result){
    console.log(result);
    res.end();
  })
})

app.get('/tvcontrol', function (req, res) {
  res.render('tvcontrol');
})

app.post('/tvcontrol', urlencodedParser, function (req, res) {

  if (req.body.action === "previous") {
    tv.Display_Picture_Previous();
  } else if (req.body.action === "next") {
    tv.Display_Picture_Next();
  } else if (req.body.action === "reset") {
    tv.Reset_Slideshow();
  } else {
    console.log("Error: Action not found: " + req.body.action);
  }

  res.render('tvcontrol');
})

app.get('/settings', function (req, res) {
  db.Get_App_Config_Data().then(function(data){
    res.render('settings', {
      app_settings: data
    });
  })
})

app.post('/settings', urlencodedParser, function(req, res){
  if (!req.body) return res.sendStatus(400)
  settingsUpdates = JSON.parse(req.body.settingsChanges);

  for (key_name in settingsUpdates) {
    db.Update_App_Config_Data(key_name, settingsUpdates[key_name])
    .then(function(output){})
  }
});

app.get('/schedule', function (req, res) {
  db.Get_Schedule().then(function(data){
    res.render('schedule', {
      schedule: data
    });
  })
})

app.post('/schedule', urlencodedParser, function(req, res){
  if (!req.body) return res.sendStatus(400)
  newSchedules = {}
  newSchedules = JSON.parse(req.body.scheduleChanges);

  for (key_name in newSchedules){
    db.Update_Schedule(
      newSchedules[key_name].day,
      newSchedules[key_name].time_range,
      newSchedules[key_name].tv_state
    ).then(function(){})
  }
})

app.route('/logs').get(function(req, res)
{
  db.Get_Log_Days().then(function(data){
    res.render('logs_list', {
      logList: data
    })
  })
})

app.get('/logs/:date', function (req, res) {
  db.Get_Logs_For_Day(req.params.date).then(function(logData){
    res.render('logs', {
      logData: logData
    })
  })
})

app.delete('/logs/:date', function (req, res) {
  db.Delete_Logs(req.params.date).then(function(output){
    res.end();
  })
})

app.listen(3000, function () {
  console.log('Listening on port 3000')
})
