import Plottable from "plottable";
import approximate from "approximate-number";
import {createChartTable} from "../factories/createTable";
import {createTitle} from "../factories/createTitle";
import {makeUnique} from "../factories/createDataset";
import {createCategoryScale, createLinearScale} from "../factories/createScale";
import {createCategoryAxis, createNumericAxis} from "../factories/createAxis";
import {createLinearAxisGridLines} from "../factories/createGrid";

/**
 * @typedef {LinearCategoryChart} DualSidebar
 * @public
 * @property {'dual-sidebar'} type
 * @property {'indicator'} splitBy
 * @property {number} splitBy
 *
 */

/**
 * @typedef {Object} DualSidebarConfig
 * @property {number} gutter=100 - Gutter
 */

export default (element, data, config) => {

  const leftPlot = new Plottable.Plots.Bar(config.orientation);
  const rightPlot = new Plottable.Plots.Bar(config.orientation);

  const {

    title = null,

    titleAlignment = 'left',

    orientation = 'horizontal',

    splitBy,

    groupBy,

    subGroupBy,

    colors = [],

    coloring = null,

    showLabels = false,

    linearAxis,

    categoryAxis,

    dualSidebar = {
      gutter: 100
    }

    // ... more config

  } = config;

  const leftCategoryScale = createCategoryScale(categoryAxis);
  const rightCategoryScale = createCategoryScale(categoryAxis);

  const leftLinearScale = createLinearScale({
    ...linearAxis,
    axisMinimum: linearAxis.axisMaximum && -linearAxis.axisMaximum,
    axisMaximum: linearAxis.axisMinimum && -linearAxis.axisMinimum
  });
  const rightLinearScale = createLinearScale(linearAxis);

  const table = createChartTable({

    title: createTitle({title, titleAlignment}),

    chart: createPlotAreaWithAxes({

      leftPlotArea: createPlotWithGridlines({
        plot: createLinearPlot({
          plot: leftPlot,
          orientation,
          categoryScale: leftCategoryScale,
          linearScale: leftLinearScale,
          showLabels
        }),
        grid: createLinearAxisGridLines({...linearAxis, orientation, scale: leftLinearScale})
      }),

      rightPlotArea: createPlotWithGridlines({
        plot: createLinearPlot({
          plot: rightPlot,
          orientation,
          categoryScale: rightCategoryScale,
          linearScale: rightLinearScale,
          showLabels
        }),
        grid: createLinearAxisGridLines({...linearAxis, orientation, scale: rightLinearScale})
      }),

      leftLinearAxis: createNumericAxis({
        ...linearAxis,
        axisScale: leftLinearScale,
        axisOrientation: orientation,
        absolute: true
      }),

      rightLinearAxis: createNumericAxis({
        ...linearAxis,
        axisScale: rightLinearScale,
        axisOrientation: orientation,
        absolute: true
      }),

      leftCategoryAxis: createCategoryAxis({
        showAxis: false,
        axisScale: leftCategoryScale,
        ticking: 'none',
        axisDirection: 'right',
      }),

      rightCategoryAxis: createCategoryAxis({
        showAxis: false,
        axisScale: rightCategoryScale,
        ticking: 'none',
        axisDirection: 'left',
      }),

      dualSidebar,

    }),
  });

  table.renderTo(element);

  leftPlot._drawLabels = drawLabels(dualSidebar);
  rightPlot._drawLabels = drawLabels(dualSidebar);

  const chart = {

    table,

    addData: (data = []) => {

      const plots = [leftPlot, rightPlot];

      const splittingIds = makeUnique(data.map(d => d[splitBy]));
      const groupIds = makeUnique(data.map(d => d[groupBy]));
      const subGroupIds = groupIds.map(groupId => makeUnique(
        data
          .filter(d => d[groupBy] === groupId)
          .map(d => d[subGroupBy])
          .sort((a, b) => a > b ? 1 : -1)
        )
      );

      splittingIds.slice(0, 2)
        .sort((a, b) => a > b ? 1 : -1)
        // Split data into split sides
        .map(splitPoint => data.filter(d => d[splitBy] === splitPoint))
        .map(sides =>

          groupIds
          // Create groups for each split side
          // Makes sure each side has same number
          // groups
            .map(groupId => sides.filter(d => d[groupBy] === groupId))
            // Creates subgroups for each group
            .map((group, groupIndex) =>

              subGroupIds[groupIndex].map(subGroupId =>
                group
                  .filter(item => item[subGroupBy] === subGroupId)
              )
            )
        )

        // Joins sides into [left, right]
        .reduce(([sides = []], side) => [[...sides, side]], [])

        // Makes sure subgroups on each side have same number of items
        // Creates a dummy items for either subgroup with less number
        // of items
        .map(([left, right]) => {

          groupIds.forEach((groupId, groupIndex) =>

            subGroupIds[groupIndex].forEach((subGroupId, subGroupIndex) => {
              const leftSubgroupLength = left[groupIndex][subGroupIndex].length;
              const rightSubgroupLength = right[groupIndex][subGroupIndex].length;

              if (leftSubgroupLength > rightSubgroupLength) {
                for (let i = rightSubgroupLength; i < leftSubgroupLength; i++) {
                  right[groupIndex][subGroupIndex].push({
                    ...left[groupIndex][subGroupIndex][i],
                    [categoryAxis.indicator]: '',
                    [linearAxis.indicator]: 0,
                  })
                }
              }

              else if (leftSubgroupLength < rightSubgroupLength) {
                for (let j = leftSubgroupLength; j < rightSubgroupLength; j++) {
                  left[groupIndex][subGroupIndex].push({
                    ...right[groupIndex][subGroupIndex][j],
                    [categoryAxis.indicator]: '',
                    [linearAxis.indicator]: 0,
                  })
                }
              }

            })
          );

          return [left, right];

        })
        .reduce((all, groups) => [...all, ...groups], [])
        .forEach((groups, index) => {

          const direction = index === 0 ? -1 : 1;

          const series = groups.reduce((groups, group, groupIndex) => [

            ...groups,

            ...group.reduce((group, subGroup) => [

              ...group,

              ...subGroup.map(item => ({

                ...item,

                direction: direction,

                color: item[coloring] || colors[groupIndex] || '#abc',

              }))

            ], [])

          ], []);

          const dataset = series.map((item, index) => ({

            ...item,

            label: index,
            value: item[linearAxis.indicator] * direction,
            opacity: 1,
            group: item[groupBy],
            subGroup: item[subGroupBy],
            name: item[categoryAxis.indicator],
          }));

          plots[index].datasets([dataset].map(d => new Plottable.Dataset(d)))

        });
    },

  };

  chart.addData(data);

  return chart;
};

