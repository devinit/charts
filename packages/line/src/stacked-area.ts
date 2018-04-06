import {Plots} from 'plottable';
import {CategoricChart} from '@devinit-charts/core/lib/categoric';
import { createLineChart,  Config} from './categoric';

/**
 * @typedef {LinearCategoryChart} StackedArea
 * @public
 * @property {'stacked-area'} type
 *
 */

export default (element: HTMLElement, data: any[], config: Config): CategoricChart => {
  const plot = new Plots.StackedArea();

  const chart = createLineChart(element, plot, config);

  chart.update(data);

  return chart;
};
