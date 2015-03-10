(function () {
    'use strict';
    var express = require('express');
    var app = express();

    var Rabbit = require('node-rabbitmq');
    var logSender = require('node-log-sender');
    var bodyParser = require('body-parser');
    
    var rabbit = new Rabbit("amqp://betrec:betrec@52.64.12.93/", function () {
        logSender.configure(rabbit);

        app.use(bodyParser.json());

        app.post('/', function (req, res) {

            var competitors = req.body;

            if (!isValidJson(competitors)) {
                res.status(400);
                res.send('missing competitors');
                return;
            }

            rabbit.sendJson({
                competitors: competitors
            }, 'bet');

            logSender.info('betReceived');
            logSender.sendKPI('betReceived');
            res.send('Saved');
        });
        app.listen(3000, function () {
            console.log('Started Server');
        });
    });



    function isValidJson(body) {
        return body.competitors && Object.prototype.toString.call(body.competitors) === '[object Array]';
    }


    process.on('uncaughtException', function (err) {
        console.error('uncaughtException:', err.message);
        console.error(err.stack);
        logSender.error(err.message + " \n" + err.stack);
        process.exit(1);
    });
})();
