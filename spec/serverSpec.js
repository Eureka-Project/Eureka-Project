var assert = require('assert');
var should = require('chai').should();
var expect = require('chai').expect();
var request = require ('supertest');
var server = require('../server.js');

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
describe('User Management',function(){
  this.timeout(5000);
  beforeEach(function(test){
    setTimeout(function(){
      test();
    },1000);
  });

  it ('Should create and delete a user',function(done){
    var testUser = Math.floor(Math.random()*10000).toString();
    var testPass = 'fakepassword'; 
    var token = '';
    var userid = '';
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
        res.body.username.should.equal(testUser);
        token = res.body.token;
        userid = res.body.user_id;
        request(url).get('/api/users/'+testUser+'/delete')
        .set('x-access-token', token)
        .expect(200).end(function(err,res){
          if (err) {throw err}
          else done();
        });
      }
    });
  });

  it ('Should log in as a newly created user',function(done){
    var testUser = Math.floor(Math.random()*10000).toString();
    var testPass = 'fakepassword'; 
    var token = '';
    var userid = '';
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
        res.body.username.should.equal(testUser);
        request(url).post('/api/users/login')
        .send({
          username: testUser,
          password: testPass
        }).expect('Content-Type',/json/).end(function(err,res){
          if (err) {throw err}
          else{
            token = res.body.token;
            request(url).get('/api/users/'+testUser+'/delete')
            .set('x-access-token', token)
            .expect(200).end(function(err,res){
              if (err) {throw err}
              else done();
            });
          } 
        });
      }
    });
  });

  it ('Should reject bad logins',function(done){
    request(url).post('/api/users/login')
    .send({
      username: 'badusername',
      password: 'badpass'
    }).expect(500,done)
  });
});

describe('Front End Routes',function(){
  this.timeout(5000);
  var testUser = Math.floor(Math.random()*10000).toString();
  var testPass = 'fakepassword'; 
  var token = '';
  var userid = '';

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
        done();
      }
    });
  });

  after(function(done){
    request(url).get('/api/users/'+testUser+'/delete')
    .set('x-access-token', token)
    .expect(200).end(function(){done()});
  });

  beforeEach(function(test){
    setTimeout(function(){
      test();
    },1000);
  })

  it ('Should return the users profile',function(done){
    request(url).get('/api/users/profile'+testUser)
    .set('x-access-token', token)
    .expect('Content-Type',/json/).end(function(err,res){
      if (err) {throw err}
      else done()
    });
  });

});
