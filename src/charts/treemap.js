import Plottable from "plottable";
import createRectangleChart from "../factories/createTreeChart";
import {createTreeHierachy} from "../factories/createDataset";
import treemap from "d3-hierarchy/src/treemap";
import color from "d3-color/src/color";

export default ({element, data, config: {

  orientation = 'vertical',

  // Treemap configuration
  treemap: {
    // Tiling algorithm: binary, dice, slice, sliceDice, squarify, resquarify
    tile = 'sliceDice',

    depth = Infinity,

    sort = 'ascending',
  } = {},

  ...config
}}) => {

  const plot = new Plottable.Plots.Rectangle();

  // ... apply rectangle configuration

  const treeChart = createRectangleChart({element, plot, config: {orientation, ...config}});

  const tilingMethod = require(`d3-hierarchy/src/treemap/${tile}.js`);

  const layout = treemap().tile(tilingMethod.default);

  let root = null;

  const colorize = d => {

    d.data.color = !d.data.color && d.parent && d.parent.data.color ?
      color(d.parent.data.color).brighter(d.parent.children.indexOf(d) * 0.4).toString() :
      d.data.color;

    return d;
  };

  const transform = data =>  {
    root = createTreeHierachy(data);
    return layout(root)
      .descendants()
      .map(colorize)
      .filter(d => d.depth <= depth);
  };

  const chart = {

    ...treeChart,

    addData: data => treeChart.addData(transform(data))
  };

  chart.onClick(entity => {
    const d = entity.datum;

    if (d === root && !d.parent) return;

    else if (d === root && d.parent) {
      root = d.parent;
    }

    else {
      root = d;
    }

    const descendants = layout(root)
      .descendants()
      .map(colorize)

    console.log(descendants)

    treeChart.addData(descendants)
  });

  chart.addData(data);

  return treeChart
};