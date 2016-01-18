var assert = require('assert');
var should = require('chai').should();
var expect = require('chai').expect();
var request = require ('supertest');
var server = require('../server.js');

var url = 'http://localhost:4000';

describe('Link Submission',function(){
  this.timeout(5000);
  var testUser = Math.floor(Math.random()*10000).toString();
  var testPass = 'fakepassword'; 
  var token = '';
  var userid = '';
  var safeUrl = "http://www.cnn.com/2016/01/08/americas/el-chapo-captured-mexico/index.html";

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

  it ('Should return an array of links',function(done){
    request(url).get('/api/links')
    .set('x-access-token', token)
    .expect('Content-Type',/json/)
    .end(function(err, res){
      if (err) {throw err}
      else {
        Array.isArray(res.body.links) && done();
      }
    });
  });

  it ('Should fail with a bad token',function(done){
    request(url).get('/api/links')
    .set('x-access-token', 'someGarbageToken')
    .expect(403,done);
  });

  it ('Should accept a valid, safe link',function(done){
    request(url).post('/api/links')
    .set('x-access-token', token)
    .send({
      user_id: userid,
      username: "Testy McTesterson",
      url: safeUrl
    }).expect('Content-Type',/json/).end(function(err, res){
      if (err) {throw err}
      else !res.body.error && done();
    });
  });

  it ('Should error on a garbage URL',function(done){
    request(url).post('/api/links')
    .set('x-access-token', token)
    .send({
      user_id: userid,
      username: "Testy McTesterson",
      url: "http://someGarbageUrl"
    }).expect('Content-Type',/json/).end(function(err, res){
      if (err) {throw err}
      else res.body.error && done();
    });
  });

  it ('Should accept duplicates but not enter them into the database',function(done){
    request(url).post('/api/links')
    .set('x-access-token', token)
    .send({
      user_id: userid,
      username: "Testy McTesterson",
      url: safeUrl
    }).expect('Content-Type',/json/).end(function(err, res){
      if (err) {throw err}
      else {
        request(url).get('/api/links')
        .set('x-access-token', token)
        .expect('Content-Type',/json/)
        .end(function(err, res){
          if (err) {throw err}
          else {
            var occurrences = 0;
            var links = res.body.links.map(function(day){
              return day.links.map(function(link){
                return link.url;
              });
            });
            links.forEach(function(array){
              array.forEach(function(url){
                (url === safeUrl) && occurrences++;
              });
            });
            (occurrences === 1) && done();
          }
        });
      }
    });
  });

  var obscureLink = "http://mylittlepony.hasbro.com/en-us";

  it ('Should delete a link',function(done){
    request(url).post('/api/links')
    .set('x-access-token', token)
    .send({
      user_id: userid,
      username: "Testy McTesterson",
      url: obscureLink
    }).expect('Content-Type',/json/).end(function(err, res){
      if (err) {throw err}
      else {
        setTimeout(function(){
          request(url).get('/api/links/'+res.body._id+'/delete')
          .set('x-access-token', token)
          .expect(200).end(function(err,res){
            if (err) {throw err}
            else {
              setTimeout(function(){
                request(url).get('/api/links')
                .set('x-access-token', token)
                .expect('Content-Type',/json/)
                .end(function(err, res){
                  if (err) {throw err}
                  else {
                    var occurrences = 0;
                    var links = res.body.links.map(function(day){
                      return day.links.map(function(link){
                        return link.url;
                      });
                    });
                    links.forEach(function(array){
                      array.forEach(function(url){
                        (url === obscureLink) && occurrences++;
                      });
                    });
                    (occurrences === 0) && done();
                  }
                });
              },500);
            }
          });
        },500);
      }
    });
  });
});
