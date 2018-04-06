import * as Plottable from 'plottable';
import { CategoricChart } from '@devinit-charts/core/lib/categoric';
import createBarChart, {Config} from './categoric';

export default (element, data, config: Config): CategoricChart => {
  const plot = new Plottable.Plots.ClusteredBar(config.orientation);

  const chart = createBarChart(element, plot, config);

  chart.update(data);

  return chart;
};
