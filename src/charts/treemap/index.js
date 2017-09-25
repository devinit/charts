import Plottable from 'plottable';
import { treemap } from 'd3';
import createRectangleChart, { createColorFiller } from '../../factories/createTreeChart';
import { createTreeHierachy } from '../../factories/createDataset';
import { createTreeChartLabeler } from '../../factories/createLabeler';
import { createTreeTipper } from '../../factories/tooltips';
import getDatumPercentage from './percentage';
import createTreemapOnClickListener from './click';
import getTilingMethod from './tiling';

/**
 * @typedef {TreeChart} Treemap
 * @public
 * @property {'treemap'} type
 * @property {Tiling} tiling - Tiling
 *
 */

export default (element, data = [], config) => {
  const {
    orientation = 'vertical',

    colors = [],

    coloring = null,

    tree,

    // Tiling configuration
    tiling = {},

    labeling = {},

    tooltips = {
      enable: true,
    },

    ...more
  } = config;

  const plot = new Plottable.Plots.Rectangle();

  plot.onAnchor(plot => {
    if (tooltips.enable) {
      createTreeTipper(element, labeling, getDatumPercentage)(plot);
    }
  });

  plot._drawLabels = createTreeChartLabeler(labeling, getDatumPercentage);

  // ... apply rectangle configuration

  const treeChart = createRectangleChart({
    element,
    plot,
    config: { orientation, labeling, ...more },
  });

  const tilingMethod = getTilingMethod(tiling);

  const layout = treemap().tile(tilingMethod);

  const colorize = createColorFiller(colors, [], coloring);

  const transform = root => layout(root).leaves();

  const listeners = [];

  treeChart.onClick(createTreemapOnClickListener(orientation, listeners));

  const update = data => {
    const root = colorize(createTreeHierachy(data, tree));
    treeChart.update(transform(root));
  };

  const chart = {
    ...treeChart,

    onClick: callback => {
      listeners.push(callback);
    },

    setLabeling(labeling) {
      plot._drawLabels = createTreeChartLabeler(labeling, getDatumPercentage);
      plot._drawLabels();
    },

    update,
  };

  chart.update(data);

  return chart;
};
