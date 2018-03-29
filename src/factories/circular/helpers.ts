import * as Plottable from 'plottable';
import {approximate} from '@devinit/prelude/lib/numbers';

export interface Config {
  plot: any;
  labeling: any;
  innerRadius: number;
  strokeColor: string;
  strokeWidth: number;
}
export const createCircularPlot = (config: Config): Plottable.Plot => {
  const {
    plot,
    labeling,
    innerRadius = 0,
    strokeColor = '#fff',
    strokeWidth = 0,
  } = config;

  const innerRadiusScale = new Plottable.Scales.Linear();

  innerRadiusScale.domain([0, 100]);

  if (labeling && labeling.showLabels) {
    plot.labelsEnabled(labeling.showLabels)
      .labelFormatter(d => `${labeling.prefix || ''}${approximate(d)}${labeling.suffix || ' '}`);
  }

  return plot
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .attr('style', `stroke: ${strokeColor}; stroke-width: ${strokeWidth}`)
    .sectorValue(d => d.value)
    .innerRadius(d => d.innerRadius || innerRadius, innerRadiusScale);
};
