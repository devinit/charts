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
 * @property {'left'|'center'|'right'} titleAlignment=left - Title of chart
 * @property {indicator} groupBy - Group field
 * @property {string[]} colors - Colors
 * @property {NumericAxis} horizontalAxis - Horizontal Axis
 * @property {NumericAxis} verticalAxis - Vertical Axis
 * @property {Bubble} bubble - Bubble
 * @property {ColorLegend} legend - Legend
 */

/**
 * @typedef {Object} Bubble - Bubble configuration
 * @property {indicator} indicator - Value Indicator
 * @property {indicator} label - Label Indicator
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

    coloring = null,

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

    legendPosition: legend.position || 'bottom',
  });

  table.renderTo(element);

  const addData = data => {
    const rangeMaximum = Math.max.apply(null, data.map(d => d[bubble.indicator]));

    bubbleScale
      .domain([0, rangeMaximum])
      .range([10, 50]);

    const mapping = data
      .sort((a, b) => b[groupBy] - a[groupBy])
      .reduce((groups, datum) => {

        return {

          ...groups,

          [datum[groupBy]]: [

            ...(groups[datum[groupBy]] || []),

            {
              ...datum,
              x: datum[horizontalAxis.indicator],
              y: datum[verticalAxis.indicator],
              z: datum[bubble.indicator]
            }

          ]
        };

      }, {});

    const datasets = Object.keys(mapping)
      .map((group, index) => mapping[group]
        .map(d => ({
          ...d,
          color: d[coloring] || colors[index] || '#abc'
        })));

    colorScale
      .domain(Object.keys(mapping))
      .range(Object.keys(mapping).map((_, index) => colors[index] || '#abc'));

    scatterPlot.datasets(datasets.map(d => new Plottable.Dataset(d)));
  };
  return {

    table,

    addData,

    update: addData,

    destroy: () => {
      table.destroy();
    }
  }
}

const createScatterPlot = ({plot, horizontalScale, verticalScale, bubbleScale}) => {
  return plot
    .attr('name', d => d.z)
    .attr('fill', d => d.color)
    .attr('stroke', 'rgb(51, 51, 51)')
    .attr('stroke-width', 2)
    .attr('opacity', 0.8)
    .x(d => d.x, horizontalScale)
    .y(d => d.y, verticalScale)
    .size(d => d.z, bubbleScale)
    .animated(true)
};


const createPlotAreaWithAxes = ({horizontalAxis, plotArea, verticalAxis}) => {
  const plotAreaWithAxes = [[verticalAxis, plotArea], [null, horizontalAxis]];

  return new Plottable.Components.Table(plotAreaWithAxes);
};