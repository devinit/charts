import Plottable from "plottable";
import { createLinearChart } from '../factories/createLinearChart'

/**
 * @typedef {LinearCategoryChart} Bar
 * @public
 * @property {'bar'} type
 *
 */
export default (element, data, config) => {

  let {orientation, ...more} = config;

  const plot = new Plottable.Plots.Bar(orientation);

  // ... apply bar configuration

  const chart = createLinearChart({element, plot, config: {orientation, ...more}});

  chart.addData(data);

  return chart
};