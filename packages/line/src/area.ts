import * as Plottable from 'plottable';
import { CategoricChart} from '@devinit-charts/core/lib/categoric';
import { createLineChart} from './categoric/line';

/**
 * @typedef {LinearCategoryChart} Area
 * @public
 * @property {'area'} type
 *
 */

export interface Config {
  type: 'area';
  title: string;
  colors: string[];
  linearAxis: LinearAxis;
  categoryAxis: CategoryAxis;
  tooltips: any;
  labeling: any;
}
const area = (element: HTMLElement, data: any, config: Config): CategoricChart => {
  const plot = new Plottable.Plots.Area();

  // ... apply area configuration

  const chart = createLineChart(element, plot, config);

  chart.update(data);

  return chart;
};

export default area;
