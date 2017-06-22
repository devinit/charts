import Plottable from "plottable";
import createTimePlot from "../factories/createTimeChart"

export default (element, data, config) => {

  const plot = new Plottable.Plots.Line();

  const chart = createTimePlot({element, plot, config});

  chart.addData(data);

  return chart;

};