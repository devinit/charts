import Plottable from 'plottable';

export const createScatterPlot = ({
  plot, horizontalScale, verticalScale, bubbleScale, idIndicator
}) => {
  plot
    .attr('name', d => d.z)
    .attr('fill', d => d.color)
    .attr('stroke', 'rgb(51, 51, 51)')
    .attr('stroke-width', 2)
    .attr('opacity', 0.8)
    .x(d => d.x, horizontalScale)
    .y(d => d.y, verticalScale)
    .size(d => d.z, bubbleScale);

  if (idIndicator) {
    plot.attr('id', d => `bubble-${d[idIndicator]}`);
  }

  return plot;
};

export const createPlotAreaWithAxes = ({ horizontalAxis, plotArea, verticalAxis }) => {
  const plotAreaWithAxes = [[verticalAxis, plotArea], [null, horizontalAxis]];

  return new Plottable.Components.Table(plotAreaWithAxes);
};
