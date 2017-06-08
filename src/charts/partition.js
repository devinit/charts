import Plottable from "plottable";
import createTreeChart from "../factories/createTreeChart";
import {createTreeHierachy} from "../factories/createDataset";
import partition from "d3-hierarchy/src/partition";
import color from "d3-color/src/color";

export default ({
  element,
  data = [],
  config: {

    orientation = 'horizontal',

    tree = {
      id: 'id',
      parent: 'parent',
      value: 'value',
      depth: Infinity,
    },

    ...config
  }
}) => {

  const plot = new Plottable.Plots.Rectangle();

  const treeChart = createTreeChart({element, plot, config: {orientation, ...config}});

  const layout = partition().size([1, 1]);

  const colorize = d => {

    d.data.color = !d.data.color && d.parent && d.parent.data.color ?
      color(d.parent.data.color).brighter(d.parent.children.indexOf(d) * 0.4).toString() :
      d.data.color;

    return d;
  };

  const transform = data => {
    const root = createTreeHierachy(data, tree);
    return layout(root)
      .descendants()
      .map(colorize)
      .filter(d => d.depth <= tree.depth || Infinity);
  };

  const chart = {

    ...treeChart,

    addData: data => treeChart.addData(transform(data))
  };

  const ease = (actual, expected, factor) => {
    if (+expected.toFixed(4) !== +actual.toFixed(4)) {
      const diff = expected - actual;

      const differenceToSmall = parseFloat(Math.abs(diff).toFixed(3)) === 0;

      return differenceToSmall ? expected : actual + (diff * factor)
    }
  };

  let intervals = [];

  // TODO: Use request animation frame
  chart.onClick((entities, xScale, yScale) => {
    // Stop all intervals
    while (intervals.length) clearInterval(intervals.pop());

    const entity = entities.pop();
    const d = entity.datum;

    const x = orientation === 'vertical' ? 'x' : 'y';
    const y = orientation === 'horizontal' ? 'x' : 'y';
    const x0 = x + '0';
    const y0 = y + '0';
    const x1 = x + '1';
    const y1 = y + '1';

    const xMax = orientation === 'horizontal' ? d.descendants().sort((a, b) => a[x1] - b[x1]).pop()[x1] : d[x1];
    const xMin = orientation === 'horizontal' && d.parent ? d[x0] - (xMax - d[x0]) * 0.1 : d[x0];
    const yMax = orientation === 'vertical' ? d.descendants().sort((a, b) => a[y1] - b[y1]).pop()[y1] : d[y1];
    const yMin = orientation === 'vertical' && d.parent ? d[y0] - (yMax - d[y0]) * 0.1 : d[y0];

    const interval = setInterval(() => {
      const easedXMin = ease(xScale.domainMin(), xMin, 0.3);
      const easedXMax = ease(xScale.domainMax(), xMax, 0.3);
      const easedYMin = ease(yScale.domainMin(), yMin, 0.3);
      const easedYMax = ease(yScale.domainMax(), yMax, 0.3);

      xScale.domainMin(easedXMin);
      xScale.domainMax(easedXMax);
      yScale.domainMin(easedYMin);
      yScale.domainMax(easedYMax);

      if (!easedXMin && !easedXMax && !easedYMin && !easedYMax) clearInterval(interval)

    }, 50);

    intervals = [...intervals, interval];
  });

  chart.addData(data);

  return treeChart
};