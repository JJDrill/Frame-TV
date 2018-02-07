
exports.up = function(knex, Promise) {
  return knex.schema.createTable('schedule', function(table){
    table.increments();
    table.string('day');
    table.specificType('time_range', 'time without time zone')
    table.string('tv_state');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('schedule');
};
