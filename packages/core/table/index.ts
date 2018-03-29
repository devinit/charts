import * as Plottable from 'plottable';
import { TitleLabel } from 'plottable/build/src/components';

export interface CreateChartTableArgs {
  title?: TitleLabel;
  chart: any;
  legend?: any;
  legendPosition?: string;

}

export const createChartTable = ({
  title, chart, legend, legendPosition = 'bottom'
}: CreateChartTableArgs) => {
  const chartWithLegend = !legend
    ? chart
    : legendPosition === 'bottom'
      ? new Plottable.Components.Table([[chart], [legend]])
      : new Plottable.Components.Table([[chart, legend]]);

  const chartTable = new Plottable.Components.Table([[title], [chartWithLegend]]);

  if (title) {
    chartTable.rowPadding(20);
  }

  return chartTable;
};
