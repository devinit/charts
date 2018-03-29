import * as Plottable from 'plottable';
import createTimePlot from '../factories/time';

export interface LinearAxis  {
  showAxis: boolean;
  showGridlines: boolean;
  indicator: string;
  axisMargin: number;
  axisMinimum: number;
  ticking: string;
}
export interface TimeAxis  {
  showAxis: boolean;
  indicator: string;
  axisLabel: string;
  ticking: string;
  tickingStep: number;
  axisMargin: number;
  axisMinimum: number;
  axisMaximum: number;
}
export interface Time {
  interpolate: boolean;
}
export interface Anchor {
  start: number;
}
export interface Legend {
  showLegend: boolean;
}
export interface Config {
    type: 'timearea';
    groupBy: string;
    colors: string[];
    coloring: string;
    linearAxis: LinearAxis;
    timeAxis: TimeAxis;
    time: Time;
    anchor: Anchor;
    legend: Legend;
}
export default (element, data: any, config: Config) => {
  const plot = new Plottable.Plots.Line();

  const chart = createTimePlot(element, plot, config);

  chart.update(data);

  return chart;
};
