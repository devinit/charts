import Plottable from "plottable";

export const createChartTable = ({title, chart, legend, legendPosition = 'bottom'}) => {

  const chartWithLegend = legendPosition === 'bottom' ?
    new Plottable.Components.Table([[chart], [legend]]) :
    new Plottable.Components.Table([[chart, legend]]);

  const chartTable = new Plottable.Components.Table([[title], [chartWithLegend]]);

  chartTable.rowPadding(20);

  return chartTable;
};