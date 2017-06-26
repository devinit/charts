import {stratify} from "d3";
import Plottable from "plottable";

export const makeUnique = list => Object.keys(list.reduce((a, b) => ({...a, [b]: true}), {}));

export const createDataMapping = (data, linearLabel, categoryLabel, groupLabel) => {
  return data.map(d => ({
    label: d[categoryLabel],
    value: d[linearLabel],
    group: d[groupLabel]
  }))
};

export const createLinearDataset = (data = []) => {
  const labels = makeUnique(data.map(d => d.label)).sort((a, b) => a - b);

  const series = data
    .reduce((all, item, index, list) => {

      if (all.map[item.group] === undefined) {
        all.map[item.group] = all.groups.length;
        all.groups[all.map[item.group]] = {
          color: '#abc',
          opacity: 1,
          label: item.group || 'Unknown',
          values: []
        };
      }

      all.groups[all.map[item.group]].values[labels.indexOf(item.label)] = item.value;

      return index + 1 === list.length ? all.groups : all;

    }, {map: {}, groups: []});

  return {labels, series}

};

export const createFullStackedDataset = ({labels, series}) => {

  const sums = labels
    .map((label, index) =>
      series
        .map(({values}) => values[index] || 0)
        .reduce((sum, value) => sum + value)
    );

  return {
    labels,
    series: series.map(s => {

      return {
        ...s, values: labels.map((label, index) => {
          const value = s.values[index];
          return value ? 100 * value / sums[index] : 0;
        }),
      }

    })
  }

};

export const createTreeHierachy = (data, tree) => {

  const series = data.map(d => ({...d, label: d[tree.id], parent: d[tree.parent], value: d[tree.value]}));

  const stratifyFactory = stratify()
    .id(d => d.label)
    .parentId(d => d.parent);

  const root = stratifyFactory(series);

  root.sum = function(value) {
    return this.eachAfter(function(node) {
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