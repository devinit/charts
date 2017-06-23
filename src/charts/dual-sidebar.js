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
 *
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

    showLabels = false,

    linearAxis,

    categoryAxis,

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

    }),
  });

  let onAnchorMoved = d => d;

  table.onAnchor(() => setTimeout(() => createTimeAnchor(table, makeUnique(data.map(d => d.year)), onAnchorMoved)));

  table.renderTo(element);

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
                  .map(item => ({
                    group: item[groupBy],
                    subGroup: item[subGroupBy],
                    value: item[linearAxis.indicator],
                    name: item[categoryAxis.indicator],
                  }))
              )
            )
        )

        // Joins sides into [left, right]
        .reduce(([sides = []], side) => [[...sides, side]], [])

        // Makes sure subgroups on each side has same number of items
        // Creates a dummy items for either subgroup with less number
        // of items
        .map(([left, right]) => {

          groupIds.forEach((groupId, groupIndex) =>

            subGroupIds[groupIndex].forEach((subGroupId, subGroupIndex) => {
              const leftSubgroupLength = left[groupIndex][subGroupIndex].length;
              const rightSubgroupLength = right[groupIndex][subGroupIndex].length;
              const itemToAdd = {value: 0, name: '', group: groupId, subGroup: subGroupId};
              let numberOfItemsToAdd = Math.abs(leftSubgroupLength - rightSubgroupLength);

              while (numberOfItemsToAdd) {
                if (leftSubgroupLength > rightSubgroupLength) {
                  right[groupIndex][subGroupIndex].push(itemToAdd)
                } else {
                  left[groupIndex][subGroupIndex].push(itemToAdd)
                }

                numberOfItemsToAdd--;
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

                color: colors[groupIndex] || '#abc',

              }))

            ], [])

          ], []);

          const dataset = series.map((item, index) => {
            return {
              ...item,
              label: index,
              value: item.value * direction,
              opacity: 1,
            }
          });

          plots[index].datasets([dataset].map(d => new Plottable.Dataset(d)))

        });
    },

  };

  chart.addData(data);

  return chart;
};

const drawLabels = function () {
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
          .attr('x', -50)
          .attr('y', top - 5)
          .attr('text-anchor', 'middle');
      }
    });

  makeUnique(data.map(d => d.subGroup))
    .map(subGroupId => {

      const groupEntities = entities.filter(entity => entity.datum.subGroup === subGroupId);

      if (direction > 0) {

        const nodes = groupEntities
          .map(entity => entity.selection.node());

        const bBoxes = nodes.map(selection => selection.getBBox());

        const top = Math.min.apply(null, bBoxes.map(box => box.y));
        const bottom = Math.max.apply(null, bBoxes.map(box => box.y + box.height));

        const y = top + 5 + (bottom - top) / 2;

        foreground
          .append('text')
          .text(subGroupId)
          .attr('class', 'subGroup-label')
          .attr('x', -50)
          .attr('y', y)
          .attr('text-anchor', 'middle');
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

  plot._drawLabels = drawLabels;

  return plot
    .attr('class', d => `${d.group} ${d.subGroup}`)
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .x(d => d.value, linearScale)
    .y(d => d.label, categoryScale);
};

const createPlotAreaWithAxes = ({leftLinearAxis, rightLinearAxis, leftPlotArea, rightPlotArea, leftCategoryAxis, rightCategoryAxis}) => {
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

  barTable.columnPadding(100);

  table.columnWeight(0, 1);
  table.columnWeight(1, 3);
  table.columnWeight(2, 1);

  return table;
};

const createTimeAnchor = (table, timeScale, anchor, onAnchorMoved) => {

  // TODO:  Add anchor

  /*const originDate = new Date(timeScale.domainMin());
  const startDate = anchor.start ? new Date(anchor.start) : originDate;
  let currentYear = startDate.getFullYear().toString();

  const origin = timeScale.scaleTransformation(originDate);
  const start = timeScale.scaleTransformation(startDate);

  const chartArea = table.componentAt(1, 0);
  const plotArea = chartArea.componentAt(0, 0);
  const timeAxis = plotArea.componentAt(2, 1);

  const foreground = plotArea.foreground();

  foreground.attr('style', 'pointer-events: all');

  const foregroundBounds = foreground.node().getBoundingClientRect();
  const timeAxisBounds = timeAxis.content().node().getBoundingClientRect();

  const leftOffset = timeAxisBounds.left - foregroundBounds.left;

  const xPosition = leftOffset + start;
  const topPosition = 20;

  const circle = foreground.append('circle')
    .attr('class', 'symbol')
    .attr('cx', xPosition)
    .attr('cy', topPosition)
    .attr('fill', 'rgb(232, 68, 58)')
    .attr('stroke', '#aaa')
    .attr('r', 20);

  const text = foreground.append('text')
    .text(startDate.getFullYear().toString())
    .attr('class', 'symbol-label')
    .attr('x', xPosition)
    .attr('y', topPosition + 5)
    .attr('fill', '#fff')
    .attr('text-anchor', 'middle');

  const line = foreground.append('line')
    .attr('class', 'symbol-line')
    .attr('x1', xPosition)
    .attr('x2', xPosition)
    .attr('y1', topPosition + 20)
    .attr('y2', timeAxisBounds.top - foregroundBounds.top)
    .attr('stroke', '#666')
    .attr('stroke-width', '2');

  const changeAnchorPosition = (xPosition, year) => {

    circle.attr('cx', leftOffset + xPosition);

    text.attr('x', leftOffset + xPosition).text(year);

    line.attr('x1', leftOffset + xPosition).attr('x2', leftOffset + xPosition);

    // ... call listener function
    onAnchorMoved(year);

    // ... update global current year
    currentYear = year;

  };

  function started() {
    const minYear = new Date(timeScale.domainMin()).getFullYear();
    const maxYear = new Date(timeScale.domainMax()).getFullYear();

    d3.event.on("drag", dragged).on("end", ended);

    // Change cursor style
    document.body.style.cursor = 'ew-resize';

    function dragged() {
      const x = d3.event.x;

      const xDate = timeScale.invertedTransformation(origin + x - leftOffset);

      const draggedYear = new Date(xDate).getFullYear().toString();

      if (draggedYear !== currentYear && draggedYear >= minYear && draggedYear <= maxYear) {

        changeAnchorPosition(timeScale.scaleTransformation(draggedYear), draggedYear);
      }
    }

    function ended() {
      // revert cursor style
      document.body.style = {};
    }
  }

  circle.call(d3.drag().on("start", started));
  text.call(d3.drag().on("start", started));
  line.call(d3.drag().on("start", started));*/



};
