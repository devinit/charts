import Plottable from "plottable";
import {createCategoryScale, createLinearScale} from "./scaleFactory";
import {createCategoryAxis, createNumericAxis} from "./axisFactory";
import { createGridLines } from './gridFactory'

const config = {
  orientation: 'vertical',
  linearAxis: {
    showAxis: true,
    axisLabel: "Rainfall (mm)",
    showGridLines: true,
    gridLineFrequency: 1,
    minimum: 0,
    maximum: 100
  },
  categoryAxis: {
    showAxis: true,
    axisLabel: "Months",
    showGridLines: true,
    gridLineFrequency: 1,
  },
  plotArea: {
    innerPadding: 0,
    outerPadding: 0
  }
};

export const createCategoryLinearChart = (element,
  {labels, series},
  {
    orientation = 'vertical',
    showLinearAxis = false,
    linearAxisLabel = null,
    showCategoryAxis = false,
    categoryAxisLabel = null,
    showCategoryGridLines = false,
    showLinearGridLines = false,
    min = null,
    max = null,
    outerPadding = 0,
    innerPadding = 0,


  }) => plot => {

  const datasets = series
    .map(({stroke = '#abc', fill = '#abc', opacity = 1, label, values}) => {
      return values.map((value, index) => {
        return {
          label: labels[index] || index, // Each value in a `series` should correspond to a `label`
          value,
          stroke,
          fill,
          opacity
        }
      })
    });

  const categoryScale = createCategoryScale({innerPadding, outerPadding});

  const linearScale = createLinearScale({min, max});

  plot
    .attr('stroke', d => d.stroke)
    .attr('fill', d => d.fill)
    .attr('fill-opacity', d => d.opacity);

  if (orientation === 'vertical') {
    plot
      .x(d => d.label, categoryScale)
      .y(d => d.value, linearScale);
  } else {
    plot
      .x(d => d.value, linearScale)
      .y(d => d.label, categoryScale);
  }

  datasets.map(dataset => plot.addDataset(new Plottable.Dataset(dataset)));

  const categoryAxis = createCategoryAxis({
    required: showCategoryAxis,
    alignment: orientation === 'vertical' ? 'bottom' : 'left',
    label: categoryAxisLabel,
    scale: categoryScale
  });

  const linearAxis = createNumericAxis({
    required: showLinearAxis,
    alignment: orientation === 'vertical' ? 'left' : 'bottom',
    label: linearAxisLabel,
    scale: linearScale
  });

  const gridLines = createGridLines({
    xScale: showCategoryGridLines ? categoryScale : null,
    yScale: showLinearGridLines ? linearScale : null,
  });

  // const plotArea = gridLines ? new Plottable.Components.Group([plot, gridLines]) : plot;

  const table = createChartTable({orientation, plot, linearAxis, categoryAxis});

  table.renderTo(element);

  return table.foreground();
};

export const createChartTable = ({orientation, plot, linearAxis, categoryAxis}) => {

  if (orientation === 'vertical') {
    return new Plottable.Components.Table([
      [linearAxis, plot],
      [null, categoryAxis]
    ])
  }

  if (orientation === 'horizontal') {
    return new Plottable.Components.Table([
      [categoryAxis, plot],
      [null, linearAxis]
    ])
  }


};

export const createCircularChart = (element,
  {labels, series},
  {

    // ...
  }) => plot => {

  const datasets = series
    .slice(0, 1)
    .map(({stroke = '#abc', fill = '#abc', opacity = 0.5, label, values}) => {
      return values.map((value, index) => {
        return {
          label: labels[index] || index, // Each value in a `series` should correspond to a `label`
          value,
          stroke,
          fill,
          opacity
        }
      })
    });

  plot
    .attr('stroke', d => d.stroke)
    .attr('fill', d => d.fill)
    .attr('fill-opacity', d => d.opacity)
    .sectorValue(d => d.value);

  datasets.map(dataset => plot.addDataset(new Plottable.Dataset(dataset)));

  const table = new Plottable.Components.Table([
    [plot],
  ]);

  table.renderTo(element);

  return table.foreground();

};