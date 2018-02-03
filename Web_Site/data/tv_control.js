var ks = require('node-key-sender');

module.exports = {

  Display_Picture_Previous: function() {
    ks.sendKey('left');
  },

  Display_Picture_Next: function() {
    ks.sendKey('right');
  }

}
