define([
  'angular',
  'lodash'
],
function (angular, _) {
  'use strict';

  var module = angular.module('grafana.controllers');

  module.controller('GenericDatasourceQueryCtrl', function($scope, uiSegmentSrv) {

    $scope.init = function() {
      $scope.panel.stack = false;
      $scope.validateModel();
    };

    $scope.panelBlur = function() {
      $scope.get_data();
      $scope.validateModel();
    };

    $scope.validateModel = function() {
      $scope.target.target = $scope.target.target || 'select metric';
    };

    $scope.getOptions = function() {
      return $scope.datasource.metricFindQuery($scope.target)
        .then(uiSegmentSrv.transformToSegments(false));
    };

    $scope.getTextValues = function(metricFindResult) {
      return _.map(metricFindResult, function(value) { return value.text; });
    };

    $scope.init();
  });
});
