import Plottable from 'plottable';
import { drag, event } from 'd3';
import { createTitle } from './createTitle';
import { createChartTable } from './createTable';
import { createColorLegend } from './createLegend';
import { createLinearAxisGridLines } from './createGrid';
import { createPlotWithGridlines } from './createLinearChart';
import { createNumericAxis, createTimeAxis } from './createAxis';
import { createLinearScale, createTimeScale } from './createScale';
import { makeUnique } from './createDataset';
import { createLineTipper } from './tooltips';
import { createScaleAnimator } from './createAnimator';

// feels like this could have been an own factory, broken down into individual multi functions
const createTimeAnchor = (table, timeScale, anchor = { start: 0 }, legend = {}, listeners) => {
  const originDate = new Date(timeScale.domainMin());
  const startDate = anchor.start ? new Date(anchor.start.toString()) : originDate;
  let currentYear = startDate.getFullYear().toString();

  const minYear = new Date(timeScale.domainMin()).getFullYear();
  const maxYear = new Date(timeScale.domainMax()).getFullYear();

  const origin = timeScale.scaleTransformation(originDate);
  const start = timeScale.scaleTransformation(startDate);

  const chartArea = table.componentAt(1, 0);

  const plotArea = legend.showLegend ? chartArea.componentAt(0, 0) : chartArea;

  const timeAxis = plotArea.componentAt(2, 1);

  const foreground = plotArea.foreground();

  foreground.attr('style', 'z-index: 1');

  const foregroundBounds = foreground.node().getBoundingClientRect();
  const timeAxisBounds = timeAxis
    .content()
    .node()
    .getBoundingClientRect();

  const leftOffset = timeAxisBounds.left - foregroundBounds.left;

  const xPosition = leftOffset + start;

  // Circle radius
  const topPosition = 20;

  const circle = foreground
    .append('circle')
    .attr('class', 'symbol')
    .attr('cx', xPosition)
    .attr('cy', topPosition)
    .attr('fill', 'rgb(232, 68, 58)')
    // .attr('stroke', '#444')
    .attr('r', topPosition);

  const text = foreground
    .append('text')
    .text(startDate.getFullYear().toString())
    .attr('class', 'symbol-label')
    .attr('x', xPosition)
    .attr('y', topPosition + 5)
    .attr('fill', '#fff')
    .attr('font-size', 13)
    .attr('text-anchor', 'middle');

  const line = foreground
    .append('line')
    .attr('class', 'symbol-line')
    .attr('x1', xPosition)
    .attr('x2', xPosition + 1)
    .attr('y1', topPosition + 22)
    .attr('y2', timeAxisBounds.top - foregroundBounds.top)
    .attr('stroke', '#444')
    .attr('stroke-width', 2);

  const changeAnchorPosition = year => {
    // Prevent duplicate movements,
    // oh and they'll be duplicate movements
    // -- remove this condition at your own risk.
    // just kidding, i think
    if (year !== currentYear && year >= minYear && year <= maxYear) {
      const foregroundBounds = foreground.node().getBoundingClientRect();
      const timeAxisBounds = timeAxis
        .content()
        .node()
        .getBoundingClientRect();

      const leftOffset = timeAxisBounds.left - foregroundBounds.left;

      const xPosition = timeScale.scaleTransformation(year);

      circle.attr('cx', leftOffset + xPosition);

      text.attr('x', leftOffset + xPosition).text(year);

      line.attr('x1', leftOffset + xPosition).attr('x2', leftOffset + xPosition);

      // ... notify movement listeners
      listeners.forEach(callback => {
        if (callback && callback.call) {
          callback(year);
        }
      });

      // ... update global current year
      currentYear = year;
    }
  };

  function started() {
    // Change cursor style
    document.body.style.cursor = 'ew-resize';

    function dragged() {
      const { x } = event;

      const xDate = timeScale.invertedTransformation((origin + x) - leftOffset);

      const draggedYear = new Date(xDate).getFullYear().toString();

      changeAnchorPosition(draggedYear);
    }

    function ended() {
      // revert cursor style
      document.body.style = {};
    }

    event.on('drag', dragged).on('end', ended);
  }

  circle.call(drag().on('start', started));
  text.call(drag().on('start', started));
  line.call(drag().on('start', started));

  return changeAnchorPosition;
};

export const createTimePlot = ({ plot, timeScale, linearScale }) => {
  return plot
    .attr('stroke', d => d.color)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .x(d => new Date(d.label.toString()), timeScale)
    .y(d => d.value, linearScale);
};

const createPlotAreaWithAxes = (config) => {
  const {
    linearAxis,
    plotArea,
    categoryAxis,
    anchor
  } = config;

  const table = new Plottable.Components.Table([
    [null, null, null],
    [linearAxis, plotArea, null],
    [null, categoryAxis, null],
  ]);

  if (anchor) {
    table.rowWeight(0, 1);
  }

  table.rowWeight(1, 3);

  return table;
};

