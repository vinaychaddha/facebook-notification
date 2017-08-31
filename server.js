var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

global.port = process.env.PORT || 8080;

global.server = app.listen(global.port, (resp) => {
    console.log('server running on port: ' + global.port);
});


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
    res.sendFile(__dirname + "/public/views/index.html")
})

app.post('/facebook-notification', () => {
    console.log(req.body);
    res.json({
        status: true
    });
})