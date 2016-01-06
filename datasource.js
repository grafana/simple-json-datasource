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

  module.factory('GenericDatasource', function($q, backendSrv) {
    // backendSrv handles all http-requests with proxy/auth

    function GenericDatasource(datasource) {
      this.type = datasource.type;
      this.url = datasource.url;
      this.name = datasource.name;
    }

    // Called once per panel (graph)
    GenericDatasource.prototype.query = function(options) {
      var query = buildQueryParameters(options);

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

    // Required
    // Used for testing datasource in datasource configuration pange
    GenericDatasource.prototype.testDatasource = function() {
      return backendSrv.datasourceRequest({
        url: this.url + '/',
        method: 'GET'
      }).then(function(response) {
        console.log(response);
        if (response.status === 200) {
          return { status: "success", message: "Data source is working", title: "Success" };
        }
      });
    };

    // Optional
    // Required for templating
    GenericDatasource.prototype.metricFindQuery = function(options) {
      return backendSrv.datasourceRequest({
        url: this.url + '/search',
        data: options,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(mapToTextValue);
    };

    function mapToTextValue(result) {
      return _.map(result.data, function(d, i) {
        return { text: d, value: i};
      });
    }

    function buildQueryParameters(options) {
      //remove placeholder targets
      options.targets = _.filter(options.targets, function(target) {
        return target.target !== 'select metric';
      });

      return options;
    }

    return GenericDatasource;
  });
});
