import * as Plottable from 'plottable';
import { createTitle } from '../title';
import { createChartTable } from '../table';
import { createTreeDataset } from '../dataset';
import { createColorLegend } from '../legend';

/**
 * @typedef {Object} TreeChart
 * @private
 * @property {string} type - Type
 * @property {string} title - Title
 * @property {'left'|'center'|'right'} titleAlignment=left - Title Alignment
 * @property {string[]} colors - Colors
 * @property {indicator} coloring - Color Indicator
 * @property {Labeling} labeling - Label Configuration
 * @property {TreeLegend} legend - Legend
 * @property {Tree} tree - Hierachy Configuration
 * @property {Tooltip} tooltips - Tooltips
 */

/**
 * @typedef {Object} Tree
 * @private
 * @property {indicator} id - ID Reference
 * @property {indicator} parent - Parent Indicator
 * @property {indicator} value - Value Indicator
 */
export interface Labeling {
  prefix: string;
  showLabels: boolean;
  showValues: any;
  showPercents: any;
  autofit: any;
  suffix: string;
}

export interface Legend {
  showLegend: boolean;
  position: Plottable.XAlignment;
  depth: number;
}

export interface Config {
  title?: string;
  titleAlignment?: Plottable.XAlignment;
  orientation: string;
  width: number;
  height: number;
  labeling: Labeling;
  legend: Legend;
}
export default ( element, plot, config: Config) => {
  const {
    titleAlignment = 'left',

    orientation = 'vertical',

    width,

    height,

    labeling,

    legend
  } = config;

  const xScale = new Plottable.Scales.Linear();
  xScale.domainMin(0);
  xScale.domainMax(width);

  const yScale = new Plottable.Scales.Linear();
  yScale.domainMin(0);
  yScale.domainMax(height);

  const colorScale = new Plottable.Scales.Color();

  const x = orientation === 'vertical' ? 'x' : 'y';
  const y = orientation === 'horizontal' ? 'x' : 'y';

  plot
    .x(d => d[`${x}0`], xScale)
    .y(d => d[`${y}0`], yScale)
    .x2(d => d[`${x}1`], xScale)
    .y2(d => d[`${y}1`], yScale)
    .attr('fill', d => d.color || '#abc')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1)
    .labelsEnabled(labeling && labeling.showLabels || true)
    .label(d => d.data.label);

  const colorLegend =
    createColorLegend(colorScale, { showLegend: legend.showLegend });

  const table = createChartTable({
    title: createTitle({ title: config.title, titleAlignment }),

    chart: plot,

    legend: colorLegend,

    legendPosition:  legend.position || 'bottom',
  });

  table.renderTo(element);

  const update = (data?: any) => {
    if (data) {
      plot.datasets(createTreeDataset(data));
    }

    if (legend.showLegend) {
      const leveled = data.filter(d => d.depth === legend.depth);
      colorScale.domain(leveled.map(d => d.id)).range(leveled.map(d => d.color));
    }
  };

  const onClick = (callback?: (entities: any, xScale: any, yScale: any) => void) => {
    const interaction = new Plottable.Interactions.Click()
      .onClick(point => {
        const entities = plot.entitiesAt(point);

        if (entities.length) {
          if (callback) callback(entities, xScale, yScale);
        }
      })
      .attachTo(plot);

    if (legend.showLegend && colorLegend) {
      const legendInteraction = new Plottable.Interactions.Click()
        .onClick(point => {
          const [clicked] = colorLegend.entitiesAt(point);

          if (clicked) {
            const entities = plot.entities().filter(d => d.datum.id === clicked.datum);

            if (callback) callback(entities, xScale, yScale);
          }
        })
        .attachTo(colorLegend);

      colorLegend.onDetach(_legend => {
        legendInteraction.detachFrom(_legend);
      });
    }

    plot.onDetach(_plot => {
      interaction.detachFrom(_plot);
    });
  };

  return {
    table,

    update,

    onClick,

    destroy: () => {
      table.destroy();
    },
  };
};

export const createColorFiller = (colors = [], indicator) => d => {
  d.eachBefore(node => {
    if (node.depth === 0) {
      node.color = node.data[indicator] || colors[0] || '#abc';
    } else if (node.depth === 1) {
      node.color =
        node.data[indicator] || colors[node.parent.children.indexOf(node) % colors.length];
    } else {
      node.color = node.data[indicator] || node.parent.color;
    }
  });

  return d;
};
