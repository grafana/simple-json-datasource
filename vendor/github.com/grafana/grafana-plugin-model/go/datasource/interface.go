package datasource

import (
	"context"

	"github.com/hashicorp/go-plugin"
	"google.golang.org/grpc"
)

// GrafanaAPI is the Grafana API interface that allows a datasource plugin to callback and request additional information from Grafana.
type GrafanaAPI interface {
	QueryDatasource(ctx context.Context, req *QueryDatasourceRequest) (*QueryDatasourceResponse, error)
}

// DatasourcePlugin is the Grafana datasource interface.
type DatasourcePlugin interface {
	Query(ctx context.Context, req *DatasourceRequest, api GrafanaAPI) (*DatasourceResponse, error)
}

// DatasourcePluginImpl is the implementation of plugin.Plugin so that it can be served/consumed as a Grafana datasource plugin.
// In addition, it also implements plugin.GRPCPlugin so that the it can be served over gRPC.
type DatasourcePluginImpl struct {
	plugin.NetRPCUnsupportedPlugin
	Plugin DatasourcePlugin
}

func (p *DatasourcePluginImpl) GRPCServer(broker *plugin.GRPCBroker, s *grpc.Server) error {
	RegisterDatasourcePluginServer(s, &GRPCServer{
		broker: broker,
		Impl:   p.Plugin,
	})
	return nil
}

func (p *DatasourcePluginImpl) GRPCClient(ctx context.Context, broker *plugin.GRPCBroker, c *grpc.ClientConn) (interface{}, error) {
	return &GRPCClient{
		broker: broker,
		client: NewDatasourcePluginClient(c),
	}, nil
}

var _ plugin.GRPCPlugin = &DatasourcePluginImpl{}
