module.exports = {

  prod: {
    client: 'pg',
    connection: {
    	host: 'localhost',
    	user: 'postgres',
    	password: 'password',
    	database: 'Frame_TV_DB'
    }
  },
  
  production: {
    client: 'pg',
    host: 'postgres://192.168.1.124/Frame_TV_DB',
    port: '5432',
    user: 'postgres',
    password: 'password'
  },

  development: {
    client: 'pg',
    connection: 'postgres://localhost/Frame_TV_DB'
  },

  test: {
    client: 'pg',
    connection: 'postgres://localhost/Frame_TV_DB_Test'
  }
}
