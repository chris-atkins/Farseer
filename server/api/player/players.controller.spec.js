'use strict';

var nextIfError = require("callback-wrappers").nextIfError;
var should = require('should');
var app = require('../../app');
var request = require('supertest');
var players = require("../../components/players")
var dataService = require('../../components/dataService')
var format = require('string-format')

dataService.connect();

describe('/api/players', function() {
    describe('GET ', function() {
        var smith;

        beforeEach(function(done) {
            players.Player.create({
                name: "Smith ",
                email: "test@test.smith.com"
            }, function(err, doc) {
                smith = doc;
                done();
            });
        });

        it('should respond with JSON array', function(done) {
            request(app)
            .get('/api/players')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.be.instanceof(Array);
                smith.id.should.be.equal(res.body[0]._id);
                done();
            });
        });

        afterEach(function(done) {
            players.Player.remove({}, function() {
                done();
            });
        });
    });

    //curl http://localhost:9000/api/players
    //curl -H "Content-Type: application/json" -d '{"name":"pedro","email":"pedro@email"}' http://localhost:9000/api/players
    describe('POST ', function() {
        it('should create players', function(done) {
            request(app)
            .post('/api/players')
            .send({
                name: 'Manny',
                email: 'cat@email.com'
            })
        .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
        });

        describe('when adding duplicate player', function() {
          beforeEach(function(done) {
              players.Player.create({
                  name: "Smith ",
                  email: "test@test.smith.com"
              }, function(err, doc) {
                  done();
              });
          });

          it('should return a human error message', function(done) {
            request(app)
              .post('/api/players')
              .send({
                  name: 'Smith',
                  email: 'test@test.smith.com'
              })
              .set('Accept', 'application/json')
              .expect(409)
              .expect('Content-Type', /json/)
              .expect({message: "A player with email test@test.smith.com already exists"}, function(error) {
                done(error);
              });

          });

        });

        afterEach(function(done) {
            players.Player.remove({}, function() {
                done();
            });
        });
    });


});

describe('/api/players/:player_id', function() {

    describe('GET ', function() {
        var smith;

        beforeEach(function(done) {
            players.Player.create({
                name: "Smith ",
                email: "test@test.smith.com"
            },
            function(err, doc) {
                smith = doc;
                done();
            });
        });
        it('will return a valid object if exists ', function(done) {
            var url = '/api/players/' + smith.id;
            request(app)
            .get(url)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err) return done(err);
                smith.name.should.be.equal(res.body.name);
                smith.email.should.be.equal(res.body.email);
                done();
            });
        });
        it('will return an empty object with error information ', function(done) {
            var randomId = parseInt(Math.random() * 1000);
            var url = '/api/players/' + randomId;
            request(app)
            .get(url)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(
                nextIfError(
                    function(res) {
                        res.body.errorMessage.should.be.equal(format("PLAYER with id {} does not exist.", randomId));
                        done();
                    },
                    function(err) {
                        done(err);
                    }
                    ));
        });
        afterEach(function(done) {
            players.Player.remove({}, function() {
                done();
            });
        });
    });
    describe('PUT', function() {
        var smith, anderson;
        var smithChanged = {
            name: 'Smith Update',
            email: 'email@changed.com'
        };
        beforeEach(function(done) {
            players.Player.create({
                name: "Smith ",
                email: "test@test.smith.com"
            },
            function(err, doc) {
                smith = doc;
                done();
            });
        });
        it('will update a valid object ', function(done) {
            var url = '/api/players/' + smith.id;

            request(app)
            .put(url)
            .send(smithChanged)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if(err) return done(err);
                players.Player.findById(smith.id, function(err, doc) {
                    if (err) return done(err);
                    doc.name.should.be.equal(smithChanged.name);
                    doc.email.should.be.equal(smithChanged.email);
                    done();
                });
            });
        });

        describe('when using duplicate email', function() {
          beforeEach(function(done) {
              players.Player.create({
                  name: "Anderson",
                  email: "neo@matrix.com"
              },
              function(err, doc) {
                  anderson = doc;
                  done();
              });
          });

          it('should return a human error message', function(done) {

            request(app)
              .put('/api/players/' + smith.id)
              .send({
                  name: 'Smitty',
                  email: anderson.email
              })
              .set('Accept', 'application/json')
              .expect(409)
              .expect('Content-Type', /json/)
              .expect({message: "A player with email " + anderson.email + " already exists"}, function(error) {
                done(error);
              });

          });

        });

        afterEach(function(done) {
            players.Player.remove({}, function() {
                done();
            });
        });
    });

    describe('DELETE', function() {
        var smith;
        beforeEach(function(done) {
            players.Player.create({
                name: "Smith ",
                email: "test@test.smith.com"
            },
            function(err, doc) {
                smith = doc;
                done();
            });
        });
        it('will remove an valid object ', function(done) {
            var url = '/api/players/' + smith.id;
            request(app)
            .delete(url)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
        });
        afterEach(function(done) {
            players.Player.remove({}, function() {
                done();
            });
        });
    });
});
