import Plottable from 'plottable';
import createBarChart from '../factories/categoric/bar';
import { createFullStackedDataset } from '../factories/dataset/index';

/**
 * @typedef {LinearCategoryChart} FullStackedBar
 * @public
 * @property {'full-stacked-bar'} type
 *
 */
export default (element, data, config) => {
  const { orientation, linearAxis } = config;

  const plot = new Plottable.Plots.StackedBar(orientation);

  const linearChart = createBarChart(element, plot, {
    ...config,
    linearAxis: {
      ...linearAxis,

      axisMaximum: 100,
      axisMinimum: 0,
    },
  });

  const update = data =>
    linearChart.update(createFullStackedDataset(data, config.linearAxis.indicator, config.categoryAxis.indicator), );

  const chart = {
    ...linearChart,

    update,
  };

  chart.update(data);

  return chart;
};
