import Plottable from "plottable";
import {color} from "d3";
//noinspection JSFileReferences
import Tooltip from "tooltip.js";
import {createTitle} from "./createTitle";
import {createChartTable} from "./createTable";
import {createTreeDataset} from "./createDataset";
import approximate from "./approximate";

/**
 * @typedef {Object} TreeChart
 * @private
 * @property {string} type - Type
 * @property {string} title - Title
 * @property {'left'|'center'|'right'} titleAlignment=left - Title Alignment
 * @property {string[]} colors - Colors
 * @property {indicator} coloring - Color Indicator
 * @property {Labeling} labeling - Label Configuration
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

    labeling = {}

  } = config;

  const xScale = new Plottable.Scales.Linear();
  xScale.domainMin(0);
  xScale.domainMax(1);

  const yScale = new Plottable.Scales.Linear();
  yScale.domainMin(0);
  yScale.domainMax(1);

  const x = orientation === 'vertical' ? 'x' : 'y';
  const y = orientation === 'horizontal' ? 'x' : 'y';

  plot
    .x(d => d[`${x}0`], xScale)
    .y(d => d[`${y}0`], yScale)
    .x2(d => d[`${x}1`], xScale)
    .y2(d => d[`${y}1`], yScale)
    .attr("fill", d => d.color || '#abc')
    .attr("stroke", '#fff')
    .attr("stroke-width", 1)
    .labelsEnabled(labeling.showLabels || true)
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

    plot.onDetach(plot => {
      interaction.detachFrom(plot);
      tip.dispose()
    })

  };

  return {

    table,

    addData,

    update: addData,

    onClick,

    destroy: () => {
      table.destroy();
    }
  };
};

export const createColorFiller = (colors = [], rules, indicator) => d => {

  d.eachBefore((node) => {
    if (node.depth === 0) {
      node.color = node.data[indicator] || colors[0] || '#abc'
    }

    else if (node.depth === 1) {
      node.color = node.data[indicator] || colors[node.parent.children.indexOf(node) % colors.length]
    }

    else {
      node.color = node.data[indicator] || node.parent.color
    }
  });

  return d;
};

export const createTipper = (container, labeling, percentage = d => 100) => {

  return function (plot) {

    let currentId = null;

    const foreignObject = plot.foreground()
      .append('foreignObject')
      .html('<div id="tooltip-container"></div>');

    const tooltipAnchor = plot.foreground()
      .append('circle')
      .attr('r', 3)
      .attr('fill', 'transparent');

    const tip = new Tooltip(tooltipAnchor.node(), {
      title: 'Tooltip',
      container: container,
      template: '<div class="tooltip" role="tooltip">' +
      '<div class="tooltip-arrow"></div>' +
      '<div id="tt-title" class="tooltip-inner"></div>' +
      '<div id="tt-body" class="tooltip-body"></div>' +
      '</div>'
    });

    const interaction = new Plottable.Interactions.Pointer()
      .onPointerEnter(() => {
        tip.show()
      })
      .onPointerMove(p => {

        const [entity] = plot.entitiesAt(p);

        requestAnimationFrame(() => {
          tooltipAnchor.attr('cx', p.x).attr('cy', p.y);
          tip.hide();

          if (entity) tip.show();

          if (entity && entity.datum.id !== currentId) {
            const percent = percentage(entity.datum);
            tip._tooltipNode.querySelector('#tt-title').innerText = entity.datum.id;
            tip._tooltipNode.querySelector('#tt-body').innerText
              = `${percent === 100 ? '' : `${percent}% | `} ${labeling.prefix || ''} ${approximate(entity.datum.value)} ${labeling.suffix || ''}`;

            currentId = entity.datum.id;

            plot.entities()
              .forEach(entity => {
                if (entity.selection.attr('initial-fill')) {
                  entity.selection.attr("fill", entity.selection.attr('initial-fill'));
                } else {
                  entity.selection.attr("initial-fill", entity.selection.attr('fill'));
                }
              });

            const fill = color(entity.selection.attr('initial-fill')).darker(0.8);

            entity.selection.attr("fill", fill);
          }
        })

      })
      .onPointerExit(() => {

        tip.hide();

        plot.entities().forEach(entity => {
          if (entity.selection.attr('initial-fill')) {
            entity.selection.attr("fill", entity.selection.attr('initial-fill'));
          } else {
            entity.selection.attr("initial-fill", entity.selection.attr('fill'));
          }
        });

        currentId = null;
      })
      .attachTo(plot);

    plot.onDetach(() => interaction.detachFrom(plot))

  }
};