const { Client } = require('pg')

const client = new Client({
  user: 'postgres',
  host: '192.168.1.124',
  database: 'Frame_TV_DB',
  password: 'password',
  port: 5432,
})
client.connect()
