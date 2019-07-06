// Types
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MetricFindValue
} from '@grafana/ui';
import { GenericQuery, GenericOptions } from './types';

import _ from 'lodash';

export class GenericDatasource extends DataSourceApi<GenericQuery, GenericOptions> {

  private url: string;
  private withCredentials: boolean;
  private headers: any;

  constructor(
    instanceSettings: DataSourceInstanceSettings<GenericOptions>,
    private backendSrv: any,
    private templateSrv: any) {
    super(instanceSettings);

    this.url = instanceSettings.url ? instanceSettings.url : '';

    this.withCredentials = !!instanceSettings.withCredentials;
    this.headers = {'Content-Type': 'application/json'};
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  query(options: DataQueryRequest<GenericQuery>): Promise<DataQueryResponse> {
    const query = this.buildQueryParameters(options);

    if (query.targets.length <= 0) {
      return Promise.resolve({data: []});
    }

    if (this.templateSrv.getAdhocFilters) {
      query.adhocFilters = this.templateSrv.getAdhocFilters(this.name);
    } else {
      query.adhocFilters = [];
    }

    return this.doRequest({
      url: this.url + '/query',
      data: query,
      method: 'POST'
    });
  }

  testDatasource() {
    return this.doRequest({
      url: this.url + '/',
      method: 'GET',
    }).then( (response: any) => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
      return {
        status: "warning",
        message: "Invalid response",
        title: "Error"
      };
    });
  }

  annotationQuery(options: any) {
    const query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
    const annotationQuery = {
      range: options.range,
      annotation: {
        name: options.annotation.name,
        datasource: options.annotation.datasource,
        enable: options.annotation.enable,
        iconColor: options.annotation.iconColor,
        query: query
      },
      rangeRaw: options.rangeRaw
    };

    return this.doRequest({
      url: this.url + '/annotations',
      method: 'POST',
      data: annotationQuery
    }).then( (result: any) => {
      return result.data;
    });
  }

  metricFindQuery(query: any, options?: any): Promise<MetricFindValue[]> {
    const interpolated = {
        target: this.templateSrv.replace(query, null, 'regex')
    };

    return this.doRequest({
      url: this.url + '/search',
      data: interpolated,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  mapToTextValue(result: any) {
    return _.map(result.data, (d, i) => {
      if (d && d.text && d.value) {
        return { text: d.text, value: d.value };
      } else if (_.isObject(d)) {
        return { text: d, value: i};
      }
      return { text: d, value: d };
    });
  }

  doRequest(options: any) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return this.backendSrv.datasourceRequest(options);
  }

  buildQueryParameters(options: any) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });

    const targets = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(target.target, options.scopedVars, 'regex'),
        refId: target.refId,
        hide: target.hide,
        type: target.type || 'timeserie'
      };
    });

    options.targets = targets;

    return options;
  }

  getTagKeys(options: any): Promise<MetricFindValue[]> {
    return new Promise((resolve, reject) => {
      this.doRequest({
        url: this.url + '/tag-keys',
        method: 'POST',
        data: options
      }).then( (result: any) => {
        return resolve(result.data);
      });
    });
  }

  getTagValues(options: any): Promise<MetricFindValue[]> {
    return new Promise((resolve, reject) => {
      this.doRequest({
        url: this.url + '/tag-values',
        method: 'POST',
        data: options
      }).then( (result: any) => {
        return resolve(result.data);
      });
    });
  }

}
