import {Plots} from 'plottable';
import { createCategoricChart, CategoricChart, CategoricConfig} from '@devinit-charts/core/lib/categoric';
import createLineTipper from '../tooltip';
import { Tooltip} from '@devinit-charts/core/lib/types';

export type Config = CategoricConfig & {
  tooltips?: Tooltip;
};

type LinePlot = Plots.Line<any>;

export const createLineChart = (element: string | HTMLElement, plot: LinePlot, config: Config): CategoricChart => {
  const {
    categoryAxis,
    linearAxis,
    labeling,
    coloring,
    colors,
    groupBy,
    tooltips = {
      enable: true,
    }
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
      linearAxis,
      groupBy,
      colors,
      coloring,
      labeling
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
