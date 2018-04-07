import { Gridlines, Table, Group } from 'plottable/build/src/components';
import { Plot, Components, Component, } from 'plottable';

export interface XComponent {
  leftLinearAxis?: Component;
  rightLinearAxis?: Component;
  leftPlotArea: Plot | Group;
  rightPlotArea: Plot | Group;
  leftCategoryAxis?: Component;
  rightCategoryAxis?: Component;
  right?: Component;
  dualSidebar: {gutter: number};
}

export interface Args {
  plot: Plot;
  grid?: Gridlines;
}

export const createPlotWithGridlines = (args: Args) => {
  return args.grid ? new Components.Group([args.grid, args.plot]) : args.plot;
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

export const createPlotAreaWithAxes = (components: XComponent ): Table => {
  const leftBar = new Components.Table([
    [components.right, components.rightPlotArea],
    [null, components.rightLinearAxis],
  ]);

  const rightBar = new Components.Table([
    [components.leftPlotArea, components.leftCategoryAxis],
    [components.leftLinearAxis, null],
  ]);

  const barTable = new Components.Table([[rightBar, leftBar]]);

  const table = new Components.Table([
    [new Components.Table(), barTable, new Components.Table()],
  ]);

  barTable.columnPadding(components.dualSidebar.gutter);

  table.columnWeight(0, 1);
  table.columnWeight(1, 3);
  table.columnWeight(2, 1);

  return table;
};
