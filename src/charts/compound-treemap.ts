import * as Plottable from 'plottable';
import { treemap } from 'd3';
import { createTreeHierachy } from '../factories/dataset';
import {approximate} from '@devinit/prelude/lib/numbers';
import getTilingMethod from './treemap/tiling';
import { createColorFiller } from '../factories/tree';

/**
 * @typedef {TreeChart} CompoundTreemap
 * @private
 * @property {'compound-treemap'} type
 *
 */
export interface Tree {
  id: string;
  parent: string;
  value: string;
  depth: 'Infinity';
}
export interface Config {
  title?: any;
  orientation: string;
  titleAlignment: any;
  colors: any;
  coloring?: any;
  tree: Tree;
}
export default (element, data, config: Config) => {

  // ... apply rectangle configuration
  const {
    title = null,

    orientation = 'vertical',

    titleAlignment = 'left',

    tree = {
      id: 'id',
      parent: 'parent',
      value: 'value',
      depth: Infinity,
    },

    // ...
  } = config;
  const xScale = new Plottable.Scales.Linear();
  xScale.domainMin(0);
  xScale.domainMax(1);

  const yScale = new Plottable.Scales.Linear();
  yScale.domainMin(0);
  yScale.domainMax(1);

  const summaryYScale = new Plottable.Scales.Linear();
  yScale.domainMin(0);
  yScale.domainMax(1);

  const x = orientation === 'vertical' ? 'x' : 'y';
  const y = orientation === 'horizontal' ? 'x' : 'y';

  // tslint:disable-next-line:no-shadowed-variable
  const createPlot = (plot, xScale, yScale) =>
    plot
      .x(d => d[`${x}0`], xScale)
      .y(d => d[`${y}0`], yScale)
      .x2(d => d[`${x}1`], xScale)
      .y2(d => d[`${y}1`], yScale)
      .attr('fill', d => d.color)
      .attr('stroke', () => '#fff')
      .attr('stroke-width', () => 1)
      .labelsEnabled(true)
      .label(d => `${d.data.label} - ${approximate(d.value)}`);

  const plot = createPlot(new Plottable.Plots.Rectangle(), xScale, yScale);

  const summaryPlot = createPlot(new Plottable.Plots.Rectangle(), xScale, summaryYScale);

  const titleLabel = new Plottable.Components.TitleLabel(title, 0)
    .xAlignment(titleAlignment)
    .yAlignment('top');

  const table = new Plottable.Components.Table([[titleLabel], [summaryPlot], [plot]]);

  table.rowPadding(20);
  table.rowWeight(1, 1);
  table.rowWeight(2, 2);

  table.renderTo(element);

  const tilingMethod = getTilingMethod({method: 'sliceDice'});

  const layout = treemap().tile(tilingMethod);

  const colorize = createColorFiller(config.colors, config.coloring);

  const update = _data => {
    const root = colorize(createTreeHierachy(_data, tree));

    const rectangles = layout(root).descendants();

    const all = rectangles.filter(d => d.depth <= 2);

    plot.datasets([new Plottable.Dataset(all)]);

    const summary = rectangles.filter(d => d.depth === 1);

    summaryPlot.datasets([new Plottable.Dataset(summary)]);
  };
  const chart = {
    table,

    update,

    destroy: () => {
      table.destroy();
    },
  };

  chart.update(data);

  return chart;
};
