import Plottable from "plottable";
import treemap from "d3-hierarchy/src/treemap";
import color from "d3-color/src/color";
import stratify from "d3-hierarchy/src/stratify";
import approximate from 'approximate-number'

export default ({
                  element, data, config: {

    title = null,

    orientation = 'vertical',

    titleAlignment = 'left',

    // ... config

    tree = {
      id: 'id',
      parent: 'parent',
      value: 'value',
    },

    // Treemap configuration
    treemap: {
      // Tiling algorithm: binary, dice, slice, sliceDice, squarify, resquarify
      tile = 'sliceDice',

      depth = 2,

    } = {},

    // ...
  }
                }) => {

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
    .attr("fill", d => d.data.color)
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

  const tilingMethod = require(`d3-hierarchy/src/treemap/${tile}.js`);

  const layout = treemap().tile(tilingMethod.default);

  const createTreeHierachy = (series) => {

    const stratifyFactory = stratify()
      .id(d => d.label)
      .parentId(d => d.parent);

    return stratifyFactory(series)
      .sum(d => d.value)
      .sort((b, a) => {
        return a.value - b.value
      });

  };

  const chart = {

    addData: data => {

      const root = createTreeHierachy(data, tree);

      const actualDepth = depth === Infinity ? root.height : depth;

      const rectangles = layout(root).descendants();

      const all = rectangles
        .map(d => {

          d.data.color = !d.data.color && d.parent && d.parent.data.color ?
            color(d.parent.data.color).brighter(d.parent.children.indexOf(d) * 0.4).toString() :
            d.data.color;

          return d;
        })
        .filter(d => d.depth <= actualDepth);

      plot.datasets([new Plottable.Dataset(all)]);

      const summary = rectangles.filter(d => d.depth === 1);

      summaryPlot.datasets([new Plottable.Dataset(summary)]);
    }

  };

  chart.addData(data);

  return chart
};