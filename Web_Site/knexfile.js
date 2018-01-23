module.exports = {

  // const client = new Client({
  //   user: 'postgres',
  //   host: '192.168.1.124',
  //   database: 'Frame_TV_DB',
  //   password: 'password',
  //   port: 5432,
  // });

  development: {
    client: 'pg',
    host: 'postgres://192.168.1.124/Frame_TV_DB',
    port: '5432',
    user: 'postgres',
    password: 'password'
  }
}
