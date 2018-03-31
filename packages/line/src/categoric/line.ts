import {Plot} from 'plottable';
import { createCategoricChart,  CategoricChart} from '@devinit-charts/core/lib/categoric';
import createLineTipper from '../tooltip';
import { Tooltip, Labeling } from '@devinit-charts/core/lib/types';
import {Config as Legend} from '@devinit-charts/core/lib/legend';

export interface LinearAxis  {
  showAxis: boolean;
  showGridlines: boolean;
  indicator: string;
  axisLabel: string;
  ticking?: string;
}
export interface Config {
  title: string;
  type: string;
  colors: string[];
  categoryAxis?: any;
  tooltips?: Tooltip;
  labeling?: Labeling;
  linearAxis: any;
  legend?: Legend;
  groupBy?: string;
}
export const createLineChart = (element: string | HTMLElement, plot: Plot, config: Config): CategoricChart => {
  const {
    categoryAxis = {},
    tooltips = {
      enable: true,
    },
    ...more
  } = config;

  const chart: CategoricChart = createCategoricChart({
    element,
    plot,
    config: {
      categoryAxis: {
        // TODO: Fix [https://github.com/palantir/plottable/issues/747](#747)
        // Temporary work around for [https://github.com/palantir/plottable/issues/747](#747)
        // Issue: AreaPlot / LinePlot should default to no padding on xScale
        innerPadding: 999,

        ...categoryAxis,
      },

      ...more,
    },
  });

  const { categoryScale } = chart;

  plot.onAnchor(_plot => {
    if (tooltips.enable && config.labeling) {
      return createLineTipper(element as string, config.labeling, categoryScale)(_plot);
    }
  });

  return chart;
};
