import Plottable from "plottable";
import createTreeChart from "../factories/createTreeChart";
import {createTreeHierachy} from "../factories/createDataset";
import roundNode from "d3-hierarchy/src/treemap/round";

/**
 * @typedef {TreeChart} Partition
 * @public
 * @property {'partition'} type
 * @property {('vertical'|'horizontal')} orientation=horizontal - Orientation
 *
 */
export default (element, data = [], config) => {

  const {

    orientation = 'horizontal',

    tree = {
      id: 'id',
      parent: 'parent',
      value: 'value',
      depth: Infinity,
    },

    ...moreConfig

  } = config;

  const plot = new Plottable.Plots.Rectangle();

  const treeChart = createTreeChart({element, plot, config: {orientation, ...moreConfig}});

  const layout = partition().size([1, 1]);

  const transform = data => {
    const root = createTreeHierachy(data, tree);
    return layout(root)
      .descendants()
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

const partition = function () {
  let dx = 1,
    dy = 1,
    padding = 0,
    round = false;

  function partition(root) {
    const n = root.height + 1;
    root.x0 = root.y0 = padding;
    root.x1 = dx;
    root.y1 = dy / n;
    root.eachBefore(positionNode(dy, n));
    if (round) root.eachBefore(roundNode);
    return root;
  }

  function positionNode(dy, n) {
    return function (node) {
      if (node.children) {
        treemapDice(node, node.x0, dy * (node.depth + 1) / n, node.x1, dy * (node.depth + 2) / n);
      }
      let x0 = node.x0,
        y0 = node.y0,
        x1 = node.x1 - padding,
        y1 = node.y1 - padding;
      if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
      if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
      node.x0 = x0;
      node.y0 = y0;
      node.x1 = x1;
      node.y1 = y1;
    };
  }

  partition.round = function (x) {
    return arguments.length ? (round = !!x, partition) : round;
  };

  partition.size = function (x) {
    return arguments.length ? (dx = +x[0], dy = +x[1], partition) : [dx, dy];
  };

  partition.padding = function (x) {
    return arguments.length ? (padding = +x, partition) : padding;
  };

  return partition;
};

const treemapDice = function (parent, x0, y0, x1, y1) {
  let nodes = parent.children,
    node,
    i = -1,
    n = nodes.length,
    sum = nodes.reduce((sum, n) => sum + Math.abs(n.value), 0),
    k = (x1 - x0) / sum;

  while (++i < n) {
    node = nodes[i];
    node.y0 = y0;
    node.y1 = y1;
    node.x0 = x0;
    node.x1 = x0 += Math.abs(node.value) * k;
  }
};