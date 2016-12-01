var server = require('http').createServer();
var wsServer = new require('ws').Server({server: server});
var app      = require('express')();
const port   = 3000;

wsServer.broadcast = msg => {
  wsServer.clients.forEach(client => {
    client.send(JSON.stringify(msg));
  });
};

app.use((req, res) => {
  res.send('Hello World');
});

wsServer.on('connection', ws => {

  ws.on('message', message => {
    console.log('received: %s', message);

    var req = JSON.parse(message);
    var res = {
      type   : 'message',
      text   : req.text,
      success: true
    };

    /* ボットへのメンションかを判定 */
    var reg_result = null;
    if ((reg_result = req.text.match(/^(?:@bot)(?:\s|　)(.*)/)) != null ||
        (reg_result = req.text.match(/^(?:bot)(?:\s|　)(.*)/ )) != null ||
        (reg_result = req.text.match(/^(?:bot:)(.*)/         )) != null) {

      res.type = 'bot';
      switch (reg_result[reg_result.length - 1]) {
        case 'ping':
          res.text = 'pong';
          break;

        default:
          res.text = 'Oops!:O';
      }
    }

    wsServer.broadcast(res);

  });
});

server.on('request', app);
server.listen(process.env.PORT || port);
