
import Plottable from 'plottable';

export const createTimePlot = ({ plot, timeScale, linearScale }) => {
  return plot
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .x(d => new Date(d.label.toString()), timeScale)
    .y(d => d.value, linearScale);
};

export const createPlotAreaWithAxes = (config) => {
  const {
    linearAxis,
    plotArea,
    categoryAxis,
    anchor
  } = config;

  const table = new Plottable.Components.Table([
    [null, null, null],
    [linearAxis, plotArea, null],
    [null, categoryAxis, null],
  ]);

  if (anchor) {
    table.rowWeight(0, 1);
  }

  table.rowWeight(1, 3);

  return table;
};
