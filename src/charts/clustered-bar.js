import Plottable from "plottable";
import { createLinearChart } from '../factories/createLinearChart'

export default ({element, data, config: {orientation, ...config}}) => {

  const plot = new Plottable.Plots.ClusteredBar(orientation);

  const chart = createLinearChart({element, plot, config: {orientation, ...config}});

  chart.addData(data);

  return chart
};