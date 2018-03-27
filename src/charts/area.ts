import * as Plottable from 'plottable';
import { CategoricChart} from '../factories/categoric';
import { createLineChart} from '../factories/categoric/line';

/**
 * @typedef {LinearCategoryChart} Area
 * @public
 * @property {'area'} type
 *
 */
export interface CategoryAxis {
  showAxis: boolean;
  showGridlines: boolean;
  axisLabel: string;
  indicator: string;
}
export interface LinearAxis  {
  showAxis: boolean;
  showGridlines: boolean;
  indicator: string;
  axisLabel: string;
}
export interface Config {
  type: 'area';
  title: string;
  colors: string[];
  linearAxis: LinearAxis;
  categoryAxis: CategoryAxis;
}
const area = (element: HTMLElement, data: any, config: Config): CategoricChart => {
  const plot = new Plottable.Plots.Area();

  // ... apply area configuration

  const chart = createLineChart(element, plot, config);

  chart.update(data);

  return chart;
};

export default area;
