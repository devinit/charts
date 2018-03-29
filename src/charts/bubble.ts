import * as Plottable from 'plottable';
import createScatterChart, {Config as SConfig} from '../factories/scatter';
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
export type Config = SConfig & {
  type: 'bubble';
};

export default (element, data: any, config: Config) => {
  const plot = new Plottable.Plots.Scatter();

  // ... apply scatter configuration

  const chart = createScatterChart(element, plot, config);

  chart.update(data);

  return chart;
};
