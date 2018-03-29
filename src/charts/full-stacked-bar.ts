import * as Plottable from 'plottable';
import createBarChart from '../factories/categoric/bar';
import { createFullStackedDataset } from '../factories/dataset';

/**
 * @typedef {LinearCategoryChart} FullStackedBar
 * @public
 * @property {'full-stacked-bar'} type
 *
 */
export interface Labeling {
  suffix: string;
}
export interface LinearAxis  {
  showAxis: boolean;
  showGridlines: boolean;
  innerPadding: number;
  outerPadding: number;
  indicator: string;
}
export interface CategoryAxis {
  showAxis: boolean;
  axisLabel: string;
  indicator: string;
  innerPadding: number;
  outerPadding: number;
}
export interface Config {
  title: string;
  type: 'bar';
  linearAxis: LinearAxis;
  categoryAxis: CategoryAxis;
  labeling: Labeling;
  orientation: any;
}
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
    linearChart.update(createFullStackedDataset(_data, linearAxis.indicator, config.categoryAxis.indicator), );

  const chart = {
    ...linearChart,

    update,
  };

  chart.update(data);

  return chart;
};
