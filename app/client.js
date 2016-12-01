'use strict';

var ws = new WebSocket('wss://codecheck-4017.herokuapp.com:443/');
// var ws = new WebSocket('ws://localhost:5000/');

$(function () {
  $('form').submit(function(){
    var $this = $(this);
    // ws.onopen = function() {
    //   console.log('sent message: %s', $('#m').val());
    // };

    var msg   = {
      text: $('#m').val()
    };

    ws.send(JSON.stringify(msg));
    $('#m').val('');

    return false;
  });

  ws.onmessage = function(msg){
    var resp = JSON.parse(msg.data);
    if (resp.events) { // イベント情報があればそれを表示

      resp.events.forEach(e => {
        $('#messages')
          .append($('<li>')
          .append($('<span class="message">')
            .append($('<a href="' + e.url + '">').text(e.title))));
      });

    } else {

      $('#messages')
        .append($('<li>')
        .append($('<span class="message">').text(resp.text)));

    }
  };

  ws.onerror = function(err){
    console.log("err", err);
  };

  ws.onclose = function close() {
    console.log('disconnected');
  };
});
