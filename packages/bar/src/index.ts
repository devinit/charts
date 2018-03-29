import * as Plottable from 'plottable';
import {CategoricChart} from '../factories/categoric';
import createBarChart from '../factories/categoric/bar';

/**
 * @typedef {LinearCategoryChart} Bar
 * @public
 * @property {'bar'} type
 */
export interface LinearAxis {
  showAxis: boolean;
  showGridlines: boolean;
  axisLabel: string;
  indicator: string;
  suffix: string;
}
export interface CategoryAxis {
  showAxis: boolean;
  axisLabel: string;
  indicator: string;
  innerPadding: number;
  outerPadding: number;
}
export interface Labeling {
  suffix: string;
}
export interface Config {
  type: 'bar';
  orientation: any;
  colors: string[];
  coloring: string;
  linearAxis: LinearAxis;
  categoryAxis: CategoryAxis;
  labeling: Labeling;
}

export default (element, data, config: Config): CategoricChart => {
  const { orientation } = config;

  const plot = new Plottable.Plots.Bar(orientation);

  // ... apply bar configuration

  const chart = createBarChart(element, plot, config);

  chart.update(data);

  return chart;
};
