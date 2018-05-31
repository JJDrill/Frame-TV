
exports.up = function(knex, Promise) {
  return knex.schema.createTable('logs', function(table){
    table.increments();
    table.specificType('time_stamp', 'timestamp without time zone');
    table.string('activity');
    table.string('description');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('logs');
};
