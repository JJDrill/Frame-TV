module.exports = {

  Get_Status: function(){
    return Math.floor(Math.random() * 2);
  },

  Get_Response_Time: function(){
    return Math.floor(Math.random() * 5000) + 1000;
  }
}
