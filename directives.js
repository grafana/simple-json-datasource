define([
  'angular',
],
function (angular) {
  'use strict';

  var module = angular.module('grafana.directives');

  module.directive('metricQueryEditorGenericDatasource', function() {
    return {controller: 'GenericDatasourceQueryCtrl', templateUrl: 'public/plugins/genericdatasource/partials/query.editor.html'};
  });

  module.directive('metricQueryOptionsGenericDatasource', function() {
    return {templateUrl: 'public/plugins/genericdatasource/partials/query.options.html'};
  });

});