const drawLabels = (dualSidebar) => function () {
  const entities = this.entities();
  const foreground = this.foreground();
  const data = entities.map(entity => entity.datum);
  const direction = data[0] && data[0].direction;

  foreground.attr('style', 'overflow: visible');
  foreground.selectAll('text').remove();

  makeUnique(data.map(d => d.group))
    .map(groupId => {

      const groupEntities = entities
        .filter(entity => entity.datum.group === groupId);

      if (direction > 0 && groupEntities.length) {

        const nodes = groupEntities
          .map(entity => entity.selection.node());

        //noinspection JSUnresolvedFunction
        const bBoxes = nodes.map(selection => selection.getBBox());

        const top = Math.min.apply(null, bBoxes.map(box => box.y));

        foreground
          .append('text')
          .text(groupId)
          .attr('class', 'group-label')
          .attr('x', dualSidebar.gutter * -0.5)
          .attr('y', top - 5)
          .attr('text-anchor', 'middle');

        makeUnique(groupEntities.map(entity => entity.datum.subGroup))
          .map(subGroupId => {

            const subGroupEntities = groupEntities.filter(entity => entity.datum.subGroup === subGroupId);

            const nodes = subGroupEntities
              .map(entity => entity.selection.node());

            const bBoxes = nodes.map(selection => selection.getBBox());

            const top = Math.min.apply(null, bBoxes.map(box => box.y));
            const bottom = Math.max.apply(null, bBoxes.map(box => box.y + box.height));

            const y = top + 5 + (bottom - top) / 2;

            foreground
              .append('text')
              .text(subGroupId)
              .attr('class', 'subGroup-label')
              .attr('x', dualSidebar.gutter * -0.5)
              .attr('y', y)
              .attr('text-anchor', 'middle');

          });
      }
    });

  entities
    .forEach(entity => {
      const datum = entity.datum;

      // Don't draw labels if datum has no name
      if (datum.name) {
        const bBox = entity.selection.node().getBBox();

        foreground
          .append('text')
          .text(datum.name)
          .attr('class', 'data-label')
          .attr('x', (datum.direction > 0 ? bBox.x + bBox.width : bBox.x) + (datum.direction * 10))
          .attr('y', bBox.y + 3 + bBox.height / 2)
          .attr('text-anchor', datum.direction > 0 ? 'start' : 'end');
      }
    });
};

export const createPlotWithGridlines = ({plot, grid}) => {
  return grid ? new Plottable.Components.Group([grid, plot]) : plot
};

export const createLinearPlot = ({plot, categoryScale, linearScale, showLabels}) => {
  if (showLabels && plot.labelsEnabled) {
    plot
      .labelFormatter(d => approximate(Math.abs(d)))
      .labelsEnabled(showLabels)
  }

  return plot
    .attr('class', d => `${d.group} ${d.subGroup}`)
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .x(d => d.value, linearScale)
    .y(d => d.label, categoryScale);
};

const createPlotAreaWithAxes = ({leftLinearAxis, rightLinearAxis, leftPlotArea, rightPlotArea, leftCategoryAxis, rightCategoryAxis, dualSidebar}) => {
  const leftBar = new Plottable.Components.Table([
    [rightCategoryAxis, rightPlotArea,],
    [null, rightLinearAxis]
  ]);

  const rightBar = new Plottable.Components.Table([
    [leftPlotArea, leftCategoryAxis],
    [leftLinearAxis, null]
  ]);

  const barTable = new Plottable.Components.Table([
    [rightBar, leftBar]
  ]);

  const table = new Plottable.Components.Table([
    [
      new Plottable.Components.Table(),
      barTable,
      new Plottable.Components.Table(),
    ],
  ]);

  barTable.columnPadding(dualSidebar.gutter);

  table.columnWeight(0, 1);
  table.columnWeight(1, 3);
  table.columnWeight(2, 1);

  return table;
};
