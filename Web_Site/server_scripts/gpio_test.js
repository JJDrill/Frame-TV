module.exports = {

  readSync: function(){
    num = Math.floor(Math.random() * 10);
    if (num <= 8) {
      return 1
    } else {
      return 0
    }
  }
}