import Plottable from "plottable";
import createCircularChart from '../factories/createCircularChart'

export default ({element, data, config}) => {

  const plot = new Plottable.Plots.Pie();

  const chart  = createCircularChart({element, plot, config});

  chart.addData(data);

  return chart;

};