
exports.up = function(knex, Promise) {
  return knex.schema.createTable('pictures', function(table){
    table.increments();
    table.string('name').notNullable().unique();
    table.boolean('enabled');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('pictures');
};
