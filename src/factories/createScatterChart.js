import Plottable from "plottable";
import {createLinearScale} from "./createScale";
import {createNumericAxis} from "./createAxis";
import {createScatterGridLines} from "./createGrid";
import {createChartTable} from "./createTable";
import {createTitle} from "./createTitle";
import {createColorLegend} from "./createLegend";

/**
 * @typedef {Object} ScatterChart - Scatter chart configuration
 * @property {string} type - Type
 * @property {string} title - Title of chart
 * @property {string} titleAlignment - Title of chart
 * @property {string[]} groupBy - Group field
 * @property {string[]} colors - Colors
 * @property {NumericAxis} horizontalAxis - Horizontal Axis
 * @property {NumericAxis} verticalAxis - Vertical Axis
 * @property {Bubble} bubble - Bubble
 * @property {ColorLegend} legend - Legend
 */

/**
 * @typedef {Object} Bubble - Bubble configuration
 * @property {number} indicator - Data Indicator
 * @property {number} label - Minimum bubble size
 * @property {number} minimum - Minimum bubble size
 * @property {number} maximum - Maximum bubble size
 */

/**
 *
 * @param element
 * @param plot
 * @param {ScatterChart} config
 */
export default ({element, plot, config}) => {

  const {

    title,

    titleAlignment = 'left',

    groupBy,

    colors = [],

    horizontalAxis,

    verticalAxis,

    bubble,

    legend = {},

  } = config;

  const horizontalScale = createLinearScale(horizontalAxis);
  const verticalScale = createLinearScale(verticalAxis);

  const bubbleScale = createLinearScale({});
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

    addData: data => {

      const rangeMinimum = Math.pow(10, Math.floor(Math.log10(Math.min.apply(null, data.map(d => d[bubble.indicator])))));
      const rangeMaximum = Math.pow(10, Math.ceil(Math.log10(Math.max.apply(null, data.map(d => d[bubble.indicator])))));

      bubbleScale
        .domain([bubble.minimum || 0, bubble.maximum || 100])
        .range([rangeMinimum, rangeMaximum]);

      const mapping = data
        .sort((a, b) => b[groupBy] - a[groupBy])
        .reduce((groups, datum, i, all) => {

          return {

            ...groups,

            [datum[groupBy]]: [

              ...(groups[datum[groupBy]] || []),

              {x: datum[horizontalAxis.indicator], y: datum[verticalAxis.indicator], z: datum[bubble.indicator]}

            ]
          };

        }, {});

      const coloring = Object.keys(mapping)
        .map((k, index) => ({group: k || 'Unknown', color: colors[index] || '#abc'}));

      const datasets = Object.keys(mapping)
        .map((group, index) => mapping[group].map(d => ({...d, color: coloring[index].color})));

      colorScale.domain(coloring.map(k => k.group)).range(coloring.map(k => k.color));

      scatterPlot.datasets(datasets.map(d => new Plottable.Dataset(d)));
    }
  }
}

const createScatterPlot = ({plot, horizontalScale, verticalScale, bubbleScale}) => {
  return plot
    .attr('name', d => d.z)
    .attr('fill', d => d.color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1)
    .attr('opacity', 1)
    .x(d => d.x, horizontalScale)
    .y(d => d.y, verticalScale)
    .size(d => d.z, bubbleScale)
};


const createPlotAreaWithAxes = ({horizontalAxis, plotArea, verticalAxis}) => {
  const plotAreaWithAxes = [[verticalAxis, plotArea], [null, horizontalAxis]];

  return new Plottable.Components.Table(plotAreaWithAxes);
};