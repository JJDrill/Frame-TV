
exports.up = function(knex, Promise) {
  return knex.schema.createTable('logs', function(table){
    table.increments();
    table.string('activity');
    table.specificType('time_stamp', 'timestamp without time zone');
    table.integer('motion_total');
    table.integer('motion_count');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('logs');
};
