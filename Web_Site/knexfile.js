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
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'password',
      database: 'Frame_TV_DB'
    }
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
