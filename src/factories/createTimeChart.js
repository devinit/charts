import Plottable from "plottable";
import {drag, event} from 'd3';
import {createTitle} from "./createTitle";
import {createChartTable} from "./createTable";
import {createColorLegend} from "./createLegend";
import {createLinearAxisGridLines} from "./createGrid";
import {createPlotWithGridlines} from "./createLinearChart";
import {createNumericAxis, createTimeAxis} from "./createAxis";
import {createLinearScale, createTimeScale} from "./createScale";
import {createDataMapping, createLinearDataset} from "./createDataset";

export default ({element, plot, config}) => {

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

  } = config;

  const timeScale = createTimeScale(timeAxis);
  const linearScale = createLinearScale(linearAxis);
  const colorScale = new Plottable.Scales.Color();

  const table = createChartTable({

    title: createTitle({title, titleAlignment}),

    chart: createPlotAreaWithAxes({

      plotArea: createPlotWithGridlines({
        plot: createTimePlot({plot, timeScale, linearScale, showLabels}),
        grid: createLinearAxisGridLines({...linearAxis, orientation: 'vertical', scale: linearScale})
      }),

      linearAxis: createNumericAxis({...linearAxis, axisScale: linearScale, axisOrientation: 'vertical'}),

      categoryAxis: createTimeAxis({...timeAxis, axisScale: timeScale, axisOrientation: 'horizontal'})
    }),

    legend: createColorLegend(colorScale, legend),

    legendPosition: legend.position || 'bottom'
  });

  const listeners = [];

  let moveAnchor = null;

  let onTableAnchored = (table) => {
    // waiting till table is setup, hopefully 500ms will
    // always be sufficient
    // TODO: Use onRender event instead
    // see https://github.com/palantir/plottable/issues/1755
    setTimeout(() => {
      moveAnchor = createTimeAnchor(table, timeScale, anchor, legend, listeners)
    }, 500);
  };

  table.addClass('timeline');

  table.renderTo(element);

  table.onAnchor(onTableAnchored);

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
    },

    onAnchorMoved(callback = null) {
      if (callback && callback.call) {
        listeners.push(callback)
      }
    },

    moveAnchor: year => {
      if (!moveAnchor) {
        // Retry if anchor is not ready
        setTimeout(() => chart.moveAnchor(year), 200);
      } else {
        moveAnchor(year);
      }
    }

  };

  return chart;
};


const createTimeAnchor = (table, timeScale, anchor, legend = {}, listeners) => {

  const originDate = new Date(timeScale.domainMin());
  const startDate = anchor.start ? new Date(anchor.start) : originDate;
  let currentYear = startDate.getFullYear().toString();

  const minYear = new Date(timeScale.domainMin()).getFullYear();
  const maxYear = new Date(timeScale.domainMax()).getFullYear();

  const origin = timeScale.scaleTransformation(originDate);
  const start = timeScale.scaleTransformation(startDate);

  const chartArea = table.componentAt(1, 0);

  const plotArea = legend.showLegend ?
    chartArea.componentAt(0, 0) :
    chartArea;

  const timeAxis = plotArea.componentAt(2, 1);

  const foreground = plotArea.foreground();

  foreground.attr('style', 'z-index: 1');

  const foregroundBounds = foreground.node().getBoundingClientRect();
  const timeAxisBounds = timeAxis.content().node().getBoundingClientRect();

  const leftOffset = timeAxisBounds.left - foregroundBounds.left;

  const xPosition = leftOffset + start;

  // Circle radius
  const topPosition = 20;

  const circle = foreground.append('circle')
    .attr('class', 'symbol')
    .attr('cx', xPosition)
    .attr('cy', topPosition)
    .attr('fill', 'rgb(232, 68, 58)')
    .attr('stroke', '#aaa')
    .attr('r', topPosition);

  const text = foreground.append('text')
    .text(startDate.getFullYear().toString())
    .attr('class', 'symbol-label')
    .attr('x', xPosition)
    .attr('y', topPosition + 5)
    .attr('fill', '#fff')
    .attr('font-size', 13)
    .attr('text-anchor', 'middle');

  const line = foreground.append('line')
    .attr('class', 'symbol-line')
    .attr('x1', xPosition)
    .attr('x2', xPosition + 1)
    .attr('y1', topPosition + 22)
    .attr('y2', timeAxisBounds.top - foregroundBounds.top)
    .attr('stroke', 'rgb(232, 68, 58)')
    .attr('stroke-width', 2);

  const changeAnchorPosition = (year) => {

    // Prevent duplicate movements,
    // oh and they'll be duplicate movements
    // -- remove this condition at your own risk.
    // just kidding, i think
    if (year !== currentYear && year >= minYear && year <= maxYear) {
      const xPosition = timeScale.scaleTransformation(year);

      circle.attr('cx', leftOffset + xPosition);

      text.attr('x', leftOffset + xPosition).text(year);

      line
        .attr('x1', leftOffset + xPosition)
        .attr('x2', leftOffset + xPosition);

      // ... notify movement listeners
      listeners.forEach(callback => {
        if (callback && callback.call) {
          callback(year)
        }
      });

      // ... update global current year
      currentYear = year;
    }

  };

  function started() {
    // Change cursor style
    document.body.style.cursor = 'ew-resize';

    event
      .on("drag", dragged)
      .on("end", ended);

    function dragged() {
      const x = event.x;

      const xDate = timeScale.invertedTransformation(origin + x - leftOffset);

      const draggedYear = new Date(xDate).getFullYear().toString();

      changeAnchorPosition(draggedYear);
    }

    function ended() {
      // revert cursor style
      document.body.style = {};
    }
  }

  circle.call(drag().on("start", started));
  text.call(drag().on("start", started));
  line.call(drag().on("start", started));

  return changeAnchorPosition
};

export const createTimePlot = ({plot, timeScale, linearScale}) => {

  return plot
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .x(d => new Date(d.label), timeScale)
    .y(d => d.value, linearScale)
    .datasets([new Plottable.Dataset([])]);
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