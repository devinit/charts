import * as Plottable from 'plottable';
import { CategoricChart } from '@devinit-charts/core/lib/categoric';
import createBarChart, {Config} from './categoric';

export default (element: HTMLElement, data: any[], config: Config): CategoricChart => {

  const { orientation } = config;

  const plot = new Plottable.Plots.StackedBar(orientation);

  const chart = createBarChart(element, plot, config);

  chart.update(data);

  return chart;
};
