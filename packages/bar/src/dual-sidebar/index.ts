import * as Plottable from 'plottable';
import * as hash from 'object-hash';
import { flattenDeep, groupBy as group, keys, mapValues, uniq, values } from 'lodash';
import { createChartTable } from '@devinit-charts/core/lib/table';
import { createTitle } from '@devinit-charts/core/lib/title';
import { createCategoryScale, createLinearScale } from '@devinit-charts/core/lib/scale';
import { createAxisModifier, createCategoryAxis, createNumericAxis } from '@devinit-charts/core/lib/axes';
import { createLinearAxisGridLines } from '@devinit-charts/core/lib/axes/grid';
import createBarTipper from '../tooltip';
import drawLabels from './labels';
import { CategoricConfig } from '@devinit-charts/core/lib/categoric';
import {createPlotWithGridlines, createPlotAreaWithAxes, createLinearPlot} from './helpers';

export type Config = CategoricConfig & {
  splitBy: string;
  orderBy: string;
  subGroupBy: string;
  dualSidebar?: {gutter: number};
  interactions?: {enable?: boolean};
  highlight?: string[]; // bars to highlight
  tooltips?: {enable?: boolean};
};

export interface Hash {
  data: null | string;
}

export default (element, data, config: Config) => {
  const {
    title,

    titleAlignment = 'left',

    orientation = 'horizontal',

    splitBy,

    groupBy,

    subGroupBy,

    orderBy,

    linearAxis,

    labeling =  {showLabels : false},

    tooltips = { enable: true },
  } = config;

  const dualSidebar =
    config.dualSidebar && config.dualSidebar.gutter ?  config.dualSidebar : { gutter: 100 };

  const leftPlot = new Plottable.Plots.Bar(config.orientation);
  const rightPlot = new Plottable.Plots.Bar(config.orientation);
  const { format, modify } = createAxisModifier(config.linearAxis);
  const leftCategoryScale = createCategoryScale(config.categoryAxis);
  const rightCategoryScale = createCategoryScale(config.categoryAxis);

  const linearScaleArgs = {
    axisMinimum: config.linearAxis.axisMaximum,
    axisMaximum: config.linearAxis.axisMinimum
  };

  const leftLinearScale = createLinearScale({
    axisMinimum: linearScaleArgs.axisMaximum && -linearScaleArgs.axisMaximum,
    axisMaximum: linearScaleArgs.axisMinimum && -linearScaleArgs.axisMinimum,
  });

  const rightLinearScale = createLinearScale(linearScaleArgs);

  const baseLinearAxisGridArgs = {
    showGridlines: false,
    ticking: linearAxis.ticking,
    orientation,
  };

  const table = createChartTable({
    title: createTitle({ title, titleAlignment }),

    chart: createPlotAreaWithAxes({
      leftPlotArea: createPlotWithGridlines({
        plot: createLinearPlot(
          {
            plot: leftPlot,
            categoryScale: leftCategoryScale,
            linearScale: leftLinearScale,
            showLabels: labeling.showLabels,
          },
          modify,
        ),
        grid: createLinearAxisGridLines({
            ...baseLinearAxisGridArgs,
            scale: leftLinearScale
          }),
      }),

      rightPlotArea: createPlotWithGridlines({
        plot: createLinearPlot(
          {
            plot: rightPlot,
            categoryScale: rightCategoryScale,
            linearScale: rightLinearScale,
            showLabels: labeling.showLabels,
          },
          modify,
        ),
        grid: createLinearAxisGridLines({  ...baseLinearAxisGridArgs, scale: rightLinearScale }),
      }),

      leftLinearAxis: createNumericAxis(
        {
          axisScale: leftLinearScale,
          axisOrientation: orientation,
        },
        format,
      ),

      rightLinearAxis: createNumericAxis(
        {
          axisScale: rightLinearScale,
          axisOrientation: orientation
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
        createBarTipper(element, labeling, 'inverted-horizontal')(plot);
      }
    }, 500);
  });

  rightPlot.onAnchor(plot => {
    setTimeout(() => {
      if (tooltips.enable) {
        createBarTipper(element, labeling, 'horizontal')(plot);
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
                  [config.categoryAxis.indicator]: '',
                  [config.linearAxis.indicator]: 0,
                });
              }
            } else if (leftSubGroupSize < rightSubGroupSize) {
              for (let j = leftSubGroupSize; j < rightSubGroupSize; j++) {
                left[groupId][subGroupId].push({
                  ...right[groupId][subGroupId][j],
                  [config.categoryAxis.indicator]: '',
                  [config.linearAxis.indicator]: 0,
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
              [config.categoryAxis.indicator]: '',
              [config.linearAxis.indicator]: 0,
            },
          ];

          right[groupId][''] = [
            {
              [groupBy]: '',
              [subGroupBy]: '',
              [config.categoryAxis.indicator]: '',
              [config.linearAxis.indicator]: 0,
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
                color: (config.coloring && datum[config.coloring]) || config.colors[groupIndex] || '#abc',
              }));
          })
        );

        const dataset = series.map((datum, datumIndex) => ({
          index: datumIndex,
          direction,
          sort: datum[orderBy],
          color: datum.color,
          label: datum[config.categoryAxis.indicator],
          value: datum[config.linearAxis.indicator] * direction,
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
