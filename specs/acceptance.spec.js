'use strict';

var assert = require('chai').assert;
var config = require('ptl-config');
var Rabbit = require('node-rabbitmq');
var logSender = require('node-log-sender');
var request = require('request');

require('../');

var rabbit;

describe('when valid bet selections are sent to the server', function () {

    beforeEach(function (done) {
        rabbit = new Rabbit(config.queueUri, function () {
            done();
        });
        logSender.configure(rabbit);
    });

    it('should return 200 status', function (done) {

        rabbit.receiveJson('bet', function (message, that) {
            that.ack();
            that.close();
        });

        request.post('http://localhost:3000', {
            json: {
                'competitors': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
            }
        }, function (err, res, body) {
            assert.equal(200, res.statusCode);
            assert.isNotNull(body);
            done();
        });
    });

    it('should send a bet item to the queue', function (done) {
        rabbit.receiveJson('bet', function (message, that) {
            assert.isNotNull(message.competitors);
            that.ack();
            that.close();
            done();
        }, function () {
            request.post('http://localhost:3000', {
                json: {
                    'competitors': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
                }
            }, function () {
            });
        });
    });
});

describe('when invalid bet selections are sent to the server', function () {
    it('will return 400 if competitors are not set', function (done) {
        request.post('http://localhost:3000', {
            json: {
                'notCompetitors': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
            }
        }, function (err, res) {
            assert.equal(400, res.statusCode);
            done();
        });
    });

    it('will return 400 if competitors is not an array', function (done) {
        request.post('http://localhost:3000', {
            json: {
                'competitors': 99
            }
        }, function (err, res) {
            assert.equal(400, res.statusCode);
            done();
        });
    });

    it('will not send anything on the queue if invalid', function (done) {
        rabbit.receiveJson('bet', function (message, that) {
            that.ack();
            that.close();
            done('bet was added to the queue');
        });

        request.post('http://localhost:3000', {
            json: {
                'competitors': 99
            }
        }, function (err, res) {
            assert.equal(400, res.statusCode);
            done();
        })

        setTimeout(function () {
            done();
        }, 300);
    });
});
