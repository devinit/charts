import {Plots} from 'plottable';
import createTimePlot, { Config, TimeChart } from './time';

export default (element, data: any[], config: Config): TimeChart => {
  const plot = new Plots.StackedArea();

  const chart = createTimePlot( element, plot, config);

  chart.update(data);

  return chart;
};
