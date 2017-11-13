import Plottable from 'plottable';

export const createChartTable = ({
  title, chart, legend = null, legendPosition = 'bottom'
}) => {
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
