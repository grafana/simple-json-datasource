package main

import (
	"net/http"

	simplejson "github.com/bitly/go-simplejson"
)

type TargetResponseDTO struct {
	Target     string           `json:"target,omitempty"`
	DataPoints TimeSeriesPoints `json:"datapoints,omitempty"`
	Columns    []TableColumn    `json:"columns,omitempty"`
	Rows       []RowValues      `json:"values,omitempty"`
}

type TimePoint [2]float64
type TimeSeriesPoints []TimePoint

type TableColumn struct {
	Text string `json:"text"`
	Type string `json:"type"`
}

type RowValues []interface{}

type remoteDatasourceRequest struct {
	queryType string
	req       *http.Request
	queries   []*simplejson.Json
}
