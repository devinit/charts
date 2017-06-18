import Plottable from "plottable";
import approximate from 'approximate-number';
import {createChartTable} from "./createTable";
import {createTitle} from "./createTitle";
import {createColorLegend} from "./createLegend";
import {createDataMapping, createLinearDataset} from "./createDataset";
import {createCategoryScale, createLinearScale} from "./createScale";
import {createCategoryAxis, createNumericAxis} from "./createAxis";
import {createLinearAxisGridLines} from "./createGrid";

/**
 * @typedef {Object} LinearCategoryChart
 * @private
 * @property {string} type - Type
 * @property {string} title - Title
 * @property {'left'|'center'|'right'} titleAlignment=left - Title Alignment
 * @property {('vertical'|'horizontal')} orientation=vertical - Orientation
 * @property {indicator} groupBy - Groups
 * @property {boolean} showLabels - Show Labels
 * @property {string[]} colors - Colors
 * @property {NumericAxis} linearAxis - Linear Axis
 * @property {CategoryAxis} categoryAxis - Category Axis
 * @property {ColorLegend} legend - Legend
 */

export const createLinearChart = ({element, plot, config}) => {

  const {

    title = null,

    titleAlignment = 'left',

    orientation = 'vertical',

    groupBy,

    colors = [],

    showLabels = true,

    linearAxis,

    categoryAxis,

    legend = {},

    // ... more config

  } = config;

  const categoryScale = createCategoryScale(categoryAxis);
  const linearScale = createLinearScale(linearAxis);
  const colorScale = new Plottable.Scales.Color();

  const table = createChartTable({

    title: createTitle({title, titleAlignment}),

    chart: createPlotAreaWithAxes(orientation, {

      plotArea: createPlotWithGridlines({
        plot: createLinearPlot({plot, orientation, categoryScale, linearScale, showLabels}),
        grid: createLinearAxisGridLines({...linearAxis, orientation, scale: linearScale})
      }),

      linearAxis: createNumericAxis({...linearAxis, axisScale: linearScale, axisOrientation: orientation}),

      categoryAxis: createCategoryAxis({...categoryAxis, axisScale: categoryScale, axisOrientation: orientation})
    }),

    legend: createColorLegend(colorScale, legend),

    legendPosition: legend.position || 'bottom'
  });

  table.renderTo(element);

  return {

    table,

    addData: (data = [], transform = d => d) => {

      const mapping = createDataMapping(data, linearAxis.indicator, categoryAxis.indicator, groupBy);

      const {labels, series} = transform(createLinearDataset(mapping));

      if (legend.showLegend) {
        colorScale
          .domain(series.map(d => d.label))
          .range(series.map((d, i) => colors[i] || '#abc'));
      }

      const datasets = series.map(({opacity = 1, values}, index) => {
        const color = colors[index] || '#abc';
        return values.map((value, index) => {
          return {
            label: labels[index] || index, // Each value in a `series` should correspond to a `label`
            value,
            color,
            opacity
          }
        })
      });

      plot.datasets(datasets.map(d => new Plottable.Dataset(d)));
    },

  };
};

const createPlotWithGridlines = ({plot, grid}) => {
  return grid ? new Plottable.Components.Group([grid, plot]) : plot
};

export const createLinearPlot = ({plot, orientation, categoryScale, linearScale, showLabels}) => {
  if (showLabels && plot.labelsEnabled) {
    plot
      .labelFormatter(d => approximate(d))
      .labelsEnabled(showLabels)
  }

  return plot
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .x(d => orientation === 'vertical' ? d.label : d.value, orientation === 'vertical' ? categoryScale : linearScale)
    .y(d => orientation === 'horizontal' ? d.label : d.value, orientation === 'horizontal' ? categoryScale : linearScale);
};

const createPlotAreaWithAxes = (orientation, {linearAxis, plotArea, categoryAxis}) => {
  const plotAreaWithAxes = orientation === 'vertical' ?
    [[linearAxis, plotArea], [null, categoryAxis]] :
    [[categoryAxis, plotArea], [null, linearAxis]];

  return new Plottable.Components.Table(plotAreaWithAxes);
};