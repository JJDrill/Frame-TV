var knex = require('./knex')

funciton Schedule(){
  return knex('schedule');
}

module.exports = {

  function updateTVSchedule(day, time_range, new_state) {
    query_string = 'UPDATE public.schedule \
    SET tv_state = ' + newState +
    ' WHERE day=' + cell.Day + ' and time_range=' + cell.Time + ';'

    return Schedule()
    .where('day', day).andWhere('time_range', time_range)
    .update({
      tv_state: new_state
    })
  }
}
