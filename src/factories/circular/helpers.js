import Plottable from 'plottable';
import approximate from '../approximate/index';

export const createCircularPlot = (config) => {
  const {
    plot,
    innerRadius = 0,
    strokeColor = '#fff',
    showLabels,
    prefix = ' ',
    suffix = ' ',
    strokeWidth = 0,
  } = config;

  const innerRadiusScale = new Plottable.Scales.Linear();

  innerRadiusScale.domain([0, 100]);

  if (showLabels) {
    plot.labelsEnabled(showLabels)
      .labelFormatter(d => `${prefix && prefix}${approximate(d)}${suffix && suffix}`);
  }


  return plot
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .attr('style', `stroke: ${strokeColor}; stroke-width: ${strokeWidth}`)
    .sectorValue(d => d.value)
    .innerRadius(d => d.innerRadius || innerRadius, innerRadiusScale);
};
