import * as Plottable from 'plottable';
import createScatterChart from '../factories/scatter';
import {Annotation} from '../factories/scatter/annotations';
import { Legend } from 'plottable/build/src/components';

/**
 * @typedef {ScatterChart} Bubble
 * @public
 * @property {'bubble'} type
 *
 */
export interface Axis {
  showAxis: boolean;
  axisLabel: string;
  indicator: string;
  axisMinimum: number;
  axisMaximum: number;
  showGridlines: boolean;
}
export interface Bubble {
  indicator: string;
  label: string;
}
export interface Legend {
  showLegend: boolean;
}
export interface Tooltips {
  enable: boolean;
  titleIndicator: string;
}
export interface Config {
  type: 'bubble';
  title: string;
  colors: string[];
  groupBy: string;
  horizontalAxis: Axis;
  verticalAxis: Axis;
  bubble: Bubble;
  legend: Legend;
  annotations?: Annotation;
  tooltips: Tooltips;
}
export default (element: HTMLElement, data: any, config: Config) => {
  const plot = new Plottable.Plots.Scatter();

  // ... apply scatter configuration

  const chart = createScatterChart({ element, plot, config });

  chart.update(data);

  return chart;
};
