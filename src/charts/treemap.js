import Plottable from "plottable";
import createRectangleChart, {createColorFiller, createTipper} from "../factories/createTreeChart";
import {createTreeHierachy} from "../factories/createDataset";
import {createScaleAnimator} from '../factories/createAnimator'
import {
  treemap,
  treemapBinary,
  treemapDice,
  treemapResquarify,
  treemapSlice,
  treemapSliceDice,
  treemapSquarify
} from "d3";
import {createTreeChartLabeler} from "../factories/createLabeler";

/**
 * @typedef {TreeChart} Treemap
 * @public
 * @property {'treemap'} type
 * @property {TreemapConfig} treemap
 *
 */

/**
 * @typedef {Object} TreemapConfig
 * @property {'binary'|'dice'|'slice'|'sliceDice'|'squarify'|'resquarify'} tile - Tiling Method
 *
 */

export default (element, data = [], config) => {

  const {

    orientation = 'vertical',

    colors = [],

    coloring = null,

    tree,

    // Treemap configuration
    treemap: {
      // Tiling algorithm: binary, dice, slice, sliceDice, squarify, resquarify
      tile = 'sliceDice',

    } = {},

    labeling = {},

    ...more

  } = config;

  const plot = new Plottable.Plots.Rectangle();

  plot.onAnchor(createTipper(element, labeling, getDatumPercentage));

  plot._drawLabels = createTreeChartLabeler(labeling, getDatumPercentage);

  // ... apply rectangle configuration

  const treeChart = createRectangleChart({element, plot, config: {orientation, labeling, ...more}});

  const tilingMethod = getTilingMethod(tile);

  const layout = treemap().tile(tilingMethod);

  const colorize = createColorFiller(colors, [], coloring);

  const transform = root => layout(root).leaves();

  let listeners = [];

  treeChart.onClick(createTreemapOnClickListener(orientation, listeners));

  const update = data => {
    const root = colorize(createTreeHierachy(data, tree));
    treeChart.update(transform(root))
  };

  const chart = {

    ...treeChart,

    onClick: (callback) => {
      listeners.push(callback)
    },

    setLabeling(labeling) {
      plot._drawLabels = createTreeChartLabeler(labeling, getDatumPercentage);
      plot._drawLabels();
    },

    update,
  };

  chart.update(data);

  return chart
};

const getDatumPercentage = datum => Math.round((datum.x1 - datum.x0) * (datum.y1 - datum.y0) * 100);

export const getTilingMethod = (method) => {
  const tilingMethods = {
    binary: treemapBinary,
    dice: treemapDice,
    slice: treemapSlice,
    sliceDice: treemapSliceDice,
    squarify: treemapSquarify,
    resquarify: treemapResquarify,
  };

  return tilingMethods[method]
};

const createTreemapOnClickListener = (orientation, listeners) => {

  const animate = createScaleAnimator(500);

  return (entities, xScale, yScale) =>{

    const entity = entities.pop();

    const datum = entity.datum;

    const orientationAwareness = [
      orientation === 'vertical' ? ['x0', 'x1'] : ['y0', 'y1'],
      orientation === 'horizontal' ? ['x0', 'x1'] : ['y0', 'y1'],
    ];

    const nextDomain = orientationAwareness
      .map(([min, max]) => [datum[min], datum[max]]);

    const previousDomain = [xScale.domain(), yScale.domain()];

    const shouldReset = [[nextDomain, previousDomain]]
      .every(([[[a, b], [c, d]], [[w, x], [y, z]]]) => {
        const diff = (a + b + c + d) - (w + x + y + z);

        return +(diff.toFixed(2)) === 0
      });

    const onAnimated = () => listeners.forEach(callback => callback(datum.data));

    if (shouldReset)
      animate([xScale, yScale], [0, 1], [0, 1]).then(onAnimated);
    else
      animate([xScale, yScale], ...nextDomain).then(onAnimated);

  };

};