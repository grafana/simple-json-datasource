package main

import (
	"os"

	"log"

	shared "github.com/grafana/grafana/pkg/plugins/datasource/tsdb"
	plugin "github.com/hashicorp/go-plugin"
)

func main() {
	log.SetOutput(os.Stderr) // the plugin sends logs to the host process on strErr

	plugin.Serve(&plugin.ServeConfig{

		HandshakeConfig: plugin.HandshakeConfig{
			ProtocolVersion:  1,
			MagicCookieKey:   "grafana_plugin_type",
			MagicCookieValue: "datasource",
		},
		Plugins: map[string]plugin.Plugin{
			"backend-datasource": &shared.TsdbPluginImpl{Plugin: &JsonDatasource{}},
		},

		// A non-nil value here enables gRPC serving for this plugin...
		GRPCServer: plugin.DefaultGRPCServer,
	})
}
