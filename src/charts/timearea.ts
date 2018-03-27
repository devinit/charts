import * as Plottable from 'plottable';
import createTimePlot from '../factories/time';

export interface Suffix  {
  suffix: string;
}
export interface LinearAxis  {
  showAxis: boolean;
  indicator: string;
  axisMargin: number;
  ticking: string;
  suffix: string;
}
export interface TimeAxis  {
  showAxis: boolean;
  indicator: string;
  axisMargin: number;
  ticking: string;
  tickingStep: number;
  axisMinimum: number;
  axisMaximum: number;
}
export interface Time  {
  interpolate: boolean;
}
export interface Config {
  type: 'timearea';
  title: string;
  colors: string[];
  labeling: Suffix;
  linearAxis: LinearAxis;
  timeAxis: TimeAxis;
  time: Time;
}
export default (element: HTMLElement, data: any, config: Config) => {
  const plot = new Plottable.Plots.Area();

  const chart = createTimePlot({ element, plot, config });

  chart.update(data);

  return chart;
};
