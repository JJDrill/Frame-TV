
function displayPicturePrevious(){
  $.get('/tvcontrol/previous');
}

function displayPictureNext(){
  $.get('/tvcontrol/next');
}

function resetSlideshow(){
  $.get('/tvcontrol/reset');
}
