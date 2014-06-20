'use strict';

var findme = angular.module('findme', [
  'ngRoute',
  'ngAnimate',
  'findmeControllers',
  'findmeServices'
])
.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/mapView.html',
        controller: 'mapCtrl'
      })
    ;
  }
]);
