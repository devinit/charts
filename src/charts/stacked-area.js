import Plottable from 'plottable';
import { createLineChart } from '../factories/categoric/line';

/**
 * @typedef {LinearCategoryChart} StackedArea
 * @public
 * @property {'stacked-area'} type
 *
 */
export default (element, data, config) => {
  const plot = new Plottable.Plots.StackedArea();

  const chart = createLineChart(element, plot, config);

  chart.update(data);

  return chart;
};
