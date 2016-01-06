This is a very minimalistic datasource that forwards http requests in a defined format. The idea is that anybody should be able to build an api and retrieve data from any datasource without built-in support in grafana.

Its also serves as an living example implementation of a datasource.

A guide for installing plugins can be found at [placeholder for links].


== Request that will be sent to your service ==

{
  range: { from: '2015-12-22T03:06:13.851Z',to: '2015-12-22T06:48:24.137Z' },
  interval: '5s',
  targets:
   [ { refId: 'B', target: 'upper_75' },
     { refId: 'A', target: 'upper_90' } ],
  format: 'json',
  maxDataPoints: 2495 //decided by the panel
}

== Expected response ==

An array of
{
    "target":"target_name",
    "datapoints":[
      [intvalue, timestamp in epoch],
      [intvalue, timestamp in epoch]
    ]
  }

Example

[
  {
    "target":"upper_75",
    "datapoints":[
      [622,1450754160000],
      [365,1450754220000]
    ]
  },
  {
    "target":"upper_90",
    "datapoints":[
      [861,1450754160000],
      [767,1450754220000]
    ]
  }
]