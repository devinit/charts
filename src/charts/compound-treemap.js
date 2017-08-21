import Plottable from "plottable";
import {treemap} from "d3";
import {createTreeHierachy} from "../factories/createDataset";
import approximate from "../factories/approximate";
import {getTilingMethod} from "./treemap";
import {createColorFiller} from "../factories/createTreeChart";

/**
 * @typedef {TreeChart} CompoundTreemap
 * @private
 * @property {'compound-treemap'} type
 *
 */
export default (element, data, config) => {

  const {

    title = null,

    orientation = 'vertical',

    titleAlignment = 'left',

    colors = [],

    coloring = null,

    tree = {
      id: 'id',
      parent: 'parent',
      value: 'value',
      depth: Infinity,
    },

    // Treemap configuration
    treemap: {
      // Tiling algorithm: binary, dice, slice, sliceDice, squarify, resquarify
      tile = 'sliceDice',

    } = {},

    // ...
  } = config;

  // ... apply rectangle configuration

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

  const createPlot = (plot, xScale, yScale) => plot
    .x(d => d[`${x}0`], xScale)
    .y(d => d[`${y}0`], yScale)
    .x2(d => d[`${x}1`], xScale)
    .y2(d => d[`${y}1`], yScale)
    .attr("fill", d => d.color)
    .attr("stroke", d => '#fff')
    .attr("stroke-width", () => 1)
    .labelsEnabled(true)
    .label(d => `${d.data.label} - ${approximate(d.value)}`);

  const plot = createPlot(new Plottable.Plots.Rectangle(), xScale, yScale);

  const summaryPlot = createPlot(new Plottable.Plots.Rectangle(), xScale, summaryYScale);

  const titleLabel = new Plottable.Components.TitleLabel(title, 0)
    .xAlignment(titleAlignment)
    .yAlignment('top');

  const table = new Plottable.Components.Table([
    [titleLabel],
    [summaryPlot],
    [plot],
  ]);

  table.rowPadding(20);
  table.rowWeight(1, 1);
  table.rowWeight(2, 2);

  table.renderTo(element);

  const tilingMethod = getTilingMethod(tile);

  const layout = treemap().tile(tilingMethod);

  const colorize = createColorFiller(colors, [], coloring);

  const addData = data => {

    const root = colorize(createTreeHierachy(data, tree));

    const rectangles = layout(root).descendants();

    const all = rectangles
      .filter(d => d.depth <= 2);

    plot.datasets([new Plottable.Dataset(all)]);

    const summary = rectangles.filter(d => d.depth === 1);

    summaryPlot.datasets([new Plottable.Dataset(summary)]);
  };
  const chart = {

    table,

    addData,

    update: addData,

    destroy: () => {
      table.destroy();
    }

  };

  chart.addData(data, tree);

  return chart
};