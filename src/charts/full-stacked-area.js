import Plottable from "plottable";
import {createLineChart} from "./line";
import {createFullStackedDataset} from "../factories/createDataset";

/**
 * @typedef {LinearCategoryChart} FullStackedArea
 * @public
 * @property {'full-stacked-area'} type
 *
 */
export default (element, data, config) => {

  const {linearAxis = {}, ...more} = config;

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
      ...more
    }
  );

  const chart = {

    ...linearChart,

    addData: data => linearChart.addData(data, createFullStackedDataset),
  };

  chart.addData(data);

  return chart;
};