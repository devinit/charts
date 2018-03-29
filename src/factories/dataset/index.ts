import { stratify } from 'd3';
import {HierarchyNode} from 'd3-hierarchy';
import * as Plottable from 'plottable';

export const makeUnique = list => Array.from(new Set(list)); // TODO: use ramda

/**
 * createFullStackedDataset
 * @param {Object[]}data
 * @param {string} linearAxisIndicator
 * @param {string} categoryAxisIndicator
 * @returns {Array}
 */
export const createFullStackedDataset = (data = [], linearAxisIndicator: string, categoryAxisIndicator: string) => {
  const labels = makeUnique(data.map((d: any) => d[categoryAxisIndicator])) as string[];

  const sums = labels
    .map((label: string) => ({
      [label]: data
        .filter(d => d[categoryAxisIndicator] === label)
        .map(d => d[linearAxisIndicator])
        .reduce((sum, value) => sum + value, 0),
    }))
    .reduce((_sums, sum) => ({ ...sums, ...sum }), {});

  return data.map((d: any) => ({
    ...d,

    [linearAxisIndicator]: (d[linearAxisIndicator] * 100) / sums[d[categoryAxisIndicator]],
  }));
};

/**
 * createTreeHierachy
 * @param {Object[]} data
 * @param {Tree} tree
 */
export const createTreeHierachy = (data, tree: any): HierarchyNode<any> => {
  let series: any[] = [];
  if (tree.id && tree.parent && tree.value) {
    series = data.map(datum => ({
      ...datum,

      label: datum[tree.id],

      parent: datum[tree.parent],

      value: datum[tree.value],
    }));
  } else if (tree.value && tree.levels && tree.levels.length > 1) {
    series = data.map(datum => {
      const categories = tree.levels.map(l => datum[l]).filter(l => l);

      return {
        ...datum,

        label: categories.pop(),

        parent: categories.pop(),

        value: datum[tree.value],
      };
    });
  } else if (tree.id && tree.value) {
    series = [
      {
        label: 'All',
      },

      ...data.map(datum => ({
        ...datum,

        label: datum[tree.id],

        parent: 'All',

        value: datum[tree.value],
      })),
    ];
  }

  const stratifyFactory = stratify()
    .id((d: any) => d.label)
    .parentId((d: any) => d.parent);

  const root = stratifyFactory(series);

  root.sum = function rootsum(value) {
    return this.eachAfter((node: any) => {
      let sum = +value(node) || 0;
      const children = node.children;
      let i = children && children.length;
      while (--i >= 0) sum += children[i].value; // TODO: please remove this, looks like code smell
      node.value = sum;
    });
  };
  // console.log(root);
  return root
    .sum((node: any) => {
      return node.children ? 0 : node.data.value;
    });
};

export const createTreeDataset = rects => {
  return [new Plottable.Dataset(rects)];
};
