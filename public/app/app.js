var app = angular.module('eureka', [
  'eureka.home',
  'eureka.auth',
  'ui.router'
])

app.config(function($stateProvider, $urlRouterProvider) {
  // For any unmatched url, redirect to /signup
  $urlRouterProvider.otherwise("/signup");
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
});