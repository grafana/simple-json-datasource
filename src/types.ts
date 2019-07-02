import { DataQuery, DataSourceJsonData } from '@grafana/ui';

export interface GenericQuery extends DataQuery {
  // anything custom?
}

export interface GenericOptions extends DataSourceJsonData {
  // Custom options saved in the datasource
}
