import Plottable from "plottable";
import createRectangleChart from "../factories/createTreeChart";
import {createTreeHierachy} from "../factories/createDataset";
import treemap from "d3-hierarchy/src/treemap";
import color from "d3-color/src/color";

/**
 * @typedef {Treemap} Treemap
 * @public
 * @property {'treemap'} type
 * @property {TreemapConfig} treemap
 *
 */

/**
 * @typedef {Object} TreemapConfig
 * @public
 * @property {'binary'|'dice'|'slice'|'sliceDice'|'squarify'|'resquarify'} tile - Tiling Method
 *
 */

export default (element, data = [], config) => {

  const {

    orientation = 'vertical',

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

  const tilingMethod = require(`d3-hierarchy/src/treemap/${tile}.js`);

  const layout = treemap().tile(tilingMethod.default);

  const colorize = d => {

    d.data.color = !d.data.color && d.parent && d.parent.data.color ?
      color(d.parent.data.color).brighter(d.parent.children.indexOf(d) * 0.4).toString() :
      d.data.color;

    return d;
  };

  const transform = root => {
    return layout(root)
      .leaves()
      .map(colorize)
      .filter(d => d.depth <= tree.depth || Infinity);
  };

  const chart = {

    ...treeChart,

    addData: data => {
      const root = createTreeHierachy(data, tree);
      treeChart.addData(transform(root))
    }
  };

  chart.addData(data);

  return treeChart
};