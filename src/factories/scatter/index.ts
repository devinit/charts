import * as Plottable from 'plottable';
import { createLinearScale } from '../scale';
import { createNumericAxis } from '../axis';
import { createScatterGridLines } from '../grid';
import { createChartTable } from '../table';
import { createTitle } from '../title';
import { createColorLegend } from '../legend';
import createDataAnimator from '../animator/data';
import { createScatterClickTipper, createScatterTipper } from '../tooltips';
import { createScatterPlot, createPlotAreaWithAxes } from './helpers';
import createScatterAnnotations from './annotations';

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
 * @property {Tooltip} tooltips - Tooltips
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
export default ({ element, plot, config }) => {
  const {
    title,

    titleAlignment = 'left',

    idIndicator = 'id',

    groupBy,

    colors = [],

    coloring = null,

    horizontalAxis,

    verticalAxis,

    bubble,

    legend = {},

    annotations = [],

    tooltips = {
      enable: true,
    },
  } = config;

  const horizontalScale = createLinearScale(horizontalAxis);
  const verticalScale = createLinearScale(verticalAxis);

  const bubbleScale = createLinearScale({});
  const colorScale = new Plottable.Scales.Color();

  const scatterPlot = createScatterPlot({
    plot,
    horizontalScale,
    verticalScale,
    bubbleScale,
    idIndicator,
  });
  const scatterGridLines = createScatterGridLines({
    horizontalScale,
    verticalScale,
    horizontalAxis,
    verticalAxis,
  });

  // TODO: Add bubble scale legend

  const vAxis = createNumericAxis({
    axisScale: verticalScale,
    axisOrientation: 'vertical',
    ...verticalAxis,
  });

  const hAxis = createNumericAxis({
    axisScale: horizontalScale,
    axisOrientation: 'horizontal',
    ...horizontalAxis,
  });

  const table = createChartTable({
    title: createTitle({ title, titleAlignment }),

    chart: createPlotAreaWithAxes({
      verticalAxis: vAxis,

      horizontalAxis: hAxis,

      plotArea: new Plottable.Components.Group([scatterGridLines, scatterPlot]),
    }),

    legend: createColorLegend(colorScale, legend),

    legendPosition: legend.position || 'bottom',
  });

  // ...
  const selectionListeners: any[] = [];
  const animate = createDataAnimator(idIndicator, ['x', 'y', 'z'], 2000);
  const clickTipper = createScatterClickTipper(element, tooltips, idIndicator, selectionListeners);
  const tipper = createScatterTipper(element, tooltips, [verticalAxis, horizontalAxis, bubble]);

  table.renderTo(element);

  plot.onAnchor(plot => {
    setTimeout(() => {
      if (tooltips.enable) {
        tipper(plot);
        clickTipper.init(plot);
      }
    }, 500);
  });

  const update = data => {
    bubbleScale.domain([0, 3e2]).range([12, 50]);

    // eslint-disable-next-line
    const callback = () => {
      // const rangeMinimum = Math.min.apply(null, data.map(d => d.z));
      // const rangeMaximum = Math.max.apply(null, data.map(d => d.z));
      clickTipper.update();
    };

    const mapping = data.reduce((groups, datum) => {
      return {
        ...groups,

        [datum[groupBy]]: [
          ...(groups[datum[groupBy]] || []),

          {
            ...datum,
            x: datum[horizontalAxis.indicator],
            y: datum[verticalAxis.indicator],
            z: datum[bubble.indicator] || 12,
          },
        ],
      };
    }, {});

    const datasets = Object.keys(mapping).map((group, index) =>
      mapping[group].map(d => ({
        ...d,
        color: d[coloring] || colors[index] || '#abc',
      })));

    colorScale
      .domain(Object.keys(mapping))
      .range(Object.keys(mapping).map((_, index) => colors[index] || '#abc'));

    if (!scatterPlot.datasets().length) {
      const dataset = datasets.reduce((all, set) => [...all, ...set], []);

      if (bubble) {
        callback();
      }

      scatterPlot.datasets([new Plottable.Dataset(dataset)]);
    } else {
      animate(scatterPlot, callback, datasets);
    }

    createScatterAnnotations({
      annotations,
      verticalScale,
      horizontalScale,
      plot,
    });
  };

  return {
    _config: config,

    table,

    verticalScale,

    horizontalScale,

    verticalAxis: vAxis,

    horizontalAxis: hAxis,

    plot,

    update,

    destroy: () => {
      table.destroy();
    },

    onSelect: (callback: any) => {
      selectionListeners.push(callback);
    },
    // TODO: updateHorizontalAxi & updateVerticalAxis have wrong types
    // updateHorizontalAxis: config => {
    //   createNumericAxis(config, hAxis);
    // },

    // updateVerticalAxis: config => {
    //   createNumericAxis(config, vAxis);
    // },
  };
};
