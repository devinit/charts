import {Plots} from 'plottable';
import {CategoricChart} from '@devinit-charts/core/lib/categoric';
import { createLineChart,  Config} from './categoric';
import { createFullStackedDataset } from '@devinit-charts/core/lib/dataset';

/**
 * @typedef {LinearCategoryChart} FullStackedArea
 * @public
 * @property {'full-stacked-area'} type
 *
 */

export default (element: HTMLElement, data: any[], config: Config): CategoricChart => {
  const { linearAxis } = config;
  const plot = new Plots.StackedArea();

  const linearChart = createLineChart(element, plot, {
    ...config,
    linearAxis: {
      axisMaximum: 100,
      axisMinimum: 0,
      ...linearAxis,
    }
  });

  const update = _data =>
    linearChart
      .update(createFullStackedDataset(_data, config.linearAxis.indicator, config.categoryAxis.indicator));

  const chart = {
    ...linearChart,

    update,
  };

  chart.update(data);

  return chart;
};
