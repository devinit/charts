import {Plots} from 'plottable';
import {CategoricChart} from '@devinit-charts/core/lib/categoric';
import {createLineChart, Config} from './categoric';

export default (element: HTMLElement, data: any[], config: Config): CategoricChart => {
  const plot = new Plots.Line();

  const linearChart = createLineChart(element, plot, config);

  linearChart.update(data);

  return linearChart;
};
