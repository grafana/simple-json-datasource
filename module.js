define([
  './datasource',
  './query_ctrl'
],
function(GenericDatasource, GenericQueryCtrl) {
  'use strict';

  var GenericConfigCtrl = function() {}
  GenericConfigCtrl.templateUrl = "partials/config.html";

  var GenericQueryOptionsCtrl = function() {}
  GenericQueryOptionsCtrl.templateUrl = "partials/query.options.html";

  return {
    'Datasource': GenericDatasource,
    'QueryCtrl': GenericQueryCtrl,
    'ConfigCtrl': GenericConfigCtrl,
    'QueryOptionsCtrl': GenericQueryOptionsCtrl
  };
});