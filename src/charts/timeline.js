import Plottable from "plottable";
import * as d3 from 'd3';
import {createTitle} from "../factories/createTitle";
import {createChartTable} from "../factories/createTable";
import {createColorLegend} from "../factories/createLegend";
import {createLinearAxisGridLines} from "../factories/createGrid";
import {createPlotWithGridlines} from "../factories/createLinearChart";
import {createNumericAxis, createTimeAxis} from "../factories/createAxis";
import {createLinearScale, createTimeScale} from "../factories/createScale";
import {createDataMapping, createLinearDataset} from "../factories/createDataset";

export default (element, data, config) => {

  const {

    title = null,

      titleAlignment = 'left',

      groupBy,

      colors = [],

      showLabels = true,

      linearAxis,

      timeAxis,

      anchor = {
        start: 0,
      },

      legend = {},

    // ... more config

  } = config;

  const scatter = new Plottable.Plots.Scatter();
  const plot = new Plottable.Plots.Line();

  const timeScale = createTimeScale(timeAxis);
  const linearScale = createLinearScale(linearAxis);
  const colorScale = new Plottable.Scales.Color();

  const mTimeAxis = createTimeAxis({...timeAxis, axisScale: timeScale, axisOrientation: 'horizontal'});

  const table = createChartTable({

    title: createTitle({title, titleAlignment}),

    chart: createPlotAreaWithAxes({

      bubble: createScatterPlot(scatter, timeScale, new Plottable.Scales.Linear()),

      plotArea: createPlotWithGridlines({
        plot: createTimePlot({plot, timeScale, linearScale, showLabels}),
        grid: createLinearAxisGridLines({...linearAxis, orientation: 'vertical', scale: linearScale})
      }),

      linearAxis: createNumericAxis({...linearAxis, axisScale: linearScale, axisOrientation: 'vertical'}),

      categoryAxis: mTimeAxis
    }),

    legend: createColorLegend(colorScale, legend),

    legendPosition: legend.position || 'bottom'
  });

  table.addClass('timeline');

  table.renderTo(element);

  table.onAnchor(function (table) {
    setTimeout(() => createTimeAnchor(table, timeScale, anchor, legend, onAnchorMoved), 2000);
  });

  let onAnchorMoved = d => d;

  const chart = {

    table,

    addData: (data = [], transform = d => d) => {

      const mapping = createDataMapping(data, linearAxis.indicator, timeAxis.indicator, groupBy);

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
            label: labels[index],
            value,
            color,
            opacity
          }
        })
      });

      plot.datasets(datasets.map(d => new Plottable.Dataset(d)));

      scatter.datasets([new Plottable.Dataset([{x: '2015', y: 0, color: 'rgba(200,0,0,0.5)'}])]);
    },

    onAnchorMoved(callback = null) {
      if (callback) {
        onAnchorMoved = callback
      }
    }

  };

  chart.addData(data);

  return chart;
};


const createTimeAnchor = (table, timeScale, anchor, legend = {}, onAnchorMoved) => {

  const originDate = new Date(timeScale.domainMin());
  const startDate = anchor.start ? new Date(anchor.start) : originDate;
  let currentYear = startDate.getFullYear().toString();

  const origin = timeScale.scaleTransformation(originDate);
  const start = timeScale.scaleTransformation(startDate);

  const chartArea = table.componentAt(1, 0);

  const plotArea = legend.showLegend ?
    chartArea.componentAt(0, 0) :
    chartArea;

  const timeAxis = plotArea.componentAt(2, 1);

  const foreground = plotArea.foreground();

  foreground.attr('style', 'pointer-events: all');

  const foregroundBounds = foreground.node().getBoundingClientRect();
  const timeAxisBounds = timeAxis.content().node().getBoundingClientRect();

  const leftOffset = timeAxisBounds.left - foregroundBounds.left;

  const xPosition = leftOffset + start;
  const topPosition = 20;

  const circle = foreground.append('circle')
    .attr('class', 'symbol')
    .attr('cx', xPosition)
    .attr('cy', topPosition)
    .attr('fill', 'rgb(232, 68, 58)')
    .attr('stroke', '#aaa')
    .attr('r', 20);

  const text = foreground.append('text')
    .text(startDate.getFullYear().toString())
    .attr('class', 'symbol-label')
    .attr('x', xPosition)
    .attr('y', topPosition + 5)
    .attr('fill', '#fff')
    .attr('text-anchor', 'middle');

  const line = foreground.append('line')
    .attr('class', 'symbol-line')
    .attr('x1', xPosition)
    .attr('x2', xPosition)
    .attr('y1', topPosition + 20)
    .attr('y2', timeAxisBounds.top - foregroundBounds.top)
    .attr('stroke', '#666')
    .attr('stroke-width', '2');

  const changeAnchorPosition = (xPosition, year) => {

    circle.attr('cx', leftOffset + xPosition);

    text.attr('x', leftOffset + xPosition).text(year);

    line.attr('x1', leftOffset + xPosition).attr('x2', leftOffset + xPosition);

    // ... call listener function
    onAnchorMoved(year);

    // ... update global current year
    currentYear = year;

  };

  function started() {
    const minYear = new Date(timeScale.domainMin()).getFullYear();
    const maxYear = new Date(timeScale.domainMax()).getFullYear();

    d3.event.on("drag", dragged).on("end", ended);

    // Change cursor style
    document.body.style.cursor = 'ew-resize';

    function dragged() {
      const x = d3.event.x;

      const xDate = timeScale.invertedTransformation(origin + x - leftOffset);

      const draggedYear = new Date(xDate).getFullYear().toString();

      if (draggedYear !== currentYear && draggedYear >= minYear && draggedYear <= maxYear) {

        changeAnchorPosition(timeScale.scaleTransformation(draggedYear), draggedYear);
      }
    }

    function ended() {
      // revert cursor style
      document.body.style = {};
    }
  }

  circle.call(d3.drag().on("start", started));
  text.call(d3.drag().on("start", started));
  line.call(d3.drag().on("start", started));



};

export const createTimePlot = ({plot, timeScale, linearScale}) => {

  return plot
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .x(d => new Date(d.label), timeScale)
    .y(d => d.value, linearScale);
};

const createScatterPlot = (plot, horizontalScale, verticalScale) => {
  return plot
    .attr('fill', d => d.color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1)
    .attr('opacity', 1)
    .x(d => new Date(d.x), horizontalScale)
    .y(d => d.y, verticalScale)
    .size(d => 50)
};

const createPlotAreaWithAxes = ({linearAxis, plotArea, categoryAxis}) => {
  const table = new Plottable.Components.Table([
    [null, null, null],
    [linearAxis, plotArea, null],
    [null, categoryAxis, null]
  ]);

  table.rowWeight(0, 2);
  table.rowWeight(1, 3);

  return table;
};