var environment = process.env.NODE_ENV || 'production';
var config require('../knexfile')[environment];
var knex = require('knex')(config);
module.exports = knex;
