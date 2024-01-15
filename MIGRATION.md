# Migration Guide

This plugin is now deprecated and **no longer maintained** by the Grafana team. This deprecation means that this plugin won't receive any feature updates or bug fixes. After 6 months (End of June 2024), the plugin will reach EOL and the repository will be archived. You can use [Grafana Infinity data source plugin](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/) as an alternative for connecting to JSON/CSV/XML/GraphQL endpoints. Refer the migration guide [here](https://github.com/grafana/grafana-infinity-datasource/discussions/740), if you still prefer connecting to existing grafana simple JSON backend server implementation. Alternatively, you can also build your own plugin.

## Building your own plugin

 If you are looking for building your own plugin, consider the examples [here](https://github.com/grafana/grafana-plugin-examples) and documentation [here](https://grafana.com/developers).

## Migrating to Infinity data source plugin

<p align="center">
<img src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/7319d1c5-8e5a-4a4a-bf2f-66e37f9a98f5" width="100" height="100" /><b>=></b>
<img src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/9f38194c-0033-4764-8553-0c5f0268ab4d"  width="120" height="120" />
</p>

> [!IMPORTANT]
> Infinity is not a drop-in replacement for simple JSON datasource plugin. This require manual migration efforts. But migrating to infinity is strongly recommended approach if you are using simple JSON API datasource plugin.

### Approach 1: Direct API connection / Simple approach / Recommended approach

This is much easier and **recommended approach** to connect JSON api endpoints directly. Infinity allows you to connect directly to your JSON endpoints instead of requiring you to write your server implementation comparing to grafana simple json server approach. Refer [Infinity plugin website](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/) for more details about connecting your APIs directly.

With this approach, you can get rid of your custom json server and directly connect your API endpoints via Infinity plugin. If this approach is not possible for any reason, use the below alternate migration approach.

### Approach 2: Migrating using Grafana simple json server approach

With this approach, Instead of connecting your API endpoints directly, you will be connecting via grafana simple JSON server (legacy server). Also in grafana, instead of using simple json datasource plugin, you will be using Infinity plugin. 

#### Migrating the configuration

In terms of configuration editor, there is no much change. The URL used in simple json datasource goes into infinity config misc/url section. Other options such as proxy, tls/ca certificates, headers goes into network and headers section.

| Before | After |
|--|--|
| <img width="817" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/f7381eaa-8791-49e1-b114-d69e40876f26"> | <img width="881" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/f064f74c-7302-4518-8102-4e0a0c92a500">|

#### Provisioning

Provisioning of simple json and infinity is almost similar only the plugin id differs. Refer the infinity plugin [provisioning documentation](https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/setup/provisioning/) for more examples.

| Before | After |
|--|--|
| <img width="424" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/455cd3e0-2e71-4f26-8a66-6da978532609"> | <img width="417" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/ff63244e-5ba2-4642-9321-8efddd8898a0">|


#### Migrating the queries ( quick migration / frontend parser )

If you are using one or more queries using Simple JSON as shown below, you can migrate to infinity using the steps provided below. This approach is simple but less powerful. Doesn't support grafana backend features such as alerting.

| Before | After |
|---|---|
| <img width="1326" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/2d26e1cc-2ed1-488e-9607-0bd5226785a9">| <img width="1335" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/be3e07a9-4d7b-45b0-9cb6-e7ef86b74d99"><img width="1299" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/74cc2435-4bfb-444d-83ce-62198a46e0bc">|
| Select the target in the query editor. Example `upper_25`| Select `JSON` as query type. <br/>Select `Default`/`Frontend` as your parser. <br/>Source: `URL`. <br/>Format: `As IS`/`Legacy`. <br/>HTTP Method: `POST`. <br/>URL : `/query`<br/>HTTP Body: In your http body you need to specify the targets: `{  "targets": [{ "target":"upper_25" }] }`| 


#### Migrating the queries ( recommended migration / backend parser )

Use this approach to migrate to get support for features such as alerting, public dashboards, query caching etc.

| Before | After |
|---|--|
|<img width="1319" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/2a619d89-d15f-4bc0-a6c3-d958ec2d74da">|<img width="1314" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/04e531c3-00f9-44de-8429-0850a4541cad"><img width="876" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/f1771ff6-fa93-4c43-8933-5727e2116c31">|
|Select the target in the query editor. Example `upper_25`|Query Type: `URL` <br/>Parser: `Backend` <br/>Source: `URL` <br/>Format: `Time series` <br/>HTTP method: `POST` <br/>URL: `/query` <br/>BODY: `{  "targets": [{ "target":"upper_25" }]}` <br/>Parsing options/Root: `datapoints` <br/> Column 1: `0` as selector. `upper_25` as alias. `Number` as format.<br/>Column 2: `1` as selector. `Time` as alias. `Unix (ms)` as format.<br/>|

### Migrating the annotations

Migrating the annotations is similar to query. For example, below screenoshots show different annotation creations

###### Using Simple JSON
<img width="631" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/471fffe5-ef35-43b0-93a1-c6e666244ef4">

###### Using Infinity
<img width="1385" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/216138f6-b7d7-4911-93fb-f30da94b9efe">


#### Troubleshooting

> [!NOTE]
> Infinity doesn't support direct browser connection to your API endpoints. All the requests will be proxied from grafana server.

#### Sample migration dashboard

<img width="1792" alt="image" src="https://github.com/grafana/grafana-infinity-datasource/assets/153843/24038bad-2dbf-474a-b0e6-63405092057a" />
