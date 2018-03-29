import * as Plottable from 'plottable';
import createCircularChart from '../factories/circular';

/**
 * @typedef {CircularChart} Pie
 * @public
 * @property {'pie'} type
 *
 */
export interface Circular {
  label: string;
  value: string;
  strokeWidth: number;
}
export interface Labeling {
  suffix: string;
  showLabels: boolean;
  prefix: any;
}
export interface Legend {
  showLegend: boolean;
  position: string;
  alignment: string;
}
export interface Config {
  type: 'pie';
  title: string;
  titleAlignment: string;
  colors: string[];
  coloring: string;
  circular: Circular;
  labeling: Labeling;
  legend: Legend;
}
export default (element: HTMLElement, data: any, config: Config) => {
  const plot = new Plottable.Plots.Pie();

  const chart = createCircularChart(element, plot, config);

  chart.update(data);

  return chart;
};
