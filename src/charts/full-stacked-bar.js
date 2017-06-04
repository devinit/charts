import Plottable from "plottable";
import {createLinearChart} from "../factories/createLinearChart";
import {createFullStackedDataset} from "../factories/createDataset";

export default ({element, data, config: {orientation, linearAxis = {}, ...config}}) => {

  const plot = new Plottable.Plots.StackedBar(orientation);

  const linearChart = createLinearChart({
    element,
    plot,
    config: {
      orientation,

      linearAxis: {
        axisMaximum: 100,
        axisMinimum: 0,

        ...linearAxis,
      },

      ...config
    }
  });

  const chart = {

    ...linearChart,

    addData: data => linearChart.addData(createFullStackedDataset(data)),
  };

  chart.addData(data);

  return chart
};