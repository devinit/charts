import * as Plottable from 'plottable';
import createBarChart, {Config} from './categoric';
import { CategoricChart } from '@devinit-charts/core/lib/categoric';

export default (element, data, config: Config): CategoricChart => {
  const { orientation } = config;

  const plot = new Plottable.Plots.Bar(orientation);

  const chart = createBarChart(element, plot, config);

  chart.update(data);

  return chart;
};
