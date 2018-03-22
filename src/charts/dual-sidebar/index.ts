import * as Plottable from 'plottable';
import * as hash from 'object-hash';
import { flattenDeep, groupBy as group, keys, mapValues, uniq, values } from 'lodash';
import { createChartTable } from '../../factories/table';
import { createTitle } from '../../factories/title';
import { createCategoryScale, createLinearScale } from '../../factories/scale';
import { createAxisModifier, createCategoryAxis, createNumericAxis } from '../../factories/axis';
import { createLinearAxisGridLines } from '../../factories/grid';
import { createBarTipper } from '../../factories/tooltips';
import drawLabels from './labels';
import {createPlotWithGridlines, createPlotAreaWithAxes, createLinearPlot} from './helpers';
import { BarOrientation } from 'plottable/build/src/plots';

/**
 * @typedef {LinearCategoryChart} DualSidebar
 * @public
 * @property {'dual-sidebar'} type
 * @property {'indicator'} splitBy
 * @property {string} splitBy
 * @property {'indicator'}
 *
 */

/**
 * @typedef {Object} DualSidebarConfig
 * @property {number} gutter=100 - Gutter
 */
export interface Config {
 title?: string;
 titleAlignment: Plottable.XAlignment;
 labeling: any;
 orientation?: BarOrientation;
 splitBy: string;
 groupBy: string;
 subGroupBy: string;
 orderBy: string;
 colors?: string[];
 coloring?: string;
 showLabels?: true;
 linearAxis: any;
 categoryAxis: any;
 dualSidebar?: any;
 tooltips?: any;
}

export interface Hash {
  data: null | string;
}

