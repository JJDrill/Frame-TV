var motionData = [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0]

module.exports = {

  Get_Status: function(){
    return Math.floor(Math.random() * 2);
  },

  Get_Response_Time: function(){
    return Math.floor(Math.random() * 5000) + 1000;
  }
}
