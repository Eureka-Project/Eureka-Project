var app = angular.module('eureka', [
  'eureka.services',
  'eureka.auth',
  'eureka.home',
  'ui.router'
])

app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  // For any unmatched url, redirect to /signup
  $urlRouterProvider.otherwise("/login");
  // Routing States
  $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "app/views/home.html",
      controller: "HomeController"
    })
    .state('signup', {
      url: "/signup",
      templateUrl: "app/views/signup.html",
      controller: "AuthController"
    })
    .state('login', {
      url: "/login",
      templateUrl: "app/views/login.html",
      controller: "AuthController"
    })
    $httpProvider.interceptors.push('AttachTokens');
});

app.factory('AttachTokens', function ($window) {
  // this is an $httpInterceptor
  // its job is to stop all out going request
  // then look in local storage and find the user's token
  // then add it to the header so the server can validate the request
  var attach = {
    request: function (object) {
      var jwt = JSON.parse($window.localStorage.getItem('eureka'));
      console.log('TOKEN:', jwt.token)
      if (jwt) {
        object.headers['x-access-token'] = jwt.token;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})