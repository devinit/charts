import * as Plottable from 'plottable';
import createCircularChart, {Config} from './circular';

/**
 * @typedef {CircularChart} Pie
 * @public
 * @property {'pie'} type
 *
 */

export default (element: HTMLElement, data: any, config: Config) => {
  const plot = new Plottable.Plots.Pie();

  const chart = createCircularChart(element, plot, config);

  chart.update(data);

  return chart;
};
