import Plottable from "plottable";
import { createChartTable } from "./createTable";
import { createTitle } from "./createTitle";
import { createColorLegend } from "./createLegend";
import { createLinearDataset, createDataMapping } from "./createDataset";
import { createCategoryScale, createLinearScale} from "./createScale";
import { createCategoryAxis, createNumericAxis} from "./createAxis";
import { createLinearAxisGridLines } from "./createGrid";

/**
 * @typedef {Object} LinearCategoryChart
 * @private
 * @property {string} type - Type
 * @property {string} title - Title
 * @property {('vertical'|'horizontal')} orientation - Orientation
 * @property {string} groupBy - Group field
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

    linearAxis = {
      // Do you even want an axis?
      showAxis: false,

      axisMargin: 10,

      // GridLines
      showGridlines: false,

      // Axis Label
      axisLabel: null,
      showAxisLabel: true,

      // Tick Labels

      // Scale configurations
      axisMinimum: null,
      axisMaximum: null,
    },

    categoryAxis = {
      showAxis: false,
      axisMargin: 0,

      showAxisLabel: true,
      axisLabel: null,

      // Padding
      innerPadding: 0,
      outerPadding: 0
    },

    legend = {
      showLegend: false,
      alignment: 'left',
      position: 'bottom',
      symbol: 'square',
      rowSpan: Infinity
    },

    // ... more config

  } = config;

  const categoryScale = createCategoryScale(categoryAxis);

  const linearScale = createLinearScale(linearAxis);

  const mCategoryAxis = createCategoryAxis({axisScale: categoryScale, axisOrientation: orientation, ...categoryAxis});

  const mLinearAxis = createNumericAxis({axisScale: linearScale, axisOrientation: orientation, ...linearAxis});

  const linearPlot = createLinearPlot({plot, orientation, categoryScale, linearScale});

  const gridLines = createLinearAxisGridLines({orientation, scale: linearScale, ...linearAxis});

  const plotArea = gridLines ? new Plottable.Components.Group([gridLines, linearPlot]) : linearPlot;

  const colorScale = new Plottable.Scales.Color();

  const table = createChartTable({
    title: createTitle({title, titleAlignment}),
    chart: createPlotAreaWithAxes({
      orientation,
      plotArea,
      linearAxis: mLinearAxis,
      categoryAxis: mCategoryAxis
    }),
    legend: createColorLegend(colorScale, legend),
    legendPosition: legend.position
  });

  table.renderTo(element);

  return {

    table,

    addData: (data = [], transform = d => d) => {

      const mapping = createDataMapping(data, linearAxis.axisLabel, categoryAxis.axisLabel, groupBy);

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

export const createLinearPlot = ({plot, orientation, categoryScale, linearScale}) => {
  return plot
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .x(d => orientation === 'vertical' ? d.label : d.value, orientation === 'vertical' ? categoryScale : linearScale)
    .y(d => orientation === 'horizontal' ? d.label : d.value, orientation === 'horizontal' ? categoryScale : linearScale);
};

const createPlotAreaWithAxes = ({orientation, linearAxis, plotArea, categoryAxis}) => {
  const plotAreaWithAxes =  orientation === 'vertical' ?
    [[linearAxis, plotArea], [null, categoryAxis]] :
    [[categoryAxis, plotArea], [null, linearAxis]];

  return new Plottable.Components.Table(plotAreaWithAxes);
};