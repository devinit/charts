import Plottable from 'plottable';

export const createPlotWithGridlines = ({ plot, grid }) => {
  return grid ? new Plottable.Components.Group([grid, plot]) : plot;
};

export const createLinearPlot = ({plot, categoryScale, linearScale, showLabels}, modify) => {
  if (showLabels && plot.labelsEnabled) {
    plot.labelsEnabled(showLabels);
  }

  return plot
    .attr('class', d => `${d.group} ${d.subGroup}`)
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .x(d => modify(d.value), linearScale)
    .y(d => d.index, categoryScale);
};

export const createPlotAreaWithAxes = (components) => {
  const {
    leftLinearAxis,
    rightLinearAxis,
    leftPlotArea,
    rightPlotArea,
    leftCategoryAxis,
    rightCategoryAxis,
    dualSidebar,
  } = components;

  const leftBar = new Plottable.Components.Table([
    [rightCategoryAxis, rightPlotArea],
    [null, rightLinearAxis],
  ]);

  const rightBar = new Plottable.Components.Table([
    [leftPlotArea, leftCategoryAxis],
    [leftLinearAxis, null],
  ]);

  const barTable = new Plottable.Components.Table([[rightBar, leftBar]]);

  const table = new Plottable.Components.Table([
    [new Plottable.Components.Table(), barTable, new Plottable.Components.Table()],
  ]);

  barTable.columnPadding(dualSidebar.gutter);

  table.columnWeight(0, 1);
  table.columnWeight(1, 3);
  table.columnWeight(2, 1);

  return table;
};