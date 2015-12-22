define([
  'angular',
],
function (angular) {
  'use strict';

  var module = angular.module('grafana.directives');

  //Make sure the name match the directive call from panel_directive.js
  //In this case <metric-query-editor-genericdatasource>
  //And watch your casings!

  module.directive('metricQueryEditorGenericdatasource', function() {
    return {
      controller: 'GenericDatasourceQueryCtrl',
      templateUrl: 'public/plugins/genericdatasource/partials/query.editor.html'
    };
  });

  module.directive('metricQueryOptionsGenericDatasource', function() {
    return {
      templateUrl: 'public/plugins/genericdatasource/partials/query.options.html'
    };
  });
});
