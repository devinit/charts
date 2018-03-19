import { createCategoricChart } from './index';
import { createLineTipper } from '../tooltips/index';

export const createLineChart = (element, plot, config) => {
  const {
    categoryAxis = {},
    tooltips = {
      enable: true,
    },
    ...more
  } = config;

  const chart = createCategoricChart({
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

  plot.onAnchor(plot => {
    if (tooltips.enable) {
      return createLineTipper(element, config.labeling, categoryScale, config.orientation)(plot);
    }
  });

  return chart;
};
