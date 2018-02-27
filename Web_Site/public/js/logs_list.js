function deleteLogs(dayToDelete){
  $.ajax({
    url: '/logs/' + dayToDelete,
    type: 'DELETE',
    success: function(result) {
      location.reload();
    }
  });
}
