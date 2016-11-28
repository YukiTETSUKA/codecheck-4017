var WebSocketServer = require('ws').Server;
var wss             = new WebSocketServer({port: 3000});

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('received: %s', message);

    var req = JSON.parse(message);
    var res = {'success': true};

    switch (req['text']) {
      case 'bot ping':
      case '@bot ping':
      case 'bot:ping':
        res['type'] = 'bot';
        res['text'] = 'pong';

        ws.send(JSON.stringify(res));

        break;
      default:
        console.log('not ping');
    }
  });
});
