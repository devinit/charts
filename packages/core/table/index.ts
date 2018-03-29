import {Components, Component} from 'plottable';
import { TitleLabel } from 'plottable/build/src/components';

export interface CreateChartTableArgs {
  title?: TitleLabel;
  chart: Component;
  legend?: Component;
  legendPosition?: string;
}

export const createChartTable = (args: CreateChartTableArgs) => {
  const {
    title, chart, legend, legendPosition = 'bottom'
  } = args;
  const chartWithLegend = !legend
    ? chart
    : legendPosition === 'bottom'
      ? new Components.Table([[chart], [legend]])
      : new Components.Table([[chart, legend]]);

  const chartTable = new Components.Table([[title], [chartWithLegend]]);

  if (title) {
    chartTable.rowPadding(20);
  }

  return chartTable;
};
