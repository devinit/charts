import * as Plottable from 'plottable';
import * as hash from 'object-hash';
import { Tooltip } from '@devinit-charts/core/lib/types';
import createTreeChart, { createColorFiller, Config as TConfig, Legend, TRectangle} from '../rectangle';
import { createTreeHierachy } from '@devinit-charts/core/lib/dataset';
import createScaleAnimator from '@devinit-charts/core/lib/animator/scale';
import {TreeOpts} from '../types';
import { createTreeChartLabeler, Config as Labeling } from '../labeler';
import createTreeTipper from '../tooltip';
import partition from './layout';
import createPercentageCalculator from './percentage';

/**
 * @typedef {TreeChart} Partition
 * @public
 * @property {'partition'} type
 * @property {('vertical'|'horizontal')} orientation=horizontal - Orientation
 *
 */

export type  Config = TConfig  & {
  orientation: string;
  colors?: string[];
  coloring?: string;
  tree: TreeOpts;
  legend: Legend;
  tooltips: Tooltip;
};

export type CallBack = (val: any) => void;

export type Partition = TRectangle & {
  onClick: (callback: CallBack) => void;
  setLabeling: (labeling: Labeling) => void;
};

export default (element: HTMLElement, data: any[], config: Config): Partition => {
  const {
    orientation = 'horizontal',

    tree,

    colors,

    coloring,

    tooltips = {
      enable: true,
    },

  } = config;

  if (!element.parentElement) throw Error ('html parent element is null');

  const width = element.parentElement.clientWidth;
  const height = element.parentElement.clientHeight;
  const calculatePercentage = createPercentageCalculator(width, height, config.orientation);

  const plot = new Plottable.Plots.Rectangle();

  const treeTipper = createTreeTipper(element, config.labeling, calculatePercentage);

  plot.onAnchor(_plot => {
    if (tooltips.enable) {
      // TODO: Replace with plottable onRender
      setTimeout(() => {
        treeTipper(_plot);
      }, 500);
    }
  });

  (plot as any)._drawLabels = createTreeChartLabeler(config.labeling, calculatePercentage);

  const treeChart = createTreeChart(
    element,
    plot,
    config
  );

  const layout = partition().size([
    orientation === 'vertical' ? width : height,
    orientation === 'vertical' ? height : width,
  ]);

  const colorize = createColorFiller(colors, coloring);

  const listeners: CallBack[] = [];

  const animate = createScaleAnimator(500);

  treeChart.onClick((entities, xScale, yScale) => {
    const entity = entities.pop();
    const datum = entity.datum;

    // TODO: Rethink orientation implementation for tree chats
    // It might be better to set a fixed orientation for each tree chart
    //
    const x = orientation === 'vertical' ? 'x' : 'y';
    const y = orientation === 'horizontal' ? 'x' : 'y';
    const x0 = `${x}0`;
    const y0 = `${y}0`;
    const x1 = `${x}1`;
    const y1 = `${y}1`;

    const max = (list, key) => Math.max.apply(null, list.map(d => d[key]));

    const xMax = orientation === 'horizontal' ? max(datum.descendants(), x1) : datum[x1];
    const xMin =
      orientation === 'horizontal' && datum.parent
        ? datum[x0] - ((xMax - datum[x0]) * 0.05)
        : datum[x0];
    const yMax = orientation === 'vertical' ? max(datum.descendants(), y1) : datum[y1];
    const yMin =
      orientation === 'vertical' && datum.parent
        ? datum[y0] - ((yMax - datum[y0]) * 0.05)
        : datum[y0];

    animate([xScale, yScale], [xMin, xMax], [yMin, yMax]).then(() => {
      listeners.forEach(callback => callback(datum));
    });
  });

  const update = _data => {
    const root = colorize(createTreeHierachy(_data, config.tree)
      .sort((a: any, b: any) => a.value - b.value));

    treeChart.update(layout(root)
      .descendants()
      .filter(d => d.depth <= tree.depth || Infinity));
  };

  const hashes = {
    labeling: hash(config.labeling),
  };

  const chart = {
    ...treeChart,

    onClick: callback => {
      listeners.push(callback);
    },

    setLabeling(labeling: Labeling) {
      const labelingHash = hash(labeling);

      if (hashes.labeling !== labelingHash) {
        (plot as any)._drawLabels = createTreeChartLabeler(labeling, calculatePercentage);
        // delay label redraw like plottable does
        setTimeout(() => (plot as any)._drawLabels(), 200);
        hashes.labeling = labelingHash;
      }
    },

    update,
  };

  chart.update(data);

  return chart;
};
