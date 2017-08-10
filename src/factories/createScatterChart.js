import Plottable from "plottable";
import {createLinearScale} from "./createScale";
import {createNumericAxis} from "./createAxis";
import {createScatterGridLines} from "./createGrid";
import {createChartTable} from "./createTable";
import {createTitle} from "./createTitle";
import {createColorLegend} from "./createLegend";
//noinspection JSFileReferences
import Tooltip from "tooltip.js";
import {color} from "d3";

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

    annotations = [],

    tooltips = {}

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

  plot.onAnchor(createTipper(element, tooltips, [verticalAxis, horizontalAxis, bubble]));

  const addData = data => {

    if (bubble) {
      const rangeMaximum = Math.max.apply(null, data.map(d => d[bubble.indicator]));
      bubbleScale
        .domain([0, rangeMaximum])
        .range([10, 50]);
    }

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
              ...(bubble ? {z: datum[bubble.indicator]} : {})
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

    createScatterAnnotations({
      annotations,
      verticalScale,
      horizontalScale,
      plot
    })
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

const createScatterAnnotations = ({annotations, verticalScale, horizontalScale, plot}) => {

  plot.background().selectAll('.annotation-background').remove();

  plot.foreground().selectAll('.annotation-text').remove();

  annotations.forEach(({title, body, fill, horizontalAxis = {}, verticalAxis = {}}) => {
    const x0 = horizontalScale.scale(
      typeof horizontalAxis.minimum !== 'number' || horizontalAxis.minimum < horizontalScale.domainMin() ?
        horizontalScale.domainMin() :
        horizontalAxis.minimum
    );

    const x1 = horizontalScale.scale(
      !horizontalAxis.maximum || horizontalAxis.maximum > horizontalScale.domainMax() ?
        horizontalScale.domainMax() :
        horizontalAxis.maximum
    );

    const y0 = verticalScale.scale(
      !verticalAxis.maximum || verticalAxis.maximum > verticalScale.domainMax() ?
        verticalScale.domainMax() :
        verticalAxis.maximum
    );

    const y1 = verticalScale.scale(
      !verticalAxis.minimum || verticalAxis.minimum < verticalScale.domainMin() ?
        verticalScale.domainMin() :
        verticalAxis.minimum
    );

    const colorFill = fill || '#ccc';
    const {r, g, b} = color(colorFill).rgb();
    const brightness = (r + g + b) / (256 * 3);

    plot
      .background()
      .append('rect')
      .attr('class', 'annotation-background')
      .attr('x', x0)
      .attr('y', y0)
      .attr('width', x1 - x0)
      .attr('height', y1 - y0 - 10)
      .attr('fill', fill || '#ccc')
      .attr('opacity', '0.5');

    plot
      .foreground()
      .append('foreignObject')
      .attr('class', 'annotation-text')
      .attr('width', x1 - x0)
      .attr('height', y1 - y0 - 10)
      .attr('x', x0)
      .attr('y', y0)
      .html(`
            <div class="${brightness > 0.5 ? 'dark' : 'light'}-label plot-label" style="text-align: left">
              <div class="plot-label-header">${title}</div>
              <div class="plot-label-value">${body || ''}</div>
            </div>
          `);

  })
};

const createScatterPlot = ({plot, horizontalScale, verticalScale, bubbleScale}) => {
  plot
    .attr('name', d => d.z)
    .attr('fill', d => d.color)
    .attr('stroke', 'rgb(51, 51, 51)')
    .attr('stroke-width', 2)
    .attr('opacity', 0.8)
    .x(d => d.x, horizontalScale)
    .y(d => d.y, verticalScale)

  if (bubbleScale) {
    plot.size(d => d.z, bubbleScale);
  } else {
    plot.size(d => 12, createLinearScale({}).domain([0, 100]).range([0, 100]));
  }
  return plot
};


const createPlotAreaWithAxes = ({horizontalAxis, plotArea, verticalAxis}) => {
  const plotAreaWithAxes = [[verticalAxis, plotArea], [null, horizontalAxis]];

  return new Plottable.Components.Table(plotAreaWithAxes);
};

export const createTipper = (container, tooltips = {}, axes) => {

  const {
    enable = true,
    titleIndicator,
  } = tooltips;

  if (!enable) {
    return (plot) => {};
  }

  return function (plot) {

    let currentId = null;

    const tooltipAnchor = plot.foreground()
      .append('circle')
      .attr('r', 3)
      .attr('fill', 'transparent');

    const tip = new Tooltip(tooltipAnchor.node(), {
      title: 'Tooltip',
      container: container,
      template: '<div class="tooltip" role="tooltip" style="text-align: left;">' +
      '<div class="tooltip-arrow"></div>' +
      '<div id="tt-title" class="tooltip-inner"></div>' +
      '<div id="tt-body" class="tooltip-body"></div>' +
      '</div>'
    });

    const interaction = new Plottable.Interactions.Pointer()
      .onPointerEnter(() => {
      })
      .onPointerMove(p => {

        const [entity] = plot.entitiesAt(p);

        requestAnimationFrame(() => {

          if (entity) {
            const id = `${entity.datum.x}-${entity.datum.y}`;

            if (id !== currentId) {
              tip.hide();
              tooltipAnchor
                .attr('cx', entity.position.x)
                .attr('cy', entity.position.y);
              tip.show();

              tip._tooltipNode.querySelector('#tt-title').innerText = titleIndicator && entity.datum[titleIndicator];
              tip._tooltipNode.querySelector('#tt-body').innerHTML = `<table>${
                axes
                  .filter(axis => axis)
                  .map(axis => `<tr><td>${axis.axisLabel || axis.label}</td><td>${entity.datum[axis.indicator]}</td></tr>`)
                  .join('')
                }
              </table>`;

              currentId = `${entity.datum.x}-${entity.datum.y}`;
            }
          } else {
            currentId = null;
            tip.hide();
          }
        })

      })
      .onPointerExit(() => {

        tip.hide();

        currentId = null;
      })
      .attachTo(plot);

    plot.onDetach(() => interaction.detachFrom(plot))

  }
};