package datasource

import (
	"context"

	"github.com/hashicorp/go-hclog"
	"github.com/hashicorp/go-plugin"
	"google.golang.org/grpc"
)

// GRPCClient is an implementation of DatasourcePluginClient that talks over RPC.
type GRPCClient struct {
	broker *plugin.GRPCBroker
	client DatasourcePluginClient
}

func (m *GRPCClient) Query(ctx context.Context, req *DatasourceRequest, api GrafanaAPI) (*DatasourceResponse, error) {
	apiServer := &GRPCGrafanaAPIServer{Impl: api}

	var s *grpc.Server
	serverFunc := func(opts []grpc.ServerOption) *grpc.Server {
		s = grpc.NewServer(opts...)
		RegisterGrafanaAPIServer(s, apiServer)

		return s
	}

	brokerID := m.broker.NextId()
	go m.broker.AcceptAndServe(brokerID, serverFunc)

	req.RequestId = brokerID
	res, err := m.client.Query(ctx, req)

	s.Stop()
	return res, err
}

// GRPCServer is the gRPC server that GRPCClient talks to.
type GRPCServer struct {
	broker *plugin.GRPCBroker
	Impl   DatasourcePlugin
}

func (m *GRPCServer) Query(ctx context.Context, req *DatasourceRequest) (*DatasourceResponse, error) {
	conn, err := m.broker.Dial(req.RequestId)
	if err != nil {
		return nil, err
	}
	defer conn.Close()

	api := &GRPCGrafanaAPIClient{NewGrafanaAPIClient(conn)}
	return m.Impl.Query(ctx, req, api)
}

// GRPCGrafanaAPIClient is an implementation of GrafanaAPIClient that talks over RPC.
type GRPCGrafanaAPIClient struct{ client GrafanaAPIClient }

func (m *GRPCGrafanaAPIClient) QueryDatasource(ctx context.Context, req *QueryDatasourceRequest) (*QueryDatasourceResponse, error) {
	resp, err := m.client.QueryDatasource(ctx, req)
	if err != nil {
		hclog.Default().Info("grafana.QueryDatasource", "client", "start", "err", err)
		return nil, err
	}
	return resp, err
}

// GRPCGrafanaAPIServer is the gRPC server that GRPCGrafanaAPIClient talks to.
type GRPCGrafanaAPIServer struct {
	Impl GrafanaAPI
}

func (m *GRPCGrafanaAPIServer) QueryDatasource(ctx context.Context, req *QueryDatasourceRequest) (*QueryDatasourceResponse, error) {
	resp, err := m.Impl.QueryDatasource(ctx, req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
