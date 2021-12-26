$(document).ready(function () {
    /*global io*/
  let socket = io();

  //event listerner for the users who connects.
  socket.on('user count', (data) => {
    console.log(data);
  });


  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val();

    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});
