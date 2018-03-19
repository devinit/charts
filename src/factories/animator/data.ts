import { easeLinear } from 'd3';
import { uniq } from 'lodash';
import createAnimator from './base';

export default (id, indicators = [], duration) => {
  return (plot, scaleBubbles, data) =>
    new Promise(resolve => {
      const initial = plot
        .datasets()
        .reduce((all, dataset) => [...all, ...dataset.data()], [])
        .reduce((map, datum) => {
          return {
            ...map,
            [datum[id]]: datum,
          };
        }, {});

      const final = data.reduce((all, dataset) => [...all, ...dataset], []).reduce((map, datum) => {
        return {
          ...map,
          [datum[id]]: datum,
        };
      }, {});

      const diff = uniq([
        ...Object.keys(initial),
        ...Object.keys(final),
      ]).reduce((diffs, key) => {
        const from = initial[key] || {};
        const to = final[key] || {};

        return {
          ...diffs,

          [key]: {
            ...(from[id] ? from : to),

            ...indicators
              .map(indicator => ({
                [indicator]: (to[indicator] || 0) - (from[indicator] || 0),
              }))
              .reduce(
                (indicators, indicator) => ({
                  ...indicators,
                  ...indicator,
                }),
                {},
              ),
          },
        };
      }, {});

      const stepFn = progress => {
        const movements = Object.keys(final).map(key => ({
          ...final[key],

          ...indicators.reduce(
            (indicators, indicator) => ({
              ...indicators,
              ...{
                [indicator]: final[key][indicator] - (diff[key][indicator] * easeLinear(1 - progress)),
              },
            }),
            {},
          ),
        }));

        plot.datasets().forEach(dataset => dataset.data(movements));

        scaleBubbles(movements);
      };

      requestAnimationFrame(timestamp => {
        const animate = createAnimator(stepFn, timestamp, duration, resolve);
        animate(timestamp);
      });
    });
};
