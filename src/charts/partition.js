import Plottable from "plottable";
import createTreeChart from "../factories/createTreeChart";
import {createTreeHierachy} from "../factories/createDataset";
import partition from "../partition";
import color from "d3-color/src/color";

export default ({element, data, config: {

    orientation = 'horizontal',

    partition: {

      depth = Infinity,

    } = {},

    ...config
  }
                }) => {

  const plot = new Plottable.Plots.Rectangle();

  const treeChart = createTreeChart({element, plot, config: {orientation, ...config}});

  const layout = partition().size([1, 1]);

  let root = null;

  const colorize = d => {

    d.data.color = !d.data.color && d.parent && d.parent.data.color ?
      color(d.parent.data.color).brighter(d.parent.children.indexOf(d) * 0.4).toString() :
      d.data.color;

    return d;
  };

  const transform = data => {
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

    // TODO: Why does partition layout boxes outside of the given width/height
    const descendants = layout(root)
      .descendants()
      .map(colorize);

    treeChart.addData(descendants)
  });

  chart.addData(data);

  return treeChart
};