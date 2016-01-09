var assert = require('assert');
var should = require('chai').should();
var expect = require('chai').expect();
var request = require ('supertest');
var server = require('../server.js');

var url = 'http://localhost:4000';

describe('Comments',function(){
  this.timeout(5000);
  var testUser = Math.floor(Math.random()*10000).toString();
  var testPass = 'fakepassword'; 
  var token = '';
  var userid = '';
  var linkid = '';
  var obscureLink = "http://mylittlepony.hasbro.com/en-us";

  before(function(done){
    request(url).post('/api/users/signup')
    .send({
      username: testUser,
      password: testPass,
      firstname: "Testy",
      lastname: "McTesterson"
    }).expect('Content-Type',/json/)
    .end(function(err, res){
      if (err) {throw err}
      else {
        token = res.body.token;
        userid = res.body.user_id;
        request(url).post('/api/links')
        .set('x-access-token', token)
        .send({
          user_id: userid,
          username: "Testy McTesterson",
          url: obscureLink
        }).expect('Content-Type',/json/).end(function(err, res){
          if (err) {throw err}
          else {
            linkid = res.body._id;
            done();
          }
        });
      }
    });
  });

  after(function(done){
    request(url).get('/api/links/'+linkid+'/delete')
    .set('x-access-token', token)
    .end(function(err, res){
      request(url).get('/api/users/'+testUser+'/delete')
      .set('x-access-token', token)
      .expect(200,done);
    });
  });

  beforeEach(function(test){
    setTimeout(function(){
      test();
    },2000);
  })

  it ('Should run its before and after hooks',function(done){
    done();

  });

  xit ('Should add a comment to an existing link',function(done){

  });

});
