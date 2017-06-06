import Plottable from "plottable";
import {createLineChart} from "./line";

export default ({element, data, config}) => {

  const plot = new Plottable.Plots.StackedArea();

  const chart = createLineChart(element, plot, config);

  chart.addData(data);

  return chart
};