import * as Plottable from 'plottable';
import { CategoricChart } from '../factories/categoric';
import { createLineChart } from '../factories/categoric/line';
import { CategoryAxis } from './full-stacked-bar';

/**
 * @typedef {LinearCategoryChart} StackedArea
 * @public
 * @property {'stacked-area'} type
 *
 */
export interface LinearAxis {
  showAxis: boolean;
  showGridlines: boolean;
  axisLabel: string;
  indicator: string;
}
export interface CategoryAxis {
  showAxis: boolean;
  axisLabel: string;
  indicator: string;
}
export interface Config {
  type: 'stacked-area';
  title: string;
  groupBy: string;
  colors: string[];
  linearAxis: LinearAxis;
  categoryAxis: CategoryAxis;

}
export default (element, data, config: Config): CategoricChart => {
  const plot = new Plottable.Plots.StackedArea();

  const chart = createLineChart(element, plot, config);

  chart.update(data);

  return chart;
};
