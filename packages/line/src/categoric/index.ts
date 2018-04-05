import {Plots} from 'plottable';
import { createCategoricChart, CategoricChart, LinearAxis, CategoryAxis} from '@devinit-charts/core/lib/categoric';
import createLineTipper from '../tooltip';
import { Tooltip, Labeling} from '@devinit-charts/core/lib/types';
import {LegendConfig} from '@devinit-charts/core/lib/legend';

export interface Config {
  title?: string;
  colors?: string[];
  categoryAxis: CategoryAxis;
  tooltips?: Tooltip;
  labeling?: Labeling;
  coloring?: string;
  linearAxis: LinearAxis;
  legend?: LegendConfig;
  groupBy: string;
}

type LinePlot = Plots.Line<any>;

export const createLineChart = (element: string | HTMLElement, plot: LinePlot, config: Config): CategoricChart => {
  const {
    categoryAxis,
    linearAxis,
    tooltips = {
      enable: true,
    }
  } = config;

  const chart: CategoricChart = createCategoricChart({
    element,
    plot,
    config: {
      categoryAxisOpts: {
        // TODO: Fix [https://github.com/palantir/plottable/issues/747](#747)
        // Temporary work around for [https://github.com/palantir/plottable/issues/747](#747)
        // Issue: AreaPlot / LinePlot should default to no padding on xScale
        innerPadding: 999,
        ...categoryAxis,
      },
      linearAxisOpts: {indicator: linearAxis.indicator, ...linearAxis},
      groupBy: config.groupBy,
      colors: config.colors,
      coloring: config.coloring,
      labeling: {showLabels: false, ...config.labeling}
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
