import Plottable from 'plottable';
import { createLinearScale } from './createScale'
import { createNumericAxis } from './createAxis'
import { createScatterGridLines } from './createGrid'
import { createChartTable } from './createTable'
import { createTitle } from './createTitle'
import { createColorLegend } from './createLegend'

/**
 * @typedef {Object} ScatterChart - Scatter chart configuration
 * @property {string} type - Type
 * @property {string} title - Title of chart
 * @property {string} titleAlignment - Title of chart
 * @property {string[]} groupBy - Group field
 * @property {string[]} colors - Colors
 * @property {NumericAxis} horizontalAxis - Horizontal Axis
 * @property {NumericAxis} verticalAxis - Vertical Axis
 * @property {Object} bubble - Bubble
 * @property {ColorLegend} legend - Legend
 */

export default ({element, plot, config}) => {

  const {

    title,

    titleAlignment = 'left',

    colors = [],

    horizontalAxis = {
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

    verticalAxis  = {
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

    bubble = {
      radiusLabel: 'Age',
      radiusMaximum: 0,
      radiusMinimum: 0,
    },

    legend = {
      showLegend: false,
      alignment: 'left',
      position: 'bottom',
      symbol: 'square',
      rowSpan: Infinity
    },

  } = config;

  const horizontalScale = createLinearScale(horizontalAxis);
  const verticalScale = createLinearScale(verticalAxis);
  const bubbleScale = createLinearScale({})
    .domain([bubble.radiusMinimum, bubble.radiusMaximum])
    .range([bubble.radiusMinimum, bubble.radiusMaximum]);

  const colorScale = new Plottable.Scales.Color();

  const scatterPlot = createScatterPlot({plot, horizontalScale, verticalScale, bubbleScale});
  const scatterGridLines = createScatterGridLines({horizontalScale, verticalScale, horizontalAxis, verticalAxis});

  // TODO: Add bubble scale legend
  const table = createChartTable({

    title: createTitle({title, titleAlignment}),

    chart: createPlotAreaWithAxes({

      verticalAxis: createNumericAxis({axisScale: verticalScale, axisOrientation: 'vertical', ...verticalAxis}),

      horizontalAxis: createNumericAxis({axisScale: horizontalScale, axisOrientation: 'horizontal', ...horizontalAxis}),

      plotArea: new Plottable.Components.Group([
        scatterGridLines,
        scatterPlot
      ]),

    }),

    legend: createColorLegend(colorScale, legend),

    legendPosition: legend.position,
  });

  table.renderTo(element);

  return {

    table,

    addData: (data) => {

      // TODO: Add grouping/coloring
      const mapping = data.map(datum => {
        return {
          x: datum[horizontalAxis.axisLabel],
          y: datum[verticalAxis.axisLabel],
          z: datum[bubble.radiusLabel],
          color: '#abc'
        }
      });

      scatterPlot.datasets([new Plottable.Dataset(mapping)]);
    }
  }
}

const createScatterPlot = ({plot, horizontalScale, verticalScale, bubbleScale}) => {
  return plot
    .attr('name', d => d.z)
    .attr('fill', d => d.color)
    .x(d => d.x, horizontalScale)
    .y(d => d.y, verticalScale)
    .size(d => d.z, bubbleScale)
};


const createPlotAreaWithAxes = ({horizontalAxis, plotArea, verticalAxis}) => {
  const plotAreaWithAxes =  [[verticalAxis, plotArea], [null, horizontalAxis]];

  return new Plottable.Components.Table(plotAreaWithAxes);
};