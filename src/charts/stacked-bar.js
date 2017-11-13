import Plottable from 'plottable';
import createBarChart from '../factories/categoric/bar';

/**
 * @typedef {LinearCategoryChart} StackedBar
 * @public
 * @property {'stacked-bar'} type
 *
 */
export default (element, data, { orientation, ...config }) => {
  const plot = new Plottable.Plots.StackedBar(orientation);

  const chart = createBarChart(element, plot, config);

  chart.update(data);

  return chart;
};
