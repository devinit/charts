import Plottable from "plottable";
import {createTitle} from "./createTitle";
import {createChartTable} from "./createTable";
import {createTreeDataset} from "./createDataset";
import drawLabels from './drawLabels';

/**
 * @typedef {Object} TreeChart
 * @private
 * @property {string} type - Type
 * @property {string} title - Title
 * @property {'left'|'center'|'right'} titleAlignment=left - Title Alignment
 * @property {('vertical'|'horizontal')} orientation=vertical - Orientation
 * @property {Tree} tree - Hierachy Configuration
 */

/**
 * @typedef {Object} Tree
 * @private
 * @property {indicator} id - ID Reference
 * @property {indicator} parent - Parent Indicator
 * @property {indicator} value - Value Indicator
 */

export default ({element, plot, config}) => {

  const {

    title = null,

    titleAlignment = 'left',

    orientation = 'vertical',

    colors = [],

  } = config;

  const xScale = new Plottable.Scales.Linear();
  xScale.domainMin(0);
  xScale.domainMax(1);

  const yScale = new Plottable.Scales.Linear();
  yScale.domainMin(0);
  yScale.domainMax(1);

  const x = orientation === 'vertical' ? 'x' : 'y';
  const y = orientation === 'horizontal' ? 'x' : 'y';

  plot._drawLabels = drawLabels;

  plot
    .x(d => d[`${x}0`], xScale)
    .y(d => d[`${y}0`], yScale)
    .x2(d => d[`${x}1`], xScale)
    .y2(d => d[`${y}1`], yScale)
    .attr("fill", d => colors[0] || '#abc')
    .attr("stroke", d => '#fff')
    .attr("stroke-width", () => 2)
    .labelsEnabled(true)
    .label(d => d.data.label);

  const table = createChartTable({
    title: createTitle({title, titleAlignment}),
    chart: plot
  });

  table.renderTo(element);

  const addData = (data = null) => {
    if (data) {

      plot.datasets(createTreeDataset(data));
    }
  };

  const onClick = (callback = d => d) => {

    const interaction = new Plottable.Interactions.Click()
      .onClick(function (point) {

        const entities = plot.entitiesAt(point);

        if (entities.length) {
          callback(entities, xScale, yScale)
        }

      });

    interaction.attachTo(plot);

  };

  const onPointerEnter = (callback = d => d) => {

    const interaction = new Plottable.Interactions.Pointer()
      .onPointerEnter(function (point) {

        const entities = plot.entitiesAt(point);

        if (entities.length) {
          callback(entities[0])
        }

      });

    interaction.attachTo(plot);

  };

  const onPointerExit = (callback = d => d) => {

    const interaction = new Plottable.Interactions.Pointer()
      .onPointerEnter(function (point) {

        const entities = plot.entitiesAt(point);

        if (entities.length) {
          callback(entities[0])
        }

      });

    interaction.attachTo(plot);

  };

  return {

    table,

    addData,

    onClick,

    onPointerEnter,

    onPointerExit,
  };
};