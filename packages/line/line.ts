import * as Plottable from 'plottable';
import { CategoricChart } from '../factories/categoric';
import { createLineChart } from '../factories/categoric/line';

/**
 * @typedef {LinearCategoryChart} Line
 * @public
 * @property {'line'} type
 *
 */
export interface Config {
  type: 'timeline';
  groupBy: string;
  title: string;
  colors: string[];
  coloring: string;
  linearAxis: any;
  timeAxis: any;
  legend: any;
}
export default (element: HTMLElement, data, config: Config): CategoricChart => {
  const plot = new Plottable.Plots.Line();

  const linearChart = createLineChart(element, plot, config);

  linearChart.update(data);

  return linearChart;
};
