
function displayPicturePrevious(){
  $.post('/tvcontrol', { action: 'previous' });
}

function displayPictureNext(){
  $.post('/tvcontrol', { action: "next" });
}

function resetSlideshow(){
  $.post('/tvcontrol', { action: "reset" });
}
