const express  = require('express');
const port     = 3000;
const server   = express()
  .use(express.static('app'))
  .use((req, res) => res.send('Hello :D'))
  .listen(process.env.PORT || port);
var wsServer   = new require('ws').Server({server});
const moment   = require('moment');

wsServer.broadcast = msg => {
  wsServer.clients.forEach(client => {
    client.send(JSON.stringify(msg));
  });
};

wsServer.on('connection', ws => {
  ws.on('message', message => {
    console.log('received: %s', message);

    var req = JSON.parse(message);
    var res = {
      type   : 'message',
      text   : req.text,
      success: true,
      events : null
    };

    /* ボットへのメンションかを判定 */
    if (req.text.match(/^(?:@bot)(?:\s|　)+(.*)/) != null || /* @bot xxx */
        req.text.match(/^(?:bot)(?:\s|　)+(.*)/ ) != null || /* bot  xxx */
        req.text.match(/^(?:bot:)(?:\s|　)*(.*)/) != null) { /* bot: xxx */

      // mention, command, param1, param2 ... を分割
      var reg_result = null;
      if (req.text.indexOf('bot:') >= 0) { // bot: xxx の場合だけ処理を変更する
        var tmp        = req.text.split(/:/, 2);
        var cmd_params = tmp.pop();
        reg_result     = tmp.concat(cmd_params.split(/(\s|　)+/).filter(e => {return e && !e.match(/\s|　/);}));
      } else {
        reg_result = req.text.split(/(\s|　)+/    ).filter(e => {return !e.match(/\s|　/)});
      }
      reg_result.shift();

      res.type = 'bot';

      var command = reg_result.shift();
      var params  = reg_result;

      switch (command) {
        case 'ping':
          res.text = 'pong';
          wsServer.broadcast(res);
          break;

        case 'event': /* 今月に開かれるイベントを紹介する */
          getEvents(params, res);
          break;

        default:
          res.text = 'Oops!:O command not found XO';
          wsServer.broadcast(res);
      }
    } else {
      wsServer.broadcast(res);
    }
  });
});

console.log('Express server listening on port: %d', server.address().port);

/*
 * https://eventon.jp/api/events.json からイベント情報を取得し，戻り値とする
 * params[0] : 都道府県名
 * params[1] : キーワード1
 * params[2] : キーワード2 ...
*/
const prefectures = [
  '北海道', '青森県'  , '岩手県', '宮城県', '秋田県', '山形県'  , '福島県', '茨城県', '栃木県', '群馬県'  , '埼玉県', '千葉県',
  '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県'  , '山梨県', '長野県', '岐阜県', '静岡県'  , '愛知県', '三重県',
  '滋賀県', '京都府'  , '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県'  , '山口県', '徳島県',
  '香川県', '愛媛県'  , '高知県', '福岡県', '佐賀県', '長崎県'  , '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];
const http     = require('http');
const endpoint = 'http://eventon.jp/api/events.json';
function getEvents(params, res) {
  var prefecture_id = prefectures.indexOf(params.shift() || '東京都') + 1;
  var keyword       = params.length == 0 ? '' : params.join();
  var ymd_between   = `${moment().add(1, 'days').format('YYYYMMDD')},${moment().add(31, 'days').format('YYYYMMDD')}`; // 開催年月日範囲
  const url = `${endpoint}?prefecture_id=${prefecture_id}&keyword=${keyword}&ymd_between=${ymd_between}&order=started_at_asc`;

  if (prefecture_id == 0) { // 都道府県名がhitしなかった場合，空配列を返却
    res.text = "Oops! :O Prefecture not found XO\nUsage: bot event Prefecture_name (keyword1 keyword2 ...)";
    wsServer.broadcast(res);
    return;
  }

  http.get(url, incom_msg => {
    var body = '';
    incom_msg.setEncoding('utf8');

    incom_msg.on('data', chunk => { body += chunk; });

    incom_msg.on('end', eventon_res => {
      res.events = JSON.parse(body).events;
      wsServer.broadcast(res);
    });
  });

  return;
}
