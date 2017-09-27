import Plottable from 'plottable';
import createCircularChart from '../factories/circular/index';

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
