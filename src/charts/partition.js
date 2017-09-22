/**
 * @typedef {TreeChart} Partition
 * @public
 * @property {'partition'} type
 * @property {('vertical'|'horizontal')} orientation=horizontal - Orientation
 *
 */
import Plottable from 'plottable';
import hash from 'object-hash';
import createTreeChart, { createColorFiller } from '../factories/createTreeChart';
import { createTreeHierachy } from '../factories/createDataset';
import { createScaleAnimator } from '../factories/createAnimator';
import { createTreeChartLabeler } from '../factories/createLabeler';
import { createTreeTipper } from '../factories/createTooltipper';

export default (element, data = [], config) => {
  const {
    orientation = 'horizontal',

    colors = [],

    coloring = null,

    tree,

    labeling = {},

    tooltips = {
      enable: true,
    },

    ...moreConfig
  } = config;

  const plot = new Plottable.Plots.Rectangle();

  plot.onAnchor(plot => {
    if (tooltips.enable) {
      createTreeTipper(element, labeling, getDatumPercentage(orientation));
    }
  });

  plot._drawLabels = createTreeChartLabeler(labeling, getDatumPercentage(orientation));

  const treeChart = createTreeChart({
    element,
    plot,
    config: { orientation, labeling, ...moreConfig },
  });

  const layout = partition().size([1, 1]);

  const colorize = createColorFiller(colors, [], coloring);

  const transform = data => {
    const root = colorize(createTreeHierachy(data, tree));
    return layout(root)
      .descendants()
      .filter(d => d.depth <= tree.depth || Infinity);
  };

  const listeners = [];

  const animate = createScaleAnimator(500);

  treeChart.onClick((entities, xScale, yScale) => {
    const entity = entities.pop();
    const datum = entity.datum;

    // TODO: Rethink orientation implementation for tree chats
    // It might be better to set a fixed orientation for each tree chart
    //
    const x = orientation === 'vertical' ? 'x' : 'y';
    const y = orientation === 'horizontal' ? 'x' : 'y';
    const x0 = `${x}0`;
    const y0 = `${y}0`;
    const x1 = `${x}1`;
    const y1 = `${y}1`;

    const max = (list, key) => Math.max.apply(null, list.map(d => d[key]));

    const xMax = orientation === 'horizontal' ? max(datum.descendants(), x1) : datum[x1];
    const xMin =
      orientation === 'horizontal' && datum.parent
        ? datum[x0] - (xMax - datum[x0]) * 0.05
        : datum[x0];
    const yMax = orientation === 'vertical' ? max(datum.descendants(), y1) : datum[y1];
    const yMin =
      orientation === 'vertical' && datum.parent
        ? datum[y0] - (yMax - datum[y0]) * 0.05
        : datum[y0];

    animate([xScale, yScale], [xMin, xMax], [yMin, yMax]).then(() => {
      listeners.forEach(callback => callback(datum));
    });
  });

  const update = data => treeChart.update(transform(data));

  const hashes = {
    labeling: hash(labeling),
  };

  const chart = {
    ...treeChart,

    onClick: callback => {
      listeners.push(callback);
    },

    setLabeling(labeling) {
      const labelingHash = hash(labeling);

      if (hashes.labeling !== labelingHash) {
        plot._drawLabels = createTreeChartLabeler(labeling, getDatumPercentage(orientation));
        // delay label redraw like plottable does
        setTimeout(() => plot._drawLabels(), 200);
        hashes.labeling = labelingHash;
      }
    },

    update,
  };

  chart.update(data);

  return chart;
};

const getDatumPercentage = orientation => datum => {
  return Math.round(orientation === 'horizontal' ? (datum.x1 - datum.x0) * 100 : (datum.y1 - datum.y0) * 100, );
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
    // noinspection CommaExpressionJS
    return arguments.length ? ((round = !!x), partition) : round;
  };

  partition.size = function (x) {
    // noinspection CommaExpressionJS
    return arguments.length ? ((dx = +x[0]), (dy = +x[1]), partition) : [dx, dy];
  };

  partition.padding = function (x) {
    // noinspection CommaExpressionJS
    return arguments.length ? ((padding = +x), partition) : padding;
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

const roundNode = node => {
  node.x0 = Math.round(node.x0);
  node.y0 = Math.round(node.y0);
  node.x1 = Math.round(node.x1);
  node.y1 = Math.round(node.y1);
};
