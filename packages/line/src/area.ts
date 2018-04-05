import { Plots } from 'plottable';
import { CategoricChart} from '@devinit-charts/core/lib/categoric';
import { createLineChart,  Config} from './categoric';

/**
 * @typedef {LinearCategoryChart} Area
 * @public
 * @property {'area'} type
 *
 */

const area = (element: HTMLElement, data: any, config: Config): CategoricChart => {
  const plot = new Plots.Area();

  // ... apply area configuration

  const chart = createLineChart(element, plot, config);

  chart.update(data);

  return chart;
};

export default area;
