import * as Plottable from 'plottable';
import { treemap } from 'd3';
import createRectangleChart, { createColorFiller } from '../../factories/tree';
import { createTreeHierachy } from '../../factories/dataset';
import { createTreeChartLabeler } from '../../factories/labeler';
import { createTreeTipper } from '../../factories/tooltips';
import createPercentageCalculator from './percentage';
import createTreemapOnClickListener from './click';
import createTilingMethod from './tiling';

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

  const width = element.parentElement.clientWidth;
  const height = element.parentElement.clientHeight;
  const calculatePercentage = createPercentageCalculator(width, height);

  const plot = new Plottable.Plots.Rectangle();

  const treeTipper = createTreeTipper(element, labeling, calculatePercentage);

  plot.onAnchor(plot => {
    if (tooltips.enable) {
      setTimeout(() => {
        treeTipper(plot);
      }, 500);
    }
  });

  (plot as any)._drawLabels = createTreeChartLabeler(labeling, calculatePercentage);

  // ... apply rectangle configuration

  const treeChart = createRectangleChart({
    element,
    plot,
    config: {
      orientation,
      labeling,
      width,
      height,
      ...more
    },
  });

  const listeners: any[] = [];

  const tilingMethod = createTilingMethod(tiling);

  const layout = treemap()
    .tile(tilingMethod)
    .size([width, height]);

  const colorize = createColorFiller(colors, coloring);

  const update = data => {
    const root = colorize(createTreeHierachy(data, tree)
      .sort((a: any, b: any) => b.value - a.value));
    treeChart.update(layout(root).leaves());
  };

  const chart = {
    ...treeChart,

    onClick: callback => {
      listeners.push(callback);
    },

    setLabeling(labeling) {
      (plot as any)._drawLabels = createTreeChartLabeler(labeling, calculatePercentage);
      (plot as any)._drawLabels();
    },

    update,
  };

  treeChart.onClick(createTreemapOnClickListener({
    orientation,
    width,
    height,
    listeners
  }));

  chart.update(data);

  return chart;
};
