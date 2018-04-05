import * as Plottable from 'plottable';
import { groupBy as group, keys, values, mapValues } from 'lodash';
import { createTitle } from '@devinit-charts/core/lib/title';
import { createChartTable } from '@devinit-charts/core/lib/table';
import { createColorLegend } from '@devinit-charts/core/lib/legend';
import { createLinearAxisGridLines} from '@devinit-charts/core/lib/axes/grid';
import { createPlotWithGridlines } from '@devinit-charts/core/lib/categoric';
import { createNumericAxis, createTimeAxis, AxisConfig, TimeAxisConfig } from '@devinit-charts/core/lib/axes';
import { createLinearScale, createTimeScale } from '@devinit-charts/core/lib/scale';
import createLineTipper from '../tooltip';
import createScaleAnimator from '@devinit-charts/core/lib/animator/scale';
import { createPlotAreaWithAxes, createTimePlot } from './utils';
import { LinearAxis } from '@devinit-charts/core/lib/categoric';
import { Labeling, TimeAxisOpts} from '@devinit-charts/core/lib/types';
import createTimeAnchor from './anchor';
import {LegendConfig} from '@devinit-charts/core/lib/legend';
import { XAlignment } from 'plottable';

export interface Config {
  title?: string;
  titleAlignment?: XAlignment;
  groupBy: string;
  colors: string[];
  coloring?: string;
  labeling?: Labeling;
  showGridLines?: boolean;
  time: any;
  linearAxis: LinearAxis;
  timeAxis: TimeAxisOpts & { axisMinimum?: number; axisMaximum?: number};
  anchor?: any;
  legend?: LegendConfig;
}

export default ( element: string, plot, config: Config) => {
  const {
    titleAlignment = 'left',

    groupBy,

    colors = [],

    labeling,

    time = {
      interpolate: false,
    },

    // showLabels = true,
    showGridLines = false,

    linearAxis,

    timeAxis,

    anchor,

    legend,
  } = config;
  const linearScaleOpts = {axisMaximum: linearAxis.axisMaximum, axisMinimum: linearAxis.axisMinimum};
  const timeScale = createTimeScale((timeAxis as TimeAxisConfig));
  const linearScale = createLinearScale(linearScaleOpts);
  const colorScale = new Plottable.Scales.Color();

  const table = createChartTable({
    title: createTitle({ title: config.title, titleAlignment }),

    chart: createPlotAreaWithAxes({
      plotArea: createPlotWithGridlines({
        plot: createTimePlot({
          plot,
          timeScale,
          linearScale
        }),
        grid: createLinearAxisGridLines({
          ticking: linearAxis && linearAxis.ticking,
          showGridlines: showGridLines,
          orientation: 'vertical',
          scale: linearScale,
        }),
      }),

      linearAxis: createNumericAxis({
        ...(linearAxis as AxisConfig),
        axisScale: linearScale,
        axisOrientation: 'vertical',
      }),

      categoryAxis: createTimeAxis({
        ...(timeAxis as TimeAxisConfig ),
        axisScale: timeScale,
      }),

      anchor,
    }),

    legend: createColorLegend(colorScale, legend || {}),

    legendPosition: legend && legend.position || 'bottom',
  });

  const animate = createScaleAnimator(500);

  const listeners: any[] = [];

  plot.onAnchor(createLineTipper(element, labeling || {}, timeScale));

  let moveAnchor: (year: string) => void;

  table.addClass('time');

  table.renderTo(element);

  if (anchor) {
    const onTableAnchored = _table => {
      // waiting till table is setup, hopefully 500ms will
      // always be sufficient
      // TODO: Use onRender event instead
      // see https://github.com/palantir/plottable/issues/1755
      setTimeout(() => {
        moveAnchor = createTimeAnchor({table: _table, timeScale, anchor, legend, listeners});
      }, 500);
    };

    table.onAnchor(onTableAnchored);
  }

  const chart = {
    table,

    update: (data = []) => {
      const groups = mapValues(
        group(data, datum => datum[groupBy]),
        (items, key, map) => {
          const index = keys(map).indexOf(key);
          return group(
            items.map(item => ({
              group: item[groupBy],
              label: item[timeAxis.indicator],
              value: item[linearAxis.indicator],
              color: config.coloring && item[config.coloring] || colors[index] || 'grey',
              opacity: 1,
            })),
            item => item.label
          );
        }
      );

      const groupIds = keys(groups).sort((a, b) => a > b ? -1 : 1);

      if (legend && legend.showLegend) {
        colorScale
          .domain(groupIds.map(groupId => groupId || 'Unknown'))
          .range(groupIds.map((_d, i) => colors[i] || 'grey'));
      }

      const datasets = groupIds.map((groupId, index) => {
        const dataset: {[year: string]: any[]} = groups[groupId];

        if (!time.interpolate) {
          const years = keys(dataset).map(year => +year);

          const startYear = timeAxis.axisMinimum || Math.min.apply(null, years);
          const stopYear = timeAxis.axisMaximum || Math.max.apply(null, years);

          for (let year = startYear; year <= stopYear; year++) {
            if (!dataset[year]) {
              dataset[year] = [
                {
                  group: groupId,
                  label: year,
                  value: 0,
                  color: colors[index] || 'grey',
                  opacity: 1,
                },
              ];
            }
          }
        }

        return values(dataset)
          .map(list => list.reduce((s: any, d: any) => ({ ...s, value: s.value + d.value })));
      });

      if (plot.datasets().length) {
        const sums: number[] = [];

        for (let i = 0; i < Math.max.apply(null, datasets.map(d => d.length)); i += 1) {
          sums[i] = datasets.reduce((sum, set: any) => sum + (set[i] ? set[i].value : 0), 0);
        }

        const axisMaximum = Math.max.apply(null, sums);

        animate([linearScale], [linearAxis.axisMinimum || 0, axisMaximum]);
      }

      plot.datasets(datasets.map(d => new Plottable.Dataset(d)));
    },

    onAnchorMoved: (callback: any = null) => {
      if (callback && callback.call) {
        listeners.push(callback);
      }
    },

    moveAnchor: year => {
      if (!moveAnchor) {
        // Retry if anchor is not ready
        setTimeout(() => moveAnchor(year.toString()), 200);
      } else {
        moveAnchor(year);
      }
    },

    destroy: () => {
      table.destroy();
    },
  };

  return chart;
};