export default (element, data, config: Config) => {
  const leftPlot = new Plottable.Plots.Bar(config.orientation);
  const rightPlot = new Plottable.Plots.Bar(config.orientation);

  const {
    title,

    titleAlignment = 'left',

    orientation = 'horizontal',

    splitBy,

    groupBy,

    subGroupBy,

    orderBy,

    colors = [],

    coloring = null,

    showLabels = false,

    linearAxis,

    categoryAxis,

    dualSidebar = {
      gutter: 100,
    },

    tooltips = { enable: true },

    // ... more config
  } = config;

  const { format, modify } = createAxisModifier(linearAxis);
  const leftCategoryScale = createCategoryScale(categoryAxis);
  const rightCategoryScale = createCategoryScale(categoryAxis);

  const leftLinearScale = createLinearScale({
    ...linearAxis,
    axisMinimum: linearAxis.axisMaximum && -linearAxis.axisMaximum,
    axisMaximum: linearAxis.axisMinimum && -linearAxis.axisMinimum,
  });
  const rightLinearScale = createLinearScale(linearAxis);

  const table = createChartTable({
    title: createTitle({ title, titleAlignment }),

    chart: createPlotAreaWithAxes({
      leftPlotArea: createPlotWithGridlines({
        plot: createLinearPlot(
          {
            plot: leftPlot,
            categoryScale: leftCategoryScale,
            linearScale: leftLinearScale,
            showLabels,
          },
          modify,
        ),
        grid: createLinearAxisGridLines({ ...linearAxis, orientation, scale: leftLinearScale }),
      }),

      rightPlotArea: createPlotWithGridlines({
        plot: createLinearPlot(
          {
            plot: rightPlot,
            categoryScale: rightCategoryScale,
            linearScale: rightLinearScale,
            showLabels,
          },
          modify,
        ),
        grid: createLinearAxisGridLines({ ...linearAxis, orientation, scale: rightLinearScale }),
      }),

      leftLinearAxis: createNumericAxis(
        {
          ...linearAxis,
          axisScale: leftLinearScale,
          axisOrientation: orientation,
        },
        format,
      ),

      rightLinearAxis: createNumericAxis(
        {
          ...linearAxis,
          axisScale: rightLinearScale,
          axisOrientation: orientation,
          absolute: true,
        },
        format,
      ),

      leftCategoryAxis: createCategoryAxis({
        showAxis: false,
        axisScale: leftCategoryScale,
        ticking: 'none',
        axisDirection: 'right',
      }),

      rightCategoryAxis: createCategoryAxis({
        showAxis: false,
        axisScale: rightCategoryScale,
        ticking: 'none',
        axisDirection: 'left',
      }),

      dualSidebar,
    }),
  });

  table.renderTo(element);

  (leftPlot as any)._drawLabels = drawLabels(dualSidebar);
  (rightPlot as any)._drawLabels = drawLabels(dualSidebar);

  leftPlot.onAnchor(plot => {
    setTimeout(() => {
      if (tooltips.enable) {
        createBarTipper(element, config.labeling, 'inverted-horizontal')(plot);
      }
    }, 500);
  });

  rightPlot.onAnchor(plot => {
    setTimeout(() => {
      if (tooltips.enable) {
        createBarTipper(element, config.labeling, 'horizontal')(plot);
      }
    }, 500);
  });

  const hashes: Hash = {
    data: null,
  };

  // tslint:disable-next-line:no-shadowed-variable
  const update = (data = []) => {
    const dataHash = hash(data);
    if (hashes.data === dataHash) return;

    hashes.data = dataHash;

    const plots = [leftPlot, rightPlot];

    const sorted = orderBy ?
      data.sort((a, b) => ((a || a[orderBy]) > (b && b[orderBy]) ? 1 : -1)) :
      data;

    const groupIds = uniq(sorted.map(d => d[groupBy]));

    const [
      first = [],
      second = []
    ] = values(group(sorted, d => d[splitBy]));

    [first, second]
      .sort((a, b) => {
        const firstDirection = a[0] && a[0][splitBy];
        const secondDirection = b[0] && b[0][splitBy];
        return firstDirection > secondDirection ? 1 : -1;
      })
      .map(side => mapValues(group(side, d => d[groupBy]), grp => group(grp, d => d[subGroupBy])))
      .reduce(([sides = []], side) => [[...sides, side]], [] as any[])
      .map(([left, right]) => {
        uniq([...keys(left), ...keys(right)]).forEach(groupId => {
          const subGroupIds = uniq([...keys(left[groupId] || {}), ...keys(right[groupId] || {})]);

          subGroupIds.forEach(subGroupId => {
            // Safety first: Applying seat belts
            // ...
            left[groupId] = left[groupId] || {};
            left[groupId][subGroupId] = left[groupId][subGroupId] || [];
            right[groupId] = right[groupId] || {};
            right[groupId][subGroupId] = right[groupId][subGroupId] || [];

            // ...
            const leftSubGroupSize = left[groupId][subGroupId].length;
            const rightSubGroupSize = right[groupId][subGroupId].length;

            if (leftSubGroupSize > rightSubGroupSize) {
              for (let i = rightSubGroupSize; i < leftSubGroupSize; i++) {
                right[groupId][subGroupId].push({
                  ...left[groupId][subGroupId][i],
                  [categoryAxis.indicator]: '',
                  [linearAxis.indicator]: 0,
                });
              }
            } else if (leftSubGroupSize < rightSubGroupSize) {
              for (let j = leftSubGroupSize; j < rightSubGroupSize; j++) {
                left[groupId][subGroupId].push({
                  ...right[groupId][subGroupId][j],
                  [categoryAxis.indicator]: '',
                  [linearAxis.indicator]: 0,
                });
              }
            }
          });

          // Add a dummy item to the end of every subgroup to create
          // an 'artificial' padding
          left[groupId][''] = [
            {
              [groupBy]: '',
              [subGroupBy]: '',
              [categoryAxis.indicator]: '',
              [linearAxis.indicator]: 0,
            },
          ];

          right[groupId][''] = [
            {
              [groupBy]: '',
              [subGroupBy]: '',
              [categoryAxis.indicator]: '',
              [linearAxis.indicator]: 0,
            },
          ];
        });

        return [left, right];
      })
      .reduce((all, side) => [...all, ...side], [])
      .forEach((side, index) => {
        const direction = index === 0 ? -1 : 1;

        const series = flattenDeep(
          // Using previously created groupIds
          // to preserve ordering
          groupIds.map((groupId, groupIndex) => {
            const grp = side[groupId];
            return flattenDeep(values(grp))
              .map(datum => ({
                ...datum,
                color: (coloring && datum[coloring]) || colors[groupIndex] || '#abc',
              }));
          })
        );

        const dataset = series.map((datum, datumIndex) => ({
          index: datumIndex,
          direction,
          sort: datum[orderBy],
          color: datum.color,
          label: datum[categoryAxis.indicator],
          value: datum[linearAxis.indicator] * direction,
          opacity: 1,
          category: datum[groupBy],
          subCategory: datum[subGroupBy],
        }));

        plots[index].datasets([dataset].map(d => new Plottable.Dataset(d)));
      });
  };

  const chart = {
    table,

    update,

    destroy: () => {
      table.destroy();
    },
  };

  chart.update(data);

  return chart;
};
