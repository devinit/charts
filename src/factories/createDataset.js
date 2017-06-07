import stratify from "d3-hierarchy/src/stratify";
import Plottable from "plottable";

const makeUnique = list => Object.keys(list.reduce((a, b) => ({...a, [b]: true}), {}));

export const createLinearDataset = (data = []) => {
  const labels = makeUnique(data.map(d => d.label));

  const series = data
    .reduce((all, item, index, list) => {

      if (all.map[item.group] === undefined) {
        all.map[item.group] = all.groups.length;
        all.groups[all.map[item.group]] = {
          color: '#abc',
          opacity: 1,
          label: item.group,
          values: []
        };
      }

      all.groups[all.map[item.group]].values.push(item.value);

      return index + 1 === list.length ? all.groups : all;

    }, {map: {}, groups: []});

  return {labels, series}

  return series.map(({color = '#abc', opacity = 1, values}) => {
      return new Plottable.Dataset(values.map((value, index) => {
          return {
            label: labels[index] || index, // Each value in a `series` should correspond to a `label`
            value,
            color,
            opacity
          }
        })
      )
    });

  // return [new Plottable.Dataset([])];

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

export const createTreeHierachy = (series) => {

  const stratifyFactory = stratify()
    .id(d => d.label)
    .parentId(d => d.parent);

  return stratifyFactory(series)
    .sum(d => d.value)
    .sort((b, a) => a.value - b.value);

};

export const createTreeDataset = (rects) => {
  return [new Plottable.Dataset(rects)];
};