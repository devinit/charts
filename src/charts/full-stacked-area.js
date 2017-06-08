import Plottable from "plottable";
import {createLineChart} from "./line";
import {createFullStackedDataset} from "../factories/createDataset";

export default ({element, data, config: {linearAxis = {}, ...config}}) => {

  const plot = new Plottable.Plots.StackedArea();

  const linearChart = createLineChart(
    element,
    plot,
    {
      linearAxis: {
        axisMaximum: 100,
        axisMinimum: 0,

        ...linearAxis,
      },
      ...config
    }
  );

  const chart = {

    ...linearChart,

    addData: data => linearChart.addData(data, createFullStackedDataset),
  };

  chart.addData(data);

  return chart;
};