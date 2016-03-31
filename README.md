## Simple JSON Datasource - a generic backend datasource

More documentation about datasource plugins can be found in the [Docs](https://github.com/grafana/grafana/blob/master/docs/sources/plugins/datasources.md)

Its also serves as an living example implementation of a datasource.

Your backend needs to implement 4 urls:

 * "/" Should return 200 ok. Used for "Test connection" on the datasource config page.
 * "/search" Used by the find metric options on the query tab in panels
 * "/query" Should return metrics based on input
 * "/annotations" should return annotations

### Example backend implementation
https://gist.github.com/bergquist/bc4aa5baface3cffa109
https://gist.github.com/tral/1fe649455fe2de9fb8fe

### If using Grafana 2.6
NOTE!
for grafana 2.6 please use [this version](https://github.com/grafana/simple-json-datasource/commit/b78720f6e00c115203d8f4c0e81ccd3c16001f94)

Copy the data source you want to /public/app/plugins/datasource/. Then restart grafana-server. The new data source should now be avalilable in the data source type dropdown in the Add Data Source View.
