import * as Plottable from 'plottable';
import {CategoricChart} from '../factories/categoric';
import createBarChart from '../factories/categoric/bar';

/**
 * @typedef {LinearCategoryChart} ClusteredBar
 * @public
 * @property {'clustered-bar'} type
 *
 */
export interface LinearAxis {
  showAxis: boolean;
  axisLabel: string;
  indicator: string;
  innerPadding: number;
  outerPadding: number;
}
export interface CategoryAxis {
  showAxis: boolean;
  axisLabel: string;
  indicator: string;
  innerPadding: number;
  outerPadding: number;
}
export interface Config {
  orientation: any;
  title: string;
  type: 'clustered-bar';
  groupBy: string;
  colors: string[];
  linearAxis: LinearAxis;
  categoryAxis: CategoryAxis;
}
export default (element, data, config: Config): CategoricChart => {
  const plot = new Plottable.Plots.ClusteredBar(config.orientation);

  const chart = createBarChart(element, plot, config);

  chart.update(data);

  return chart;
};
