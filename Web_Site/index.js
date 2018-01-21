const express = require('express')
const app = express()
const { Client } = require('pg')
var bodyParser = require('body-parser')

var path = require('path')
var urlencodedParser = bodyParser.urlencoded({ extended: false})

const client = new Client({
  user: 'postgres',
  host: '192.168.1.124',
  database: 'Frame_TV_DB',
  password: 'password',
  port: 5432,
})
client.connect()

var str = "";

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.render('index');
})

app.get('/settings', function (req, res) {
  client.query('SELECT * FROM app_config;', (err, data) => {
    if (err) throw err;
    res.render('settings', {
      app_settings: data.rows
    });
  })
})

app.post('/settings', urlencodedParser, function(req, res){
  if (!req.body) return res.sendStatus(400)

  for (key_name in req.body) {

    var query_string = 'UPDATE app_config \
      SET setting_value = \'' + req.body[key_name] + '\' \
      WHERE setting_name = \'' + key_name + '\';'

    client.query(query_string, (err, data) => {
      if (err) throw err;
    })
  }

  client.query('SELECT * FROM app_config;', (err, data) => {
    if (err) throw err;
    res.render('settings', {
      app_settings: data.rows
    });
  })
});

app.get('/tvcontrol', function (req, res) {
  res.render('tvcontrol');
})

app.get('/graphs', function (req, res) {
  res.render('graphs');
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
  var query_string = 'SELECT *, to_char(time_stamp, \'HH12:MI:SS\') as time \
  FROM logs WHERE time_stamp::date = \'' + req.params.date + '\';'

  client.query(query_string, (err, logData) => {
    if (err) throw err;
    res.render('logs', {
      logData: logData.rows
    });
  })
})

app.route('/logs_all').get(function(req, res)
{
	client.query('SELECT * FROM logs;', (err, txt) => {
		res.send(txt)
	})
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
