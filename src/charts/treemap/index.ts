import * as Plottable from 'plottable';
import { treemap } from 'd3';
import createRectangleChart, { createColorFiller, Legend } from '../../factories/tree';
import { createTreeHierachy } from '../../factories/dataset';
import { createTreeChartLabeler } from '../../factories/labeler';
import { createTreeTipper } from '../../factories/tooltips';
import createPercentageCalculator from './percentage';
import createTreemapOnClickListener from './click';
import createTilingMethod from './tiling';

/**
 * @typedef {TreeChart} Treemap
 * @public
 * @property {'treemap'} type
 * @property {Tiling} tiling - Tiling
 *
 */
export interface Tree {
  id: string;
  parent: string;
  value: string;
}
export interface Labeling {
  suffix: string;
  showLabels: boolean;
  showValues: boolean;
  showPercents: boolean;
  autofit: any;
  prefix: string;
}
export interface Tiling {
  method: string;
  ratio: number;
}
export interface Tooltips {
  enable: boolean;
}
export interface Config {
  orientation: string;
  type: 'treemap';
  coloring?: string;
  colors: any;
  width: number;
  height: number;
  tree: Tree;
  labeling: Labeling;
  tiling: Tiling;
  tooltips: Tooltips;
  legend: Legend;
}
export default (element, data = [], config: Config) => {
  const {
    orientation = 'vertical',

    tooltips = {
      enable: true,
    },

  } = config;
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

    setLabeling(_labeling) {
      (plot as any)._drawLabels = createTreeChartLabeler(_labeling, calculatePercentage);
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
