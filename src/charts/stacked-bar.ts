import * as Plottable from 'plottable';
import { CategoricChart } from '../factories/categoric';
import createBarChart from '../factories/categoric/bar';

/**
 * @typedef {LinearCategoryChart} StackedBar
 * @public
 * @property {'stacked-bar'} type
 *
 */
export interface Labeling {
  custom: boolean;
  prefix: string;
  drawStackedBarSum: boolean;
  showLabels: boolean;
}
export interface LinearAxis {
  showAxis: boolean;
  showGridlines: boolean;
  axisLabel: string;
  indicator: string;
}
export interface CategoryAxis {
  showAxis: boolean;
  showGridlines: boolean;
  axisLabel: string;
  indicator: string;
}
export interface Config {
  orientation: any;
  type: 'stacked-bar';
  groupyBy: string;
  colors: string[];
  labeling: Labeling;
  linearAxis: LinearAxis;
  categoryAxis: CategoryAxis;
}
export default (element, data, config: Config): CategoricChart => {
  const plot = new Plottable.Plots.StackedBar(config.orientation);

  const chart = createBarChart(element, plot, config);

  chart.update(data);

  return chart;
};
