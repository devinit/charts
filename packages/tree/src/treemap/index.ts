import * as Plottable from 'plottable';
import { treemap } from 'd3';
import {Tooltip} from '@devinit-charts/core/lib/types';
import { createTreeHierachy } from '@devinit-charts/core/lib/dataset';
import { createTreeChartLabeler } from '@devinit-charts/core/lib/labeler';
import createTreeTipper from '../tooltip';
import createPercentageCalculator from './percentage';
import createTreemapOnClickListener from './click';
import createTilingMethod from './tiling';
import {TreeOpts} from '../types';
import createRectangleChart, { createColorFiller, Config as RConfig, TRectangle } from '../rectangle';

/**
 * @typedef {TreeChart} Treemap
 * @public
 * @property {'treemap'} type
 * @property {Tiling} tiling - Tiling
 *
 */

export interface Tiling {
  method: string;
  ratio: number;
}

export type Config = RConfig & {
  colors?: string[];
  coloring?: string;
  tree: TreeOpts,
  tiling: Tiling;
  tooltips: Tooltip;
};

export default (element: HTMLElement, data: any[] = [], config: Config): TRectangle => {
  const {
    orientation = 'vertical',

    tooltips = {
      enable: true,
    },

  } = config;
  if (!element.parentElement) throw new Error ('null parentElement');
  const width = element.parentElement.clientWidth;
  const height = element.parentElement.clientHeight;
  const calculatePercentage = createPercentageCalculator(width, height);

  const plot = new Plottable.Plots.Rectangle();

  const treeTipper = createTreeTipper(element, config.labeling, calculatePercentage);

  plot.onAnchor(_plot => {
    if (tooltips.enable) {
      setTimeout(() => {
        treeTipper(_plot);
      }, 500);
    }
  });

  (plot as any)._drawLabels = createTreeChartLabeler(config.labeling, calculatePercentage);

  // ... apply rectangle configuration

  const treeChart = createRectangleChart( element, plot,  config);

  const listeners: any[] = [];

  const tilingMethod = createTilingMethod(config.tiling);

  const layout = treemap()
    .tile(tilingMethod)
    .size([width, height]);

  const colorize = createColorFiller(config.colors, config.coloring);

  const update = _data => {
    const root = colorize(createTreeHierachy(_data, config.tree)
      .sort((a: any, b: any) => b.value - a.value));
    treeChart.update(layout(root).leaves());
  };

  const chart = {
    ...treeChart,

    onClick: callback => {
      listeners.push(callback);
    },

    setLabeling(sLabeling) {
      (plot as any)._drawLabels = createTreeChartLabeler(sLabeling, calculatePercentage);
      (plot as any)._drawLabels();
    },

    update,
  };

  treeChart.onClick(createTreemapOnClickListener({
    orientation,
    width,
    height,
    listeners
  }));

  chart.update(data);

  return chart;
};
