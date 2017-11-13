import Plottable from 'plottable';
import { createLineChart } from '../factories/categoric/line';

/**
 * @typedef {LinearCategoryChart} Line
 * @public
 * @property {'line'} type
 *
 */
export default (element, data, config) => {
  const plot = new Plottable.Plots.Line();

  const linearChart = createLineChart(element, plot, config);

  linearChart.update(data);

  return linearChart;
};
