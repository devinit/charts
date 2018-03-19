import * as Plottable from 'plottable';
import createCircularChart from '../factories/circular';

/**
 * @typedef {CircularChart} Pie
 * @public
 * @property {'pie'} type
 *
 */
export default (element, data, config) => {
  const plot = new Plottable.Plots.Pie();

  const chart = createCircularChart({ element, plot, config });

  chart.update(data);

  return chart;
};
