import Plottable from "plottable";
import createRectangleChart, {createColorFiller} from "../factories/createTreeChart";
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

    ...more

  } = config;

  const plot = new Plottable.Plots.Rectangle();

  // ... apply rectangle configuration

  const treeChart = createRectangleChart({element, plot, config: {orientation, ...more}});

  const tilingMethod = getTilingMethod(tile);

  const layout = treemap().tile(tilingMethod);

  const colorize = createColorFiller(colors, [], coloring);

  let listeners = [];

  const animate = createScaleAnimator(200);

  treeChart.onClick(function (entities, xScale, yScale) {

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
      .every(([[[a, b], [c, d]], [[w, x], [y, z]]]) =>
      a === w && b === x && c === y && d === z);

    const onAnimated = () => listeners.forEach(callback => callback(datum.data));

    if (shouldReset)
      animate([xScale, yScale], [0, 1], [0, 1]).then(onAnimated);
    else
      animate([xScale, yScale], ...nextDomain).then(onAnimated);

  });

  const transform = root => {
    return layout(root)
      .leaves()
      .filter(d => d.depth <= tree.depth || Infinity);
  };

  const chart = {

    ...treeChart,

    onClick: (callback) => {
      listeners.push(callback)
    },

    addData: data => {
      const root = colorize(createTreeHierachy(data, tree));
      treeChart.addData(transform(root))
    }
  };

  chart.addData(data);

  return chart
};

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