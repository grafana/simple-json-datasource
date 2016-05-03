## Simple JSON Datasource - a generic backend datasource

More documentation about datasource plugins can be found in the [Docs](https://github.com/grafana/grafana/blob/master/docs/sources/plugins/datasources.md).

This also serves as a living example implementation of a datasource.

Your backend needs to implement 4 urls:

 * / should return 200 ok. Used for "Test connection" on the datasource config page.
 * /search used by the find metric options on the query tab in panels.
 * /query should return metrics based on input.
 * /annotations should return annotations.

### Example backend implementations
- https://gist.github.com/bergquist/bc4aa5baface3cffa109
- https://gist.github.com/tral/1fe649455fe2de9fb8fe

### Annotation API

The annotation request from the Simple JSON Datasource is a POST request to
the /annotations endpoint in your datasource. The JSON request body looks like this:
``` javascript
{
  "range": {
    "from": "2016-04-15T13:44:39.070Z",
    "to": "2016-04-15T14:44:39.070Z"
  },
  "rangeRaw": {
    "from": "now-1h",
    "to": "now"
  },
  "annotation": {
    "name": "deploy",
    "datasource": "Simple JSON Datasource",
    "iconColor": "rgba(255, 96, 96, 1)",
    "enable": true,
    "query": "#deploy"
  }
}
```

Grafana expects a response containing an array of annotation objects in the
following format:

``` javascript
[
  {
    annotation: annotation, // The original annotation sent from Grafana.
    time: time, // Time since UNIX Epoch in milliseconds. (required)
    title: title, // The title for the annotation tooltip. (required)
    tags: tags, // Tags for the annotation. (optional)
    text: text // Text for the annotation. (optional)
  }
]
```

Note: If the datasource is configured to connect directly to the backend, you
also need to implement an OPTIONS endpoint at /annotations that responds
with the correct CORS headers:

```
Access-Control-Allow-Headers:accept, content-type
Access-Control-Allow-Methods:POST
Access-Control-Allow-Origin:*
```

### If using Grafana 2.6
NOTE!
for grafana 2.6 please use [this version](https://github.com/grafana/simple-json-datasource/commit/b78720f6e00c115203d8f4c0e81ccd3c16001f94)

Copy the data source you want to /public/app/plugins/datasource/. Then restart grafana-server. The new data source should now be available in the data source type dropdown in the Add Data Source View.
