package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"strings"
	"time"

	simplejson "github.com/bitly/go-simplejson"
	"golang.org/x/net/context/ctxhttp"

	"golang.org/x/net/context"

	"log"

	"github.com/grafana/grafana_plugin_model/go/datasource"
	plugin "github.com/hashicorp/go-plugin"
)

type JsonDatasource struct {
	plugin.NetRPCUnsupportedPlugin
}

func (t *JsonDatasource) Query(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
	log.Println("from plugins!")

	response := &datasource.DatasourceResponse{}

	req, err := t.createRequest(tsdbReq)
	if err != nil {
		return nil, err
	}

	res, err := ctxhttp.Do(ctx, httpClient, req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid status code. status: %v", res.Status)
	}

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	r, err := parseResponse(body, "A")
	if err != nil {
		return nil, err
	}

	response.Results = append(response.Results, r)

	return response, nil
}

func (t *JsonDatasource) createRequest(tsdbReq *datasource.DatasourceRequest) (*http.Request, error) {
	payload := simplejson.New()
	payload.SetPath([]string{"range", "to"}, tsdbReq.TimeRange.ToRaw)
	payload.SetPath([]string{"range", "from"}, tsdbReq.TimeRange.FromRaw)

	qs := []interface{}{}
	for _, query := range tsdbReq.Queries {
		json, err := simplejson.NewJson([]byte(query.ModelJson))
		if err != nil {
			return nil, err
		}

		qs = append(qs, json)
	}
	payload.Set("targets", qs)

	rbody, err := payload.MarshalJSON()
	if err != nil {
		return nil, err
	}

	url := tsdbReq.Datasource.Url + "/query"
	req, err := http.NewRequest(http.MethodPost, url, strings.NewReader(string(rbody)))
	if err != nil {
		return nil, err
	}

	//if tsdbReq.Datasource.BasicAuth {
	//	req.SetBasicAuth(
	//		tsdbReq.Datasource.BasicAuthUser,
	//		tsdbReq.Datasource.BasicAuthPassword)
	//}

	req.Header.Add("Content-Type", "application/json")

	return req, nil
}

func parseResponse(body []byte, refId string) (*datasource.QueryResult, error) {
	responseBody := []TargetResponseDTO{}
	err := json.Unmarshal(body, &responseBody)
	if err != nil {
		return nil, err
	}

	series := []*datasource.TimeSeries{}
	for _, r := range responseBody {
		serie := &datasource.TimeSeries{Name: r.Target}

		for _, p := range r.DataPoints {
			serie.Points = append(serie.Points, &datasource.Point{
				Timestamp: int64(p[1]),
				Value:     p[0],
			})
		}

		series = append(series, serie)
	}

	return &datasource.QueryResult{
		Series: series,
		RefId:  refId,
	}, nil
}

var httpClient = &http.Client{
	Transport: &http.Transport{
		TLSClientConfig: &tls.Config{
			Renegotiation: tls.RenegotiateFreelyAsClient,
		},
		Proxy: http.ProxyFromEnvironment,
		Dial: (&net.Dialer{
			Timeout:   30 * time.Second,
			KeepAlive: 30 * time.Second,
			DualStack: true,
		}).Dial,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
		MaxIdleConns:          100,
		IdleConnTimeout:       90 * time.Second,
	},
	Timeout: time.Duration(time.Second * 30),
}
