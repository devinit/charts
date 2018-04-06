import {Plots} from 'plottable';
import createTimePlot, { Config, TimeChart } from './time';

export default (element: string, data: any, config: Config): TimeChart => {
  const plot = new Plots.Area();

  const chart = createTimePlot(element, plot, config);

  chart.update(data);

  return chart;
};
