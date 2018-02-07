
exports.up = function(knex, Promise) {
  return knex.schema.createTable('app_config', function(table){
    table.string('setting_name').notNullable().unique();
    table.string('setting_value').notNullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('app_config');
};
