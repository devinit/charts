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
 * @property {'left'|'center'|'right'} titleAlignment=left - Title Alignment
 * @property {('vertical'|'horizontal')} orientation=vertical - Orientation
 * @property {indicator} groupBy - Groups
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

    linearAxis,

    categoryAxis,

    legend = {},

    // ... more config

  } = config;

  const categoryScale = createCategoryScale(categoryAxis);

  const linearScale = createLinearScale(linearAxis);

  const mCategoryAxis = createCategoryAxis({ ...categoryAxis, axisScale: categoryScale, axisOrientation: orientation});

  const mLinearAxis = createNumericAxis({...linearAxis, axisScale: linearScale, axisOrientation: orientation});

  const linearPlot = createLinearPlot({plot, orientation, categoryScale, linearScale});

  const gridLines = createLinearAxisGridLines({...linearAxis, orientation, scale: linearScale});

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