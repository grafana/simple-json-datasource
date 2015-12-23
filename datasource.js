define([
  'angular',
  'lodash',
  'app/core/utils/datemath',
  'app/core/utils/kbn',
  './query_ctrl',
  './directives',
],
function (angular, _, dateMath, kbn) {
  'use strict';

  var module = angular.module('grafana.services');

  module.factory('GenericDatasource', function($q, backendSrv, templateSrv) {

    function GenericDatasource(datasource) {
      this.type = datasource.type;
      this.url = datasource.url;
      this.name = datasource.name;
      this.supportMetrics = true;
    }

    // Called once per panel (graph)
    GenericDatasource.prototype.query = function(options) {
      var query = this.buildQueryParameters(options);

      if (query.targets.length <= 0) {
        $q.when([]);
      }

      return backendSrv.datasourceRequest({
        url: this.url + '/query',
        data: query,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    };

    GenericDatasource.prototype.testDatasource = function() {
      return backendSrv.datasourceRequest({
        url: this.url + '/',
        method: 'GET'
      }).then(function(response) {
        if (response.status === 200) {
          return { status: "success", message: "Data source is working", title: "Success" };
        }
      });
    };

    GenericDatasource.prototype.metricFindQuery = function(options) {
      return backendSrv.datasourceRequest({
        url: this.url + '/search',
        data: options,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(this.mapToTextValue);
    };

    GenericDatasource.prototype.mapToTextValue = function(result) {
      return _.map(result.data, function(d, i) {
        return { text: d, value: i};
      });
    }

    GenericDatasource.prototype.buildQueryParameters = function(options) {
      options.targets = _.filter(options.targets, function(target) {
        return target.target !== 'select metric';
      });

      return options;
    };

    return GenericDatasource;
  });
});
