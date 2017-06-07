import Plottable from "plottable";
import {createLinearDataset} from "./createDataset";
import {createCategoryScale, createLinearScale} from "./createScale";
import {createCategoryAxis, createNumericAxis} from "./createAxis";
import {createAxisGridLines} from "./createGrid";

export const createLinearChart = ({element, plot, data = null, config: {
    title = null,

    titleAlignment = 'left',

    orientation = 'vertical',

  colors = [],

    linearAxis = {
      // Do you even want an axis?
      showAxis: false,

      axisMargin: 10,

      // GridLines
      showGridlines: false,

      // Axis Label
      axisLabel: null,

      // Tick Labels

      // Scale configurations
      axisMinimum: null,
      axisMaximum: null,
    },

    categoryAxis = {
      showAxis: false,
      axisMargin: 0,

      axisLabel: null,

      // axisLabelAngle: 0,
      axisLabelAngle: 0,

      // Padding
      innerPadding: 0,
      outerPadding: 0
    },

    legend: {
      showLegend = false,
      legendPosition = 'left',
      legendSymbol = 'square'
    } = {},

    // ... more config

  }}) => {

  const categoryScale = createCategoryScale(categoryAxis);
  const linearScale = createLinearScale(linearAxis);

  const mCategoryAxis = createCategoryAxis({
    axisScale: categoryScale,
    axisOrientation: orientation, ...categoryAxis
  });

  const mLinearAxis = createNumericAxis({axisScale: linearScale, axisOrientation: orientation, ...linearAxis});

  const gridLines = createAxisGridLines({orientation, scale: linearScale, ...linearAxis});

  plot
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .animated(true)
    .x(
      d => orientation === 'vertical' ? d.label : d.value,
      orientation === 'vertical' ? categoryScale : linearScale
    )
    .y(
      d => orientation === 'horizontal' ? d.label : d.value,
      orientation === 'horizontal' ? categoryScale : linearScale
    );

  const plotArea = gridLines ? new Plottable.Components.Group([gridLines, plot]) : plot;

  const colorScale = new Plottable.Scales.Color();

  const legend = (showLegend || null) && new Plottable.Components.Legend(colorScale)
      .xAlignment(legendPosition)
      .symbol(d => size => Plottable.SymbolFactories[legendSymbol]()(size))
      .maxEntriesPerRow(Infinity);

  const table = createLinearTable({
    title,
    titleAlignment,
    orientation,
    legend,
    plotArea,
    linearAxis: mLinearAxis,
    categoryAxis: mCategoryAxis
  });

  table.renderTo(element);

  const addData = (data = []) => {

    const {labels, series} = createLinearDataset(data);

    // TODO: Efficiently update legend
    if (showLegend) {

      const domain = series.map(d => d.label);
      const range = series.map((d, i) => colors[i] || '#abc');
      colorScale.domain(domain).range(range);
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

    console.log(datasets)

    plot.datasets(datasets.map(d => new Plottable.Dataset(d)));
  };

  return {

    table,

    addData,

  };
};

export const createLinearTable = ({title, titleAlignment, legend, orientation, plotArea, linearAxis, categoryAxis}) => {


  const titleLabel = new Plottable.Components.TitleLabel(title, 0)
    .xAlignment(titleAlignment)
    .yAlignment('top');

  const plotWithAxes = orientation === 'vertical' ?
    [[linearAxis, plotArea], [null, categoryAxis]] :
    [[categoryAxis, plotArea], [null, linearAxis]];

  const plotWithAxesTable = new Plottable.Components.Table(plotWithAxes);

  const plotWithAxesAndLegend = new Plottable.Components.Table([[plotWithAxesTable], [legend]]);

  const chartTable = new Plottable.Components.Table([[titleLabel], [plotWithAxesAndLegend]]);

  chartTable.rowPadding(10);

  return chartTable;


};