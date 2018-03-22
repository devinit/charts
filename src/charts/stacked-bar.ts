import * as Plottable from 'plottable';
import { CategoricChart } from '../factories/categoric';
import createBarChart from '../factories/categoric/bar';

/**
 * @typedef {LinearCategoryChart} StackedBar
 * @public
 * @property {'stacked-bar'} type
 *
 */
export default (element, data, { orientation, ...config }): CategoricChart => {
  const plot = new Plottable.Plots.StackedBar(orientation);

  const chart = createBarChart(element, plot, config);

  chart.update(data);

  return chart;
};
