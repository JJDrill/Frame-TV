const express = require('express')
const app = express()
const { Client } = require('pg')
var bodyParser = require('body-parser')
const tv = require('./data/tv_control')

var path = require('path')
var urlencodedParser = bodyParser.urlencoded({ extended: false})

const client = new Client({
  user: 'postgres',
  host: '192.168.1.124',
  database: 'Frame_TV_DB',
  password: 'password',
  port: 5432,
})
// const client = new Client({
//   user: 'jdrill',
//   host: 'localhost',
//   database: 'Frame_TV_DB',
//   password: 'password',
//   port: 5432,
// })
// const client = new Client({
//   user: 'jdrill',
//   host: 'localhost',
//   database: 'Frame_TV_DB_Test',
//   password: 'password',
//   port: 5432,
// })

client.connect()

var str = "";

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.render('index');
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
  client.query('SELECT setting_name, setting_value FROM app_config;', (err, data) => {
    if (err) throw err;
    res.render('settings', {
      app_settings: data.rows
    });
  })
})

app.post('/settings', urlencodedParser, function(req, res){
  if (!req.body) return res.sendStatus(400)
  settingsUpdates = JSON.parse(req.body.settingsChanges);

  for (key_name in settingsUpdates) {

    var query_string = 'UPDATE app_config \
      SET setting_value = \'' + settingsUpdates[key_name] + '\' \
      WHERE setting_name = \'' + key_name + '\';'

    client.query(query_string, (err, data) => {
      if (err) throw err;
    })
  }
});

app.get('/schedule', function (req, res) {
  var query_string = 'SELECT day, time_range, tv_state \
    FROM schedule ORDER BY time_range;'

  client.query(query_string, (err, data) => {
    if (err) throw err;
    res.render('schedule', {
      schedule: data.rows
    });
  })
})

app.post('/schedule', urlencodedParser, function(req, res){
  if (!req.body) return res.sendStatus(400)
  newSchedules = {}
  newSchedules = JSON.parse(req.body.scheduleChanges);

  for (key_name in newSchedules){
    var query_string = "UPDATE public.schedule \
    SET tv_state='" + newSchedules[key_name].tv_state + "' \
    WHERE day='" + newSchedules[key_name].day + "' and \
    time_range='" + newSchedules[key_name].time_range + "';"

    client.query(query_string, (err, data) => {
      if (err) throw err;
      res.end();
    })
  }
})

app.route('/logs').get(function(req, res)
{
  var query_string = 'SELECT DISTINCT to_char(time_stamp, \'YYYY-MM-DD\') as day \
    FROM logs ORDER BY day DESC;'

  client.query(query_string, (err, data) => {
    if (err) throw err;
    res.render('logs_list', {
      logList: data.rows
    });
	})
})

app.get('/logs/:date', function (req, res) {
  var query_string = 'SELECT *, to_char(time_stamp, \'HH24:MI:SS\') as time \
  FROM logs WHERE time_stamp::date = \'' + req.params.date + '\' ORDER BY time DESC;'

  client.query(query_string, (err, logData) => {
    if (err) throw err;
    res.render('logs', {
      logData: logData.rows
    });
  })
})

app.delete('/logs/:date', function (req, res) {
  var query_string = 'DELETE FROM logs WHERE time_stamp::date = \'' + req.params.date + '\''

  client.query(query_string, (err, logData) => {
    if (err) throw err;
    res.end();
  })
})

app.route('/logs_all').get(function(req, res)
{
	client.query('SELECT * FROM logs;', (err, txt) => {
		res.send(txt)
	})
})

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
