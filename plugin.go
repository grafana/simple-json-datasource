package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/golang/glog"
	"golang.org/x/net/context"

	"log"

	proto "github.com/grafana/grafana/pkg/tsdb/models"
	shared "github.com/grafana/grafana/pkg/tsdb/models/proxy"
	plugin "github.com/hashicorp/go-plugin"
)

type Tsdb struct {
	plugin.NetRPCUnsupportedPlugin
}

func (t *Tsdb) Query(ctx context.Context, tsdbReq *proto.TsdbQuery) (*proto.Response, error) {
	log.Print("Tsdb.Get() from plugin")

	url := tsdbReq.Datasource.Url + "/query"

	postBody := `
		{
			"timezone":"browser",
			"panelId":1,
			"range": {"from":"2017-12-15T09:53:37.485Z","to":"2017-12-15T15:53:37.485Z","raw":{"from":"now-6h","to":"now"}},
			"rangeRaw":{"from":"now-6h","to":"now"},
			"interval":"20s",
			"intervalMs":20000,
			"targets":[{"target":"upper_25","refId":"A","type":"timeserie"}],
			"maxDataPoints":1133,"scopedVars":{"__interval":{"text":"20s","value":"20s"},"__interval_ms":{"text":20000,"value":20000}}
	}`

	req, err := http.NewRequest(http.MethodPost, url, strings.NewReader(postBody))
	if err != nil {
		return nil, err
	}

	req.Header.Add("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid status code. error: %v", err)
	}

	body, err := ioutil.ReadAll(res.Body)
	defer res.Body.Close()
	if err != nil {
		return nil, err
	}

	ts := []*proto.TimeSeries{}
	err = json.Unmarshal(body, &ts)
	if err != nil {
		glog.Info("Failed to unmarshal graphite response", "error", err, "status", res.Status, "body", string(body))
		return nil, err
	}

	return &proto.Response{
		Message: "from plugins! meta meta",
		Results: []*proto.QueryResult{
			&proto.QueryResult{
				RefId:  "A",
				Series: ts,
			},
		},
	}, nil
}

func main() {

	plugin.Serve(&plugin.ServeConfig{

		HandshakeConfig: plugin.HandshakeConfig{
			ProtocolVersion:  1,
			MagicCookieKey:   "GRAFANA_BACKEND_DATASOURCE",
			MagicCookieValue: "55d2200a-6492-493a-9353-73b728d468aa",
		},
		Plugins: map[string]plugin.Plugin{
			"backend-datasource": &shared.TsdbPluginImpl{Plugin: &Tsdb{}},
		},

		// A non-nil value here enables gRPC serving for this plugin...
		GRPCServer: plugin.DefaultGRPCServer,
	})
}
