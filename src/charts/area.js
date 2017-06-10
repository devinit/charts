import Plottable from "plottable";
import {createLineChart} from "./line";

/**
 * @typedef {LinearCategoryChart} Area
 * @public
 * @property {'area'} type
 *
 */
const area = function (element, data, config) {

  const plot = new Plottable.Plots.Area();

  // ... apply area configuration

  const chart = createLineChart(element, plot, config);

  chart.addData(data);

  return chart
};

export default area;