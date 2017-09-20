import Plottable from "plottable";
import {flattenDeep, groupBy as group, keys, mapValues, uniq, values} from "lodash";
import {createChartTable} from "../factories/createTable";
import {createTitle} from "../factories/createTitle";
import {makeUnique} from "../factories/createDataset";
import {createCategoryScale, createLinearScale} from "../factories/createScale";
import {createAxisModifier, createCategoryAxis, createNumericAxis} from "../factories/createAxis";
import {createLinearAxisGridLines} from "../factories/createGrid";
import {createBarTipper} from "../factories/createTooltipper";

/**
 * @typedef {LinearCategoryChart} DualSidebar
 * @public
 * @property {'dual-sidebar'} type
 * @property {'indicator'} splitBy
 * @property {string} splitBy
 * @property {'indicator'}
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

    orderBy,

    colors = [],

    coloring = null,

    showLabels = false,

    linearAxis,

    categoryAxis,

    dualSidebar = {
      gutter: 100
    },

    tooltips = {enable: true},

    // ... more config

  } = config;

  const {format, modify} = createAxisModifier(linearAxis);
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
        }, modify),
        grid: createLinearAxisGridLines({...linearAxis, orientation, scale: leftLinearScale})
      }),

      rightPlotArea: createPlotWithGridlines({
        plot: createLinearPlot({
          plot: rightPlot,
          orientation,
          categoryScale: rightCategoryScale,
          linearScale: rightLinearScale,
          showLabels
        }, modify),
        grid: createLinearAxisGridLines({...linearAxis, orientation, scale: rightLinearScale})
      }),

      leftLinearAxis: createNumericAxis({
        ...linearAxis,
        axisScale: leftLinearScale,
        axisOrientation: orientation,
      }, format),

      rightLinearAxis: createNumericAxis({
        ...linearAxis,
        axisScale: rightLinearScale,
        axisOrientation: orientation,
        absolute: true
      }, format),

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

  leftPlot.onAnchor(plot => {
    setTimeout(() => {
      if (tooltips.enable) {
        createBarTipper(element, config.labeling, chart.categoryScale, 'inverted-horizontal')(plot);
      }
    }, 500)
  });

  rightPlot.onAnchor(plot => {
    setTimeout(() => {
      if (tooltips.enable) {
        createBarTipper(element, config.labeling, chart.categoryScale, 'horizontal')(plot);
      }
    }, 500)
  });

  const update = (data = []) => {

    const plots = [leftPlot, rightPlot];

    const sorted = orderBy ? data.sort((a, b) => a[orderBy] > b[orderBy] ? 1 : -1) : data;

    values(group(sorted, d => d[splitBy]))
      .slice(0, 2)
      .sort((a, b) => a[0][splitBy] > a[0][splitBy] ? 1 : 1)
      .map(side => mapValues(group(side, d => d[groupBy]), grp => group(grp, d => d[subGroupBy])))
      .reduce(([sides = []], side) => [[...sides, side]], [])
      .map(([left, right]) => {

        uniq([...keys(left), ...keys(right)])
          .forEach(groupId => {

            const subGroupIds = uniq([...keys(left[groupId] || {}), ...keys(right[groupId] || {})]);

            subGroupIds.forEach(subGroupId => {
              // Safety first: Applying seat belts
              // ...
              left[groupId] = left[groupId] || {};
              left[groupId][subGroupId] = left[groupId][subGroupId] || [];
              right[groupId] = right[groupId] || {};
              right[groupId][subGroupId] = right[groupId][subGroupId] || [];

              // ...
              const leftSubGroupSize = left[groupId][subGroupId].length;
              const rightSubGroupSize = right[groupId][subGroupId].length;

              if (leftSubGroupSize > rightSubGroupSize) {
                for (let i = rightSubGroupSize; i < leftSubGroupSize; i++) {
                  right[groupId][subGroupId].push({
                    ...left[groupId][subGroupId][i],
                    [categoryAxis.indicator]: '',
                    [linearAxis.indicator]: 0,
                  })
                }
              }

              else if (leftSubGroupSize < rightSubGroupSize) {
                for (let j = leftSubGroupSize; j < rightSubGroupSize; j++) {
                  left[groupId][subGroupId].push({
                    ...right[groupId][subGroupId][j],
                    [categoryAxis.indicator]: '',
                    [linearAxis.indicator]: 0,
                  })
                }
              }

            });

            // Add a dummy item to the end of every subgroup to create
            // an 'artificial' padding
            left[groupId][''] = [{
              ...(left[groupId][subGroupIds[0]][0] || {}),
              [subGroupBy]: '',
              [categoryAxis.indicator]: '',
              [linearAxis.indicator]: 0,
            }];

            right[groupId][''] = [{
              ...(right[groupId][subGroupIds[0]][0] || {}),
              [subGroupBy]: '',
              [categoryAxis.indicator]: '',
              [linearAxis.indicator]: 0,
            }];
          });


        return [left, right]
      })
      .reduce((all, side) => [...all, ...side], [])
      .forEach((side, index) => {
        const direction = index === 0 ? -1 : 1;

        const series = flattenDeep(
          values(side).map((grp, index) => flattenDeep(values(grp)).map(datum => ({
            ...datum,
            direction,
            color: datum[coloring] || colors[index] || '#abc',
          })))
        );

        const dataset = series.map((datum, index) => ({
          ...datum,
          index,
          label: datum[categoryAxis.indicator],
          value: datum[linearAxis.indicator] * direction,
          opacity: 1,
          category: datum[groupBy],
          subCategory: datum[subGroupBy],
        }));

        plots[index].datasets([dataset].map(d => new Plottable.Dataset(d)))
      });
  };

  const chart = {

    table,

    update,

    destroy: () => {
      table.destroy();
    }

  };

  chart.update(data);

  return chart;
};

const drawLabels = (dualSidebar) => function () {
  const entities = this.entities();
  const foreground = this.foreground();
  const data = entities.map(entity => entity.datum);
  const direction = data[0] && data[0].direction;

  foreground.attr('style', 'overflow: visible');
  foreground.selectAll('text').remove();

  makeUnique(data.map(d => d.category))
    .map(categoryId => {

      const categoryEntities = entities
        .filter(entity => entity.datum.category === categoryId);

      if (direction > 0 && categoryEntities.length) {

        const nodeYValues = categoryEntities.map(entity => entity.selection.node().y.baseVal.value);

        const top = Math.min.apply(null, nodeYValues);

        foreground
          .append('text')
          .text(categoryId)
          .attr('class', 'group-label')
          .attr('x', dualSidebar.gutter * -0.5)
          .attr('y', top - 15)
          .attr('text-anchor', 'middle');

        makeUnique(categoryEntities.map(entity => entity.datum.subCategory))
          .map(subCategoryId => {

            const subCategoryEntities = categoryEntities.filter(entity => entity.datum.subCategory === subCategoryId);

            const nodeYValues = subCategoryEntities.map(entity => entity.selection.node().y.baseVal.value);

            const top = Math.min.apply(null, nodeYValues);
            const bottom = Math.max.apply(null, nodeYValues);

            const y = top + 9 + (bottom - top) / 2;

            foreground
              .append('text')
              .text(subCategoryId)
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

      // Don't draw labels if datum has no label
      if (datum.label) {
        const bBox = entity.selection.node().getBBox();

        foreground
          .append('text')
          .text(datum.label)
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

export const createLinearPlot = ({plot, categoryScale, linearScale, showLabels}, modify) => {
  if (showLabels && plot.labelsEnabled) {
    plot.labelsEnabled(showLabels)
  }

  return plot
    .attr('class', d => `${d.group} ${d.subGroup}`)
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .x(d => modify(d.value), linearScale)
    .y(d => d.index, categoryScale);
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
