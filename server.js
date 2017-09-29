var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');

var mqtt    = require('mqtt');

var client  = mqtt.connect('mqtt://m12.cloudmqtt.com:16479', {
	username: 'sxdzesyk',
	password: 'dc_pY7Q7gOTw'
	} );

client.on('connect', function () {
  console.log('connected to cloudmqtt');
  client.subscribe('vending_out');
  //client.publish('vending_out', 'Hello Vending Demo');
});

global.port = process.env.PORT || 8080;

global.server = app.listen(global.port, (resp) => {
    console.log('server running on port: ' + global.port);
});

global.secondryServerurl = 'http://139.59.36.119:5001/facebook-forwarded';

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    limit: '100mb',
    extended: true
}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    res.send("Hello You Are at a Wrong Place :-)");
})

app.post('/facebook-notification', (req, res) => {
    var r = req.body;
    var x = r.entry[0].changes[0];
    client.publish('vending_in', "*VEND#");
    console.log('************************');
    console.log('NEW POST FROM SENDER ID ' + x.value.sender_id);
    console.log('POST IS :- ' + x.value.message);
    res.json({
        status: true
    });
//     try {
//         request.post({
//             method: 'POST',
//             json: {
//                 id: x.value.sender_id,
//                 message: x.value.message
//             },
//             url: global.secondryServerurl
//         }, function (err, res, body) {

//         });
//     } catch (e) {

//     }
})

app.get('/facebook-notification', (req, res) => {
    console.log(req.query);
    console.log(req.query['hub.challenge']);
    console.log('**************************');
    res.send(req.query['hub.challenge']);
});


app.post('/facebook-forwarded', function (req, res) {
    var r = req.body;
    console.log('************************');
    console.log('NEW POST FROM SENDER ID ' + r.id);
    console.log('POST IS :- ' + r.message);

})


