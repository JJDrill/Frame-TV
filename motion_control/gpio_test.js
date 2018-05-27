var use_test_data = false;
var test_data = [];
var test_data_index = -1;

const times = x => f => {
  if (x > 0) {
    f()
    times (x - 1) (f)
  }
}

// populate the test data array
times(10) (() => test_data.push(0))
times(10) (() => test_data.push(1))
times(10) (() => test_data.push(0))
times(4) (() => test_data.push(1))

module.exports = {

  readSync: function(){
    if (use_test_data) {
      if (test_data_index >= test_data.length) {
        test_data_index = 0
      } else {
        test_data_index += 1
      }
      return test_data[test_data_index]

    } else {
      num = Math.floor(Math.random() * 10)
      if (num <= 8) { return 1; } else { return 0; }
    }
  }
}
