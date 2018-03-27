import * as Plottable from 'plottable';
import { createLineChart } from '../factories/categoric/line';
import { createFullStackedDataset } from '../factories/dataset';

/**
 * @typedef {LinearCategoryChart} FullStackedArea
 * @public
 * @property {'full-stacked-area'} type
 *
 */
export interface LinearAxis  {
  showAxis: boolean;
  showGridlines: boolean;
  indicator: string;
  axisLabel: string;
}
export interface CategoryAxis {
  showAxis: boolean;
  axisLabel: string;
  indicator: string;
}
export interface Legend {
  showLegend: boolean;
  position: string;
  rowSpan: number;
}
export interface Config {
  title: string;
  type: 'full-stacked-area';
  groupBy: string;
  colors: string[];
  linearAxis: LinearAxis;
  categoryAxis: CategoryAxis;
  legend: Legend;
}
export default (element: HTMLElement, data: any, config: Config) => {
  const plot = new Plottable.Plots.StackedArea();

  const linearChart = createLineChart(element, plot, {
    linearAxis: {
      axisMaximum: 100,
      axisMinimum: 0,

      ...config.linearAxis,
    },
    ...config,
  });

  const update = _data =>
    linearChart.update(createFullStackedDataset(_data, config.linearAxis.indicator, config.categoryAxis.indicator), );

  const chart = {
    ...linearChart,

    update,
  };

  chart.update(data);

  return chart;
};
