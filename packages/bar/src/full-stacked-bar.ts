import * as Plottable from 'plottable';
import createBarChart, {Config} from './categoric';
import { createFullStackedDataset } from '@devinit-charts/core/lib/dataset';

/**
 * @typedef {LinearCategoryChart} FullStackedBar
 * @public
 * @property {'full-stacked-bar'} type
 *
 */

export default (element, data, config: Config) => {
  const { orientation, linearAxis } = config;
  const plot = new Plottable.Plots.StackedBar(orientation);

  const linearChart = createBarChart(element, plot, {
    ...config,
    linearAxis: {
      ...config.linearAxis,

      axisMaximum: 100,
      axisMinimum: 0,
    },
  });

  const update = _data =>
    linearChart.update(createFullStackedDataset(_data, linearAxis.indicator, config.categoryAxis.indicator));

  const chart = {
    ...linearChart,

    update,
  };

  chart.update(data);

  return chart;
};
