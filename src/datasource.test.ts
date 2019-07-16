import { GenericDatasource as Datasource } from './datasource';
import { DataSourceInstanceSettings } from '@grafana/ui';
import { GenericOptions } from './types';

describe('GenericDatasource', () => {
  const ctx: any = {};

  beforeEach(() => {
    ctx.backendSrv = {};
    ctx.templateSrv = {};
    ctx.ds = new Datasource({} as DataSourceInstanceSettings<GenericOptions>, ctx.backendSrv, ctx.templateSrv);
  });

  it('should return an empty array when no targets are set', done => {
    ctx.ds.query({ targets: [] }).then((result: any) => {
      expect(result.data).toHaveLength(0);
      done();
    });
  });

  it('should return the server results when a target is set', done => {
    ctx.backendSrv.datasourceRequest = (request: any) => {
      return Promise.resolve({
        _request: request,
        data: [
          {
            target: 'X',
            datapoints: [1, 2, 3],
          },
        ],
      });
    };

    ctx.templateSrv.replace = (data: any) => {
      return data;
    };

    ctx.ds.query({ targets: ['hits'] }).then((result: any) => {
      expect(result._request.data.targets).toHaveLength(1);

      const series = result.data[0];
      expect(series.target).toEqual('X');
      expect(series.datapoints).toHaveLength(3);
      done();
    });
  });

  it('should return the metric results when a target is null', done => {
    ctx.backendSrv.datasourceRequest = (request: any) => {
      return Promise.resolve({
        _request: request,
        data: ['metric_0', 'metric_1', 'metric_2'],
      });
    };

    ctx.templateSrv.replace = (data: any) => {
      return data;
    };

    ctx.ds.metricFindQuery({ target: null }).then((result: any) => {
      expect(result).toHaveLength(3);
      expect(result[0].text).toEqual('metric_0');
      expect(result[0].value).toEqual('metric_0');
      expect(result[1].text).toEqual('metric_1');
      expect(result[1].value).toEqual('metric_1');
      expect(result[2].text).toEqual('metric_2');
      expect(result[2].value).toEqual('metric_2');
      done();
    });
  });

  it('should return the metric target results when a target is set', done => {
    ctx.backendSrv.datasourceRequest = (request: any) => {
      const target = request.data.target;
      const result = [target + '_0', target + '_1', target + '_2'];

      return Promise.resolve({
        _request: request,
        data: result,
      });
    };

    ctx.templateSrv.replace = (data: any) => {
      return data;
    };

    ctx.ds.metricFindQuery('search').then((result: any) => {
      expect(result).toHaveLength(3);
      expect(result[0].text).toEqual('search_0');
      expect(result[0].value).toEqual('search_0');
      expect(result[1].text).toEqual('search_1');
      expect(result[1].value).toEqual('search_1');
      expect(result[2].text).toEqual('search_2');
      expect(result[2].value).toEqual('search_2');
      done();
    });
  });

  it('should return the metric results when the target is an empty string', done => {
    ctx.backendSrv.datasourceRequest = (request: any) => {
      return Promise.resolve({
        _request: request,
        data: ['metric_0', 'metric_1', 'metric_2'],
      });
    };

    ctx.templateSrv.replace = (data: any) => {
      return data;
    };

    ctx.ds.metricFindQuery('').then((result: any) => {
      expect(result).toHaveLength(3);
      expect(result[0].text).toEqual('metric_0');
      expect(result[0].value).toEqual('metric_0');
      expect(result[1].text).toEqual('metric_1');
      expect(result[1].value).toEqual('metric_1');
      expect(result[2].text).toEqual('metric_2');
      expect(result[2].value).toEqual('metric_2');
      done();
    });
  });

  it('should return the metric results when the args are an empty object', done => {
    ctx.backendSrv.datasourceRequest = (request: any) => {
      return Promise.resolve({
        _request: request,
        data: ['metric_0', 'metric_1', 'metric_2'],
      });
    };

    ctx.templateSrv.replace = (data: any) => {
      return data;
    };

    ctx.ds.metricFindQuery().then((result: any) => {
      expect(result).toHaveLength(3);
      expect(result[0].text).toEqual('metric_0');
      expect(result[0].value).toEqual('metric_0');
      expect(result[1].text).toEqual('metric_1');
      expect(result[1].value).toEqual('metric_1');
      expect(result[2].text).toEqual('metric_2');
      expect(result[2].value).toEqual('metric_2');
      done();
    });
  });

  it('should return the metric target results when the args are a string', done => {
    ctx.backendSrv.datasourceRequest = (request: any) => {
      const target = request.data.target;
      const result = [target + '_0', target + '_1', target + '_2'];

      return Promise.resolve({
        _request: request,
        data: result,
      });
    };

    ctx.templateSrv.replace = (data: any) => {
      return data;
    };

    ctx.ds.metricFindQuery('search').then((result: any) => {
      expect(result).toHaveLength(3);
      expect(result[0].text).toEqual('search_0');
      expect(result[0].value).toEqual('search_0');
      expect(result[1].text).toEqual('search_1');
      expect(result[1].value).toEqual('search_1');
      expect(result[2].text).toEqual('search_2');
      expect(result[2].value).toEqual('search_2');
      done();
    });
  });

  it('should return data as text and as value', done => {
    const result = ctx.ds.mapToTextValue({ data: ['zero', 'one', 'two'] });

    expect(result).toHaveLength(3);
    expect(result[0].text).toEqual('zero');
    expect(result[0].value).toEqual('zero');
    expect(result[1].text).toEqual('one');
    expect(result[1].value).toEqual('one');
    expect(result[2].text).toEqual('two');
    expect(result[2].value).toEqual('two');
    done();
  });

  it('should return text as text and value as value', done => {
    const data = [{ text: 'zero', value: 'value_0' }, { text: 'one', value: 'value_1' }, { text: 'two', value: 'value_2' }];

    const result = ctx.ds.mapToTextValue({ data: data });

    expect(result).toHaveLength(3);
    expect(result[0].text).toEqual('zero');
    expect(result[0].value).toEqual('value_0');
    expect(result[1].text).toEqual('one');
    expect(result[1].value).toEqual('value_1');
    expect(result[2].text).toEqual('two');
    expect(result[2].value).toEqual('value_2');
    done();
  });

  it('should return data as text and index as value', done => {
    const data = [{ a: 'zero', b: 'value_0' }, { a: 'one', b: 'value_1' }, { a: 'two', b: 'value_2' }];

    const result = ctx.ds.mapToTextValue({ data: data });

    expect(result).toHaveLength(3);
    expect(result[0].text).toEqual(data[0]);
    expect(result[0].value).toEqual(0);
    expect(result[1].text).toEqual(data[1]);
    expect(result[1].value).toEqual(1);
    expect(result[2].text).toEqual(data[2]);
    expect(result[2].value).toEqual(2);
    done();
  });

  it('should support tag keys', done => {
    const data = [{ type: 'string', text: 'One', key: 'one' }, { type: 'string', text: 'two', key: 'Two' }];

    ctx.backendSrv.datasourceRequest = (request: any) => {
      return Promise.resolve({
        _request: request,
        data: data,
      });
    };

    ctx.ds.getTagKeys().then((result: any) => {
      expect(result).toHaveLength(2);
      expect(result[0].type).toEqual(data[0].type);
      expect(result[0].text).toEqual(data[0].text);
      expect(result[0].key).toEqual(data[0].key);
      expect(result[1].type).toEqual(data[1].type);
      expect(result[1].text).toEqual(data[1].text);
      expect(result[1].key).toEqual(data[1].key);
      done();
    });
  });

  it('should support tag values', done => {
    const data = [{ key: 'eins', text: 'Eins!' }, { key: 'zwei', text: 'Zwei' }, { key: 'drei', text: 'Drei!' }];

    ctx.backendSrv.datasourceRequest = (request: any) => {
      return Promise.resolve({
        _request: request,
        data: data,
      });
    };

    ctx.ds.getTagValues().then((result: any) => {
      expect(result).toHaveLength(3);
      expect(result[0].text).toEqual(data[0].text);
      expect(result[0].key).toEqual(data[0].key);
      expect(result[1].text).toEqual(data[1].text);
      expect(result[1].key).toEqual(data[1].key);
      expect(result[2].text).toEqual(data[2].text);
      expect(result[2].key).toEqual(data[2].key);
      done();
    });
  });
});
