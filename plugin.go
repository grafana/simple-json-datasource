package main

import (
	"encoding/json"
	"fmt"
	"github.com/grafana/grafana/pkg/components/simplejson"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

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
	log.Println("from plugins!")

	response := &proto.Response{
		Message: fmt.Sprintf("result from datasource name: %s id: %d", tsdbReq.Datasource.Name, tsdbReq.Datasource.Id),
		Results: map[string]*proto.QueryResult{},
	}

	payload := simplejson.New()
	payload.SetPath([]string{"range", "to"}, tsdbReq.Timerange.To)
	payload.SetPath([]string{"range", "from"}, tsdbReq.Timerange.From)

	qs := []interface{}{}
	for _, query := range tsdbReq.Queries {
		json, err := simplejson.NewJson([]byte(query.ModelJson))
		if err != nil {
			return nil, err
		}

		for _, targetObj := range json.Get("targets").MustArray() {
			qs = append(qs, simplejson.NewFromAny(targetObj))
		}
	}
	payload.Set("targets", qs)

	rbody, err := payload.MarshalJSON()
	if err != nil {
		log.Fatalln("error", err)
		return nil, err
	}

	url := tsdbReq.Datasource.Url + "/query"
	req, err := http.NewRequest(http.MethodPost, url, strings.NewReader(string(rbody)))
	if err != nil {
		return nil, err
	}

	if tsdbReq.Datasource.BasicAuth {
		req.SetBasicAuth(tsdbReq.Datasource.BasicAuthUser, tsdbReq.Datasource.BasicAuthPassword)
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

	r, err := parseResponse(body, "A")
	if err != nil {
		return nil, err
	}

	response.Results["A"] = r

	return response, nil
}

func parseResponse(body []byte, refId string) (*proto.QueryResult, error) {
	responseBody := []TargetResponseDTO{}
	err := json.Unmarshal(body, &responseBody)
	if err != nil {
		log.Println("Failed to unmarshal json response", "error", err, "body", string(body))
		return nil, err
	}

	series := []*proto.TimeSeries{}
	for _, r := range responseBody {
		serie := &proto.TimeSeries{
			Name: r.Target,
		}

		for _, p := range r.DataPoints {
			serie.Points = append(serie.Points, &proto.Point{
				Timestamp: int64(p[1].Float64),
				Value:     p[0].Float64,
			})
		}

		series = append(series, serie)
	}

	return &proto.QueryResult{
		Series: series,
		RefId:  refId,
	}, nil
}

func main() {
	// the plugin sends logs to the host process on strErr
	log.SetOutput(os.Stderr)

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
