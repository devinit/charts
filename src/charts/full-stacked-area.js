import Plottable from 'plottable';
import { createLineChart } from '../factories/categoric/line';
import { createFullStackedDataset } from '../factories/dataset/index';

/**
 * @typedef {LinearCategoryChart} FullStackedArea
 * @public
 * @property {'full-stacked-area'} type
 *
 */
export default (element, data, config) => {
  const { linearAxis = {}, ...more } = config;

  const plot = new Plottable.Plots.StackedArea();

  const linearChart = createLineChart(element, plot, {
    linearAxis: {
      axisMaximum: 100,
      axisMinimum: 0,

      ...linearAxis,
    },
    ...more,
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
