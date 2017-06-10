import Plottable from "plottable";
import createCircularChart from '../factories/createCircularChart'

/**
 * @typedef {CircularChart} Pie
 * @public
 * @property {'pie'} type
 *
 */
export default (element, data, config) => {

  const plot = new Plottable.Plots.Pie();

  const chart  = createCircularChart({element, plot, config});

  chart.addData(data);

  return chart;

};