import {stratify} from "d3";
import Plottable from "plottable";

export const makeUnique = list => Array.from(new Set(list));

export const createFullStackedDataset = (data = [], linearAxisIndicator, categoryAxisIndicator) => {

  const labels = makeUnique(data.map(d => d[categoryAxisIndicator]));

  const sums = labels
    .map(label => ({
      [label]: data
        .filter(d => d[categoryAxisIndicator] === label)
        .map(d => d[linearAxisIndicator])
        .reduce((sum, value) => sum + value, 0)
    }))
    .reduce((sums, sum) => ({...sums, ...sum}), {});

  return data.map(d => ({
    ...d,

    [linearAxisIndicator]: d[linearAxisIndicator] * 100 / sums[d[categoryAxisIndicator]]
  }))
};

export const createTreeHierachy = (data, tree) => {

  const series = data.map(d => ({...d, label: d[tree.id], parent: d[tree.parent], value: d[tree.value]}));

  const stratifyFactory = stratify()
    .id(d => d.label)
    .parentId(d => d.parent);

  const root = stratifyFactory(series);

  root.sum = function (value) {
    return this.eachAfter(function (node) {
      let sum = +value(node) || 0,
        children = node.children,
        i = children && children.length;
      while (--i >= 0) sum += children[i].value;
      node.value = sum;
    });
  };

  return root
    .sum(node => {
      return node.children ? 0 : node.data.value;
    })
    .sort((a, b) => a.value - b.value);

};

export const createTreeDataset = (rects) => {
  return [new Plottable.Dataset(rects)];
};