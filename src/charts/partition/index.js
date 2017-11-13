import Plottable from 'plottable';
import hash from 'object-hash';
import createTreeChart, { createColorFiller } from '../../factories/tree/index';
import { createTreeHierachy } from '../../factories/dataset/index';
import createScaleAnimator from '../../factories/animator/scale';
import { createTreeChartLabeler } from '../../factories/labeler/index';
import { createTreeTipper } from '../../factories/tooltips';
import partition from './layout';
import createPercentageCalculator from './percentage';

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

    colors = [],

    coloring = null,

    tree,

    labeling = {},

    tooltips = {
      enable: true,
    },

    ...moreConfig
  } = config;

  const width = element.parentElement.clientWidth;
  const height = element.parentElement.clientHeight;
  const calculatePercentage = createPercentageCalculator(width, height, orientation);

  const plot = new Plottable.Plots.Rectangle();

  const treeTipper = createTreeTipper(element, labeling, calculatePercentage);

  plot.onAnchor(plot => {
    if (tooltips.enable) {
      // TODO: Replace with plottable onRender
      setTimeout(() => {
        treeTipper(plot);
      }, 500);
    }
  });

  plot._drawLabels = createTreeChartLabeler(labeling, calculatePercentage);

  const treeChart = createTreeChart({
    element,
    plot,
    config: {
      orientation,
      labeling,
      width,
      height,
      ...moreConfig
    },
  });

  const layout = partition().size([
    orientation === 'vertical' ? width : height,
    orientation === 'vertical' ? height : width,
  ]);

  const colorize = createColorFiller(colors, [], coloring);

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
        ? datum[x0] - ((xMax - datum[x0]) * 0.05)
        : datum[x0];
    const yMax = orientation === 'vertical' ? max(datum.descendants(), y1) : datum[y1];
    const yMin =
      orientation === 'vertical' && datum.parent
        ? datum[y0] - ((yMax - datum[y0]) * 0.05)
        : datum[y0];

    animate([xScale, yScale], [xMin, xMax], [yMin, yMax]).then(() => {
      listeners.forEach(callback => callback(datum));
    });
  });

  const update = data => {
    const root = colorize(createTreeHierachy(data, tree)
      .sort((a, b) => a.value - b.value));

    treeChart.update(layout(root)
      .descendants()
      .filter(d => d.depth <= tree.depth || Infinity));
  };

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
        plot._drawLabels = createTreeChartLabeler(labeling, calculatePercentage);
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
