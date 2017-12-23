package main

import (
	"github.com/grafana/grafana/pkg/components/null"
)

type TargetResponseDTO struct {
	Target     string           `json:"target"`
	DataPoints TimeSeriesPoints `json:"datapoints"`
}

type TimePoint [2]null.Float
type TimeSeriesPoints []TimePoint
