import Plottable from "plottable";
import {createLinearChart} from "../factories/createLinearChart";
import {createFullStackedDataset} from "../factories/createDataset";

/**
 * @typedef {LinearCategoryChart} FullStackedBar
 * @public
 * @property {'full-stacked-bar'} type
 *
 */
export default (element, data, config) => {

  const { orientation, linearAxis = {}, ...more } = config;

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

      ...more
    }
  });

  const chart = {

    ...linearChart,

    addData: data => linearChart.addData(data, createFullStackedDataset),
  };

  chart.addData(data);

  return chart
};