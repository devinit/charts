import Plottable from 'plottable';
import createTimePlot from '../factories/time';

export default (element, data, config) => {
  const plot = new Plottable.Plots.StackedArea();

  const chart = createTimePlot({ element, plot, config });

  chart.update(data);

  return chart;
};
