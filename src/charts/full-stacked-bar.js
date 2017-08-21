import Plottable from "plottable";
import createBarChart from "../factories/createBarChart";
import {createFullStackedDataset} from "../factories/createDataset";

/**
 * @typedef {LinearCategoryChart} FullStackedBar
 * @public
 * @property {'full-stacked-bar'} type
 *
 */
export default (element, data, config) => {

  const { orientation, linearAxis } = config;

  const plot = new Plottable.Plots.StackedBar(orientation);

  const linearChart = createBarChart(
    element,
    plot,
    {
      ...config,
      linearAxis: {
        ...linearAxis,

        axisMaximum: 100,
        axisMinimum: 0,
      }
    }
  );

  const addData = data => linearChart.addData(createFullStackedDataset(
    data,
    config.linearAxis.indicator,
    config.categoryAxis.indicator,
  ));

  const chart = {

    ...linearChart,

    addData,

    update: addData,
  };

  chart.addData(data);

  return chart
};