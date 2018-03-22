import {Plot} from 'plottable';
import { createCategoricChart,  CategoricChart} from '.';
import { createLineTipper } from '../tooltips';

export const createLineChart = (element: string | HTMLElement, plot: Plot, config: any): CategoricChart => {
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
    if (tooltips.enable) {
      return createLineTipper(element as string, config.labeling, categoryScale)(_plot);
    }
  });

  return chart;
};
