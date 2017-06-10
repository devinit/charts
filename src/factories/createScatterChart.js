import Plottable from 'plottable';
import { createLinearScale } from './createScale'
import { createNumericAxis } from './createAxis'
import { createScatterGridLines } from './createGrid'
import { createChartTable } from './createTable'

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

export default ({
  element,

  plot,

  config: {

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

  }
}) => {

  const xScale = createLinearScale(horizontalAxis);
  const yScale = createLinearScale(verticalAxis);

  const bubbleScale = createLinearScale({});

  const mxAxis = createNumericAxis({axisScale: xScale, axisOrientation: 'horizontal', ...horizontalAxis});

  const myAxis = createNumericAxis({axisScale: yScale, axisOrientation: 'vertical', ...verticalAxis});

  const scatterPlot = createScatterPlot({plot, xScale, yScale, bubbleScale});

  const gridLines = createScatterGridLines({xScale, yScale, horizontalAxis, verticalAxis});

  const plotArea = new Plottable.Components.Group([gridLines, scatterPlot]);

  scatterPlot.renderTo(element);

  return {

    addData: d => d
  }
}

const createScatterPlot = ({plot, xScale, yScale, bubbleScale}) => {
  return plot
    .attr('fill', d => d.color)
    .x(d => d.x, yScale)
    .y(d => d.y, xScale)
    .size(d => d.size, bubbleScale)
};


const createPlotAreaWithAxes = ({xAxis, plotArea, yAxis}) => {
  const plotAreaWithAxes =  orientation === 'vertical' ?
    [[linearAxis, plotArea], [null, categoryAxis]] :
    [[categoryAxis, plotArea], [null, linearAxis]];

  return new Plottable.Components.Table(plotAreaWithAxes);
};