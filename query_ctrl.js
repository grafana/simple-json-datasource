define([
  'angular',
  'lodash',
  'app/plugins/sdk'
],
function (angular, _, sdk) {
  'use strict';

  //var module = angular.module('grafana.controllers');

  //module.controller('GenericDatasourceQueryCtrl', function($scope, uiSegmentSrv) {
  var GenericDatasourceQueryCtrl = (function(_super) {
    var self;

    function GenericDatasourceQueryCtrl($scope, uiSegmentSrv, $injector) {
      _super.call(this, $scope, $injector);
      this.scope = $scope;

      this.scope.target.target = this.scope.target.target || 'select metric';
      self = this;
    }

    GenericDatasourceQueryCtrl.prototype = Object.create(_super.prototype)
    GenericDatasourceQueryCtrl.prototype.constructor = GenericDatasourceQueryCtrl;

    GenericDatasourceQueryCtrl.prototype.getOptions = function() {
      return this.datasource.metricFindQuery(this.scope.target)
        .then(self.uiSegmentSrv.transformToSegments(false));
        // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
    };

    GenericDatasourceQueryCtrl.prototype.onChangeInternal = function() {
      this.panelCtrl.refresh(); // Asks the panel to refresh data.
    };

  })(sdk.QueryCtrl);
});
