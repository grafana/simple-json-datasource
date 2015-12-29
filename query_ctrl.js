define([
  'angular',
  'lodash'
],
function (angular, _) {
  'use strict';

  var module = angular.module('grafana.controllers');

  module.controller('GenericDatasourceQueryCtrl', function($scope, uiSegmentSrv) {

    $scope.init = function() {
      $scope.target.target = $scope.target.target || 'select metric';
    };

    $scope.getOptions = function() {
      return $scope.datasource.metricFindQuery($scope.target)
        .then(uiSegmentSrv.transformToSegments(false));
        // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
    };

    $scope.onChangeInternal = function() {
      $scope.get_data(); // Asks the panel to refresh data.
    };

    $scope.init();
  });
});
