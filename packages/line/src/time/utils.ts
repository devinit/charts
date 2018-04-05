
import {Components, Scales, Plot, Component} from 'plottable';

export interface CreateTimePlotConfig {
  plot: Plot;
  timeScale: Scales.Time;
  linearScale: Scales.Linear;
}

export const createTimePlot = (opts) => {
  const { plot, timeScale, linearScale } = opts;
  return plot
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .x(d => new Date(d.label.toString()), timeScale)
    .y(d => d.value, linearScale);
};

export interface CreatePlotAreaWithAxesConfig {
  linearAxis: Component;
  plotArea: Component;
  categoryAxis: Component;
  anchor: Component;
}

export const createPlotAreaWithAxes = (config) => {
  const {
    linearAxis,
    plotArea,
    categoryAxis,
    anchor
  } = config;

  const table = new Components.Table([
    [null, null, null],
    [linearAxis, plotArea, null],
    [null, categoryAxis, null],
  ]);

  if (anchor) {
    table.rowWeight(0, 1);
  }

  table.rowWeight(1, 3);

  return table;
};
