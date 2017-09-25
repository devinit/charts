import Plottable from 'plottable';
import createScatterChart from '../factories/scatter';

/**
 * @typedef {ScatterChart} Bubble
 * @public
 * @property {'bubble'} type
 *
 */
export default (element, data, config) => {
  const plot = new Plottable.Plots.Scatter();

  // ... apply scatter configuration

  const chart = createScatterChart({ element, plot, config });

  chart.update(data);

  return chart;
};
