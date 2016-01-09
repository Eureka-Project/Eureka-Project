var assert = require('assert');
var should = require('chai').should();
var expect = require('chai').expect();
var request = require ('supertest');
var server = require('../server.js');
var userSpec;
var linksSpec;
var commentsSpec;

var url = 'http://localhost:4000';
describe('Server runs', function(){
  this.timeout(5000);
  it('Should respond to an HTTP GET', function(done){
    request(url).get('/index.html')
    .end(function(err, res){
      if (err) {throw err}
      else done();
    });
  });
});
userSpec = require('./userSpec.js');
linksSpec = require('./linksSpec.js');
commentsSpec = require('./commentsSpec.js');
