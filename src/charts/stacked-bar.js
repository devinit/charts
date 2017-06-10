import Plottable from "plottable";
import {createLinearChart} from "../factories/createLinearChart";

/**
 * @typedef {LinearCategoryChart} StackedBar
 * @public
 * @property {'stacked-bar'} type
 *
 */
export default (element, data, {orientation, ...config}) => {

  const plot = new Plottable.Plots.StackedBar(orientation);

  const chart = createLinearChart({element, plot, config: {orientation, ...config}});

  chart.addData(data);

  return chart
};