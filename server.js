var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

global.port = process.env.PORT || 8080;

global.server = app.listen(global.port, (resp) => {
    console.log('server running on port: ' + global.port);
});

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
    console.log('*****************************');
    console.log('BODY IS :');
    console.log(r);
   console.log('************************');
    //var x = r.entry[0].changes[0];
   //console.log('NEW POST FROM SENDER ID ' + x.value.sender_id);
   //console.log('POST IS :- ' + x.value.message);
   //console.log('************************');
    res.json({
        status: true
    });
})

app.get('/facebook-notification', (req, res)=>{
    console.log(req.query);
    console.log(req.query['hub.challenge']);
    console.log('**************************');
    res.send(req.query['hub.challenge']);
})
