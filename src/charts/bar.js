import Plottable from "plottable";
import createBarChart from "../factories/createBarChart";

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

  const chart = createBarChart(element, plot, config);

  chart.update(data);

  return chart
};