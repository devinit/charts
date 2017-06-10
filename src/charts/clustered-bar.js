import Plottable from "plottable";
import { createLinearChart } from '../factories/createLinearChart'

/**
 * @typedef {LinearCategoryChart} ClusteredBar
 * @public
 * @property {'clustered-bar'} type
 *
 */
export default (element, data, config) => {

  const plot = new Plottable.Plots.ClusteredBar(config.orientation);

  const chart = createLinearChart({element, plot, config});

  chart.addData(data);

  return chart
};