import Plottable from 'plottable';

export const createCircularPlot = (config) => {
  const {
    plot,
    innerRadius = 0,
    strokeColor = '#fff',
    strokeWidth = 0,
  } = config;

  const innerRadiusScale = new Plottable.Scales.Linear();

  innerRadiusScale.domain([0, 100]);

  return plot
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .attr('style', `stroke: ${strokeColor}; stroke-width: ${strokeWidth}`)
    .sectorValue(d => d.value)
    .innerRadius(d => d.innerRadius || innerRadius, innerRadiusScale);
};