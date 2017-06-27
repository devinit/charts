import {stratify} from "d3";
import Plottable from "plottable";

export const makeUnique = list => Array.from(new Set(list));

export const createDataMapping = (data, linearLabel, categoryLabel, groupLabel) => {
  return data.map(d => ({
    label: d[categoryLabel],
    value: d[linearLabel],
    group: d[groupLabel],
    ...d
  }))
};

export const createLinearDatasets = (data = []) => {
  const labels = makeUnique(data.map(d => d.label)).sort((a, b) => a > b ? -1 : 1);

  const series = data
    .reduce((all, item, index, list) => {

      if (all.map[item.group] === undefined) {
        all.map[item.group] = all.groups.length;
        all.groups[all.map[item.group]] = {
          color: '#abc',
          opacity: 1,
          label: item.group || 'Unknown',
          items: []
        };
      }

      all.groups[all.map[item.group]].items[labels.indexOf(item.label)] = item;

      return index + 1 === list.length ? all.groups : all;

    }, {map: {}, groups: []});

  return {labels, series}

};

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