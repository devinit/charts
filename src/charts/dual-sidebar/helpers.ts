import * as Plottable from 'plottable';

export interface Args {
  plot: any;
  grid: any;
}
export interface Components {
  leftLinearAxis: any;
  rightLinearAxis: any;
  leftPlotArea: string;
  rightPlotArea: string;
  leftCategoryAxis?: any;
  rightCategoryAxis?: any;
  dualSidebar: any;
  right?: any;
}
export const createPlotWithGridlines = (args: Args) => {
  return args.grid ? new Plottable.Components.Group([args.grid, args.plot]) : args.plot;
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

export const createPlotAreaWithAxes = (components: Components) => {
  const leftBar = new Plottable.Components.Table([
    [components.right, components.rightPlotArea],
    [null, components.rightLinearAxis],
  ]);

  const rightBar = new Plottable.Components.Table([
    [components.leftPlotArea, components.leftCategoryAxis],
    [components.leftLinearAxis, null],
  ]);

  const barTable = new Plottable.Components.Table([[rightBar, leftBar]]);

  const table = new Plottable.Components.Table([
    [new Plottable.Components.Table(), barTable, new Plottable.Components.Table()],
  ]);

  barTable.columnPadding(components.dualSidebar.gutter);

  table.columnWeight(0, 1);
  table.columnWeight(1, 3);
  table.columnWeight(2, 1);

  return table;
};
