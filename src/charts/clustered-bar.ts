import * as Plottable from 'plottable';
import {CategoricChart} from '../factories/categoric';
import createBarChart from '../factories/categoric/bar';

/**
 * @typedef {LinearCategoryChart} ClusteredBar
 * @public
 * @property {'clustered-bar'} type
 *
 */
export default (element, data, config): CategoricChart => {
  const plot = new Plottable.Plots.ClusteredBar(config.orientation);

  const chart = createBarChart(element, plot, config);

  chart.update(data);

  return chart;
};
