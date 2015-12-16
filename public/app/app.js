var app = angular.module('eureka', [
  'eureka.home',
  'eureka.signup',
  'ui.router'
])

app.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/signup");
  //
  // Now set up the states
  $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "app/views/home.html",
      controller: "HomeController"
    })
    .state('signup', {
      url: "/signup",
      templateUrl: "app/views/signup.html",
      controller: "SignupController"
    })
});