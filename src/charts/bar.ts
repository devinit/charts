import * as Plottable from 'plottable';
import {CategoricChart} from '../factories/categoric';
import createBarChart from '../factories/categoric/bar';

/**
 * @typedef {LinearCategoryChart} Bar
 * @public
 * @property {'bar'} type
 *
 */
export default (element, data, config): CategoricChart => {
  const { orientation } = config;

  const plot = new Plottable.Plots.Bar(orientation);

  // ... apply bar configuration

  const chart = createBarChart(element, plot, config);

  chart.update(data);

  return chart;
};
