/*
   {team: 'fireNation', subteams: [{team: 'royalty', players: [{name: 'Zuko'}, {name: 'Iroh'}]}]}]
   Teams contains Names that are unique
   Teams contains other Teams called subteams
   Teams contains other Teams called subteams that have other subteams

   Players are part of one team


*/

/*jshint expr: true*/
var mongoose = require("mongoose");
var teams = require("./teams");
var should = require('should');
var config = require('../config/environment/test');

var dataService = require('./dataService')

dataService.connect();

describe("In the components/teams module,", function() {
    describe('a Team', function() {
        var theTeam = null;
        beforeEach(function(done) {
            teams.Team.create({
                name: "Ford"
            }).then(function(doc) {
                theTeam = doc;
                done();
            }, function(err) {
                    done(err);
            });
        });

        it("contains names", function() {
            theTeam.should.be.ok;
            theTeam.save(function(err, doc) {
                (err === null).should.be.true;
                doc.name.should.eql(theTeam.name);
            });
        });
        it("that is unique ", function() {
            var teamFailed = new teams.Team();
            teamFailed.name = theTeam.name;
            teamFailed.save(function(err) {
                err.should.be.ok;
                (11000).should.eql(err.code);
            });
        });
        it("contains other teams", function() {

            var subTeam = new teams.Team();
            subTeam.parent = theTeam;
            subTeam.save(function(err) {
                (err === null).should.be.true;
                theTeam.getChildren(function(err, childrenTeam) {
                    childrenTeam.should.be.instanceof(Array);
                    (subTeam.id).should.be.eql(childrenTeam[0].id);
                });
            });
        });
        afterEach(function(done) {
            teams.Team.remove({}, function() {
                done();
            });
        });
    });

});