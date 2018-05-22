function enableDisablePicture(buttonId, picID) {
  myButton = document.getElementById(buttonId);
  newState = ""

  if (myButton.innerHTML === "Yes") {
    newState = false
    myButton.innerHTML = "No"
    myButton.classList.add("btn-secondary")
    myButton.classList.remove("btn-success")
  } else {
    newState = true
    myButton.innerHTML = "Yes"
    myButton.classList.add("btn-success")
    myButton.classList.remove("btn-secondary")
  }

  $.ajax({
    url: '/pictures/' + picID,
    type: 'PUT',
    data: 'enabled=' + newState,
    success: function(result) {
      location.reload();
    }
  });
}

function deletePic(picID){
  $.ajax({
    url: '/pictures/' + picID,
    type: 'DELETE',
    success: function(result) {
      location.reload();
    }
  });
}

function markEnabled(buttonId){
  myButton = document.getElementById(buttonId);
}