export default ({ element, plot, config }) => {
  const {
    title = null,

    titleAlignment = 'left',

    groupBy,

    colors = [],

    coloring = null,

    labeling,

    time = {
      interpolate: false,
    },

    showLabels = true,

    linearAxis,

    timeAxis,

    anchor,

    legend = {},
  } = config;

  const timeScale = createTimeScale(timeAxis);
  const linearScale = createLinearScale(linearAxis);
  const colorScale = new Plottable.Scales.Color();

  const table = createChartTable({
    title: createTitle({ title, titleAlignment }),

    chart: createPlotAreaWithAxes({
      plotArea: createPlotWithGridlines({
        plot: createTimePlot({
          plot,
          timeScale,
          linearScale,
          showLabels,
        }),
        grid: createLinearAxisGridLines({
          ...linearAxis,
          orientation: 'vertical',
          scale: linearScale,
        }),
      }),

      linearAxis: createNumericAxis({
        ...linearAxis,
        axisScale: linearScale,
        axisOrientation: 'vertical',
      }),

      categoryAxis: createTimeAxis({
        ...timeAxis,
        axisScale: timeScale,
        axisOrientation: 'horizontal',
      }),

      anchor,
    }),

    legend: createColorLegend(colorScale, legend),

    legendPosition: legend.position || 'bottom',
  });

  const animate = createScaleAnimator(500); // TODO: Allan

  const listeners = [];

  plot.onAnchor(createLineTipper(element, labeling, timeScale, 'vertical'));

  let moveAnchor = null;

  table.addClass('timeline');

  table.renderTo(element);

  if (anchor) {
    const onTableAnchored = table => {
      // waiting till table is setup, hopefully 500ms will
      // always be sufficient
      // TODO: Use onRender event instead
      // see https://github.com/palantir/plottable/issues/1755
      setTimeout(() => {
        moveAnchor = createTimeAnchor(table, timeScale, anchor, legend, listeners);
      }, 500);
    };

    table.onAnchor(onTableAnchored);
  }

  const chart = {
    table,

    update: (data = []) => {
      const groupIds = makeUnique(data.map(d => d[groupBy]));

      if (legend.showLegend) {
        colorScale
          .domain(groupIds.map(groupId => groupId || 'Unknown'))
          .range(groupIds.map((d, i) => colors[i] || '#abc'));
      }

      const startYear =
        timeAxis.axisMinimum || Math.min.apply(null, data.map(d => d[timeAxis.indicator]));
      const stopYear =
        timeAxis.axisMaximum || Math.max.apply(null, data.map(d => d[timeAxis.indicator]));

      const datasets = groupIds.map((groupId, index) => {
        const group = data.filter(d => d[groupBy] === groupId);

        const dataset = group.reduce(
          (map, item) => ({
            ...map,

            [item[timeAxis.indicator]]: [
              ...(map[item[timeAxis.indicator]] || []),
              {
                group: groupId,
                label: item[timeAxis.indicator],
                value: item[linearAxis.indicator],
                color: item[coloring] || colors[index] || '#abc',
                opacity: 1,
              },
            ],
          }),
          {},
        );

        if (!time.interpolate) {
          for (let year = startYear; year <= stopYear; year++) {
            if (!dataset[year]) {
              dataset[year] = [
                {
                  group: groupId,
                  label: year,
                  value: 0,
                  color: group[0][coloring] || colors[index] || '#abc',
                  opacity: 1,
                },
              ];
            }
          }
        }
        return Object.keys(dataset).map(year =>
          dataset[year].reduce((s, d) => ({ ...s, value: s.value + d.value })));
      });

      if (plot.datasets().length) {
        const sums = [];

        for (let i = 0; i < Math.max.apply(null, datasets.map(d => d.length)); i += 1) {
          sums[i] = datasets.reduce((sum, set) => sum + (set[i] ? set[i].value : 0), 0);
        }

        const axisMaximum = Math.max.apply(null, sums);

        animate([linearScale], [linearAxis.axisMinimum || 0, axisMaximum]);
      }

      plot.datasets(datasets.map(d => new Plottable.Dataset(d)));
    },

    onAnchorMoved(callback = null) {
      if (callback && callback.call) {
        listeners.push(callback);
      }
    },

    moveAnchor: year => {
      if (!moveAnchor) {
        // Retry if anchor is not ready
        setTimeout(() => chart.moveAnchor(year.toString()), 200);
      } else {
        moveAnchor(year);
      }
    },

    destroy: () => {
      table.destroy();
    },
  };

  return chart;
};
