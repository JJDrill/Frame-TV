# Frame-TV

# Database
Run the following to create the Frame TV user and database.
- psql
- CREATE ROLE frame_tv_user WITH LOGIN PASSWORD 'password';
- ALTER ROLE frame_tv_user CREATEDB;
- ALTER ROLE frame_tv_user SUPERUSER;
- CREATE DATABASE frame_tv_db OWNER frame_tv_user;

Add your knexfile.js under the Web_Site directory. (Web_Site/knexfile.js)

module.exports = {
  production: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'frame_tv_user',
      password: 'password',
      database: 'frame_tv_db'
    }
  },

  development: {
    client: 'pg',
    connection: 'postgres://localhost/frame_tv_db'
  }
}

Run the migrations and seeds
- knex migrate:latest
- knex seed:run
