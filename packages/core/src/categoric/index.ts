/**
 * TODO: refactor along the lines of line & bar chart
 */
import {Scales, Components, XAlignment, Plots, Dataset} from 'plottable';
import {approximate} from '@devinit/prelude/lib/numbers';
import { createChartTable } from '../table';
import { createTitle } from '../title';
import { createColorLegend, LegendConfig } from '../legend';
import { makeUnique } from '../dataset';
import { createCategoryScale, createLinearScale, LinearScale, CategoryScale } from '../scale';
import { createCategoryAxis, CategoryAxisConfig, NumericConfigAxis, createNumericAxis } from '../axes';
import { createLinearAxisGridLines } from '../axes/grid';
import createScaleAnimator from '../animator/scale';
import { Labeling } from '../types';

export interface CategoricChart {
  linearScale: Scales.Linear;
  categoryScale: Scales.Category;
  colorScale: Scales.Color;
  table: Components.Table;
  update: (data: any) => void;
  destroy: () => void;
}

export type NumericAxisOpts = NumericConfigAxis & {indicator: string};

export type CategoryAxisOpts = CategoryAxisConfig & {indicator: string};

export interface CategoricConfig {
  title?: string;
  titleAlignment?: XAlignment;
  orientation?: string;
  groupBy: string;
  colors?: string[];
  coloring?: string;
  labeling: Labeling;
  linearScaleOpts?: LinearScale;
  linearAxisOpts: NumericAxisOpts;
  categoryAxisOpts: CategoryAxisOpts;
  categoryScaleOpts?: CategoryScale;
  legend?: LegendConfig & {position: XAlignment};
}

export type BarPlot = Plots.Bar<any, any>;
export type LinePlot =  Plots.Line<any>;

export interface CreateCategoricChartArgs {
  element: string | HTMLElement;
  plot: BarPlot | LinePlot;
  config: CategoricConfig;
}

export interface LinearPlotArgs {
  plot: BarPlot | LinePlot;
  orientation: string;
  categoryScale: Scales.Category;
  linearScale: Scales.Linear;
  labeling: Labeling;
}

export const createLinearPlot = (args: LinearPlotArgs) => {
  const {
    plot,
    orientation,
    categoryScale,
    linearScale,
    labeling,
  } = args;

  const {prefix, suffix, showLabels} = labeling;

  if ((plot as BarPlot).labelsEnabled && showLabels && !labeling.custom) {
    (plot as BarPlot)
      .labelFormatter(d => `${prefix}${approximate(d)}${suffix}`).labelsEnabled(true);
  }

  return (plot as BarPlot)
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .x(
      d => (orientation === 'vertical' ? d.label : d.value),
      orientation === 'vertical' ? categoryScale : linearScale,
    )
    .y(
      d => (orientation === 'horizontal' ? d.label : d.value),
      orientation === 'horizontal' ? categoryScale : linearScale,
    );
};

export const createPlotWithGridlines = ({ plot, grid }) => {
  return grid ? new Components.Group([grid, plot]) : plot;
};

const createPlotAreaWithAxes = (orientation, { linearAxis, plotArea, categoryAxis }) => {
  const plotAreaWithAxes =
    orientation === 'vertical'
      ? [[linearAxis, plotArea], [null, categoryAxis]]
      : [[categoryAxis, plotArea], [null, linearAxis]];

  return new Components.Table(plotAreaWithAxes);
};

export const createCategoricChart = (args: CreateCategoricChartArgs): CategoricChart => {
  const { element, plot, config } = args;
  const {
    title,

    titleAlignment = 'left',

    orientation = 'vertical',

    groupBy,

    colors = [],

    coloring = null,

    labeling,

    linearScaleOpts = {},

    categoryScaleOpts = {},

    legend,

    linearAxisOpts,

    categoryAxisOpts,
  } = config;

  const categoryScale = createCategoryScale(categoryScaleOpts);
  const linearScale = createLinearScale(linearScaleOpts);
  const colorScale = new Scales.Color();
  const linearAxis = createNumericAxis({
    ...(linearAxisOpts as NumericConfigAxis),
    axisScale: linearScale,
    axisOrientation: orientation,
  });
  const table = createChartTable({
    title: createTitle({ title, titleAlignment }),

    chart: createPlotAreaWithAxes(orientation, {
      plotArea: createPlotWithGridlines({
        plot: createLinearPlot({
          plot,
          orientation,
          categoryScale,
          linearScale,
          labeling,
        }),
        grid: createLinearAxisGridLines({orientation, scale: linearScale}),
      }),

      linearAxis,
      categoryAxis: createCategoryAxis({
        ...(categoryAxisOpts as CategoryAxisConfig),
        axisScale: categoryScale,
        axisOrientation: orientation,
      }),
    }),

    legend: createColorLegend(colorScale, legend || {}),

    legendPosition: legend && legend.position || 'bottom',
  });

  const animate = createScaleAnimator(500);

  table.renderTo(element);

  return {
    linearScale,

    categoryScale,

    colorScale,

    table,

    update: (data = []) => {
      const groupIds: any[] = makeUnique(data.map(d => d[groupBy]));

      if (legend && legend.showLegend) {
        const scaleDomain: string[] = groupIds.map(groupId => groupId || 'Unknown');
        colorScale
          .domain(scaleDomain)
          .range(groupIds.map((_d, i) => colors[i] || '#abc'));
      }

      const datasets = groupIds.map((groupId, index) =>
        data.filter(d => d[groupBy] === groupId).map(item => {
          return {
            group: groupId,
            label: item[categoryAxisOpts.indicator],
            value: item[linearAxisOpts.indicator],
            color: coloring && item[coloring] || colors[index] || 'grey',
            opacity: 1,
          };
        }));
      if (plot.datasets().length) { // TODO: when is this ever true ?? maybe uselses @ernest
        const sums: number[] = [];
        for (let i = 0; i < Math.max.apply(null, datasets.map(d => d.length)); i++) {
          sums[i] = datasets.reduce((sum, set) => sum + (set[i] ? set[i].value : 0), 0);
        }
        const axisMaximum = Math.max.apply(null, sums);

        animate([linearScale], [linearScaleOpts.axisMinimum || 0, axisMaximum]);
      }

      plot.datasets(datasets.map(d => new Dataset(d)));
    },

    destroy() {
      table.destroy();
    },
  };
};
