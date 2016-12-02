'use strict';

var ws = new WebSocket('wss://codecheck-4017.herokuapp.com:443/');

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
    $('#messages')
      .append($('<li>')
      .append($('<span class="message">').text(resp.text)));

    if (resp.events && !(resp.events.length == 0)) { // イベント情報があればそれを表示
      var slick_container = $('<div class="multiple-items">');

      resp.events.forEach(e => {
        slick_container.append($('<div class="slick-slide">')
          .append($('<a href="' + e.url + '">')
            .append($('<img class="slick-slide" src="' + e.image_path + '" alt="' + e.title + '">')).append(e.title)));
      });

      $('#messages').append($('<li>').append(slick_container));
      slick_container.slick({
        infinite      : true,
        slidesToShow  : 3,
        slidesToScroll: 3
      });
    }
  };

  ws.onerror = function(err){
    console.log("err", err);
  };

  ws.onclose = function close() {
    console.log('disconnected');
  };
});
