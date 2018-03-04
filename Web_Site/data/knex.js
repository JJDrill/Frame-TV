// var environment = process.env.NODE_ENV || 'development';
var environment = 'development';
var config = require('../knexfile')[environment];
var knex = require('knex')(config);
module.exports = knex;
