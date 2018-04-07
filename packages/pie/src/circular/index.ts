import * as Plottable from 'plottable';
import { createTitle } from '@devinit-charts/core/lib/title';
import { createColorLegend, LegendConfig } from '@devinit-charts/core/lib/legend';
import { createChartTable } from '@devinit-charts/core/lib/table';
import {Tooltip, Labeling} from '@devinit-charts/core/lib/types';
import createTooltips from '../tooltip';
import { createCircularPlot, Config as CPConfig } from './helpers';
import { XAlignment } from 'plottable';

/**
 * @typedef {Object} CircularChart - Circular chart configuration
 * @property {string} type - Type
 * @property {string} title - Title of chart
 * @property {string[]} colors - Colors
 * @property {indicator} coloring - Color Indicator
 * @property {Circular} circular - Sectors
 * @property {ColorLegend} legend - Legend
 */

/**
 * @typedef {Object} Circular - Sector configuration
 * @property {indicator} label - Label indicator
 * @property {indicator} value - Sector indicator
 * @property {number} innerRadius - Inner Radius (0 - 100%)
 * @property {number} strokeWidth - Stroke Width
 * @property {string} strokeColor - Stroke Color
 */

export interface CircularChartResult {
  table: Plottable.Components.Table;
  update: (data: any) => void;
  destroy: () => void;
}

export interface CircularChartArgs {
  element: string | HTMLElement;
  plot: Plottable.Plot;
  config: any;
}

export type CircularChart = (CreateCategoricChartArgs)  => CircularChartResult;

export interface CircularOpts {
  label?: string;
  value?: string;
  innerRadius?: number;
  strokeWidth?: number;
  strokeColor?: string;
  showLabels?: boolean;
}

export interface Config {
  title?: string;
  titleAlignment?: XAlignment;
  colors?: string[];
  coloring?: string;
  labeling?: Labeling;
  circular?: CircularOpts;
  legend?: LegendConfig;
  tooltips?: Tooltip;
}

const circularChart = ( element: HTMLElement, plot, config: Config) => {
  const {
    titleAlignment = 'left',

    colors = [],

    labeling = {
      showLabels: true,
      prefix: '',
      suffix: ''
    },

    circular = {
      label: 'label',
      value: 'value',
      innerRadius: 0,
      strokeWidth: 0,
      strokeColor: '#fff',
      showLabels: true
    },

    legend = {
      showLegend: false,
      position: 'bottom',
      alignment: 'center' as XAlignment,
    },
    tooltips = {enable: false}
  } = config;

  const colorScale = new Plottable.Scales.Color();

  const table = createChartTable({
    title: createTitle({title: config.title, titleAlignment }),
    chart: createCircularPlot({ plot, ...circular, labeling } as CPConfig),
    legend: createColorLegend(colorScale, legend),
    legendPosition: legend.position,
  });

  table.renderTo(element);

  plot.onAnchor(_plot => {
    setTimeout(() => {
      if (tooltips.enable) createTooltips(element)(_plot);
    }, 500);
  });

  const update = (data = []) => {
    const series = data.map((d, i) => ({
      label: d[circular && circular.label || ''], // make typescript happy
      value: parseFloat(d[circular.value || '']), // make typescript happy
      color: config.coloring && d[config.coloring] || colors[i] || 'grey',
    }));

    // TODO: Efficiently update legend
    if (legend.showLegend) {
      const domain = series.map(d => d.label);
      const range = series.map(d => d.color);
      colorScale.domain(domain).range(range);
    }

    plot.datasets([new Plottable.Dataset(series)]);
  };

  return {
    table,

    update,

    destroy: () => {
      table.destroy();
    },
  };
};

export default circularChart;
