import * as Plottable from 'plottable';
import { color } from 'd3';
import {approximate} from '@devinit/prelude/lib/numbers';
import { createCategoricChart, CategoricChart, CategoricConfig, BarPlot } from '@devinit-charts/core/lib/categoric';
import {Labeling} from '@devinit-charts/core/lib/types';
import createBarTipper from '../tooltip';
import {createCustomLabels} from '../labeler';
import { Component } from 'plottable';
import { BarOrientation } from 'plottable/build/src/plots';

// export type BarPlot = Plots.Bar<any, any>;
export type Config = CategoricConfig & {
  interactions?: {enable?: boolean};
  highlight?: string[]; // bars to highlight
  tooltips?: {enable?: boolean};
};

export interface BarInteractionOpts {
  orientation?: BarOrientation;
  labeling?: Labeling;
  highlight?: string[];
}

const createBarInteraction = (opts: BarInteractionOpts) =>  {
  const {orientation = 'vertical', labeling, highlight = []} = opts;

  const { prefix = '', suffix = '' } = labeling || {};

  let currentId: string | null = null;

  const reset = plot => {
    plot.entities().forEach(entity => {
      if (!entity.selection.attr('initial-fill')) {
        entity.selection.attr('initial-fill', entity.selection.attr('fill'));
      } else {
        entity.selection.attr('fill', entity.selection.attr('initial-fill'));
      }
    });

    plot
      .foreground()
      .select('text')
      .remove();
  };

  return (plot: BarPlot) => {
    // QUICKFIX: Highlight some bars in a bar chart
    if (highlight.length) {
      plot
        .entities()
        .filter((entity => highlight.indexOf(entity.datum.label) > -1))
        .forEach(entity => {
          const node = entity.selection.node() as any; // TODO: fix me, this is a hack
          if (!node) return plot;
          const {
            x, y, width, height
          } = node.getBBox();

          plot
            .background()
            .append('text')
            .attr('class', 'plot-label hover-label')
            .attr('x', orientation === 'vertical' ? (x + width) / 2 : width + x + 5)
            .attr('y', orientation === 'horizontal' ? (y + height) / 2 : y - 10)
            .attr('text-anchor', orientation === 'vertical' ? 'middle' : 'start')
            .attr('style', `fill: ${entity.selection.attr('fill')}`)
            .text(`${prefix}${approximate(entity.datum.value)}${suffix}`);
        });
    }

    const interaction = new Plottable.Interactions.Pointer()
      .onPointerExit(() => {
        reset(plot);
        currentId = null;
      })
      .onPointerMove(point => {
        const [entity] = plot.entitiesAt(point);
        const id = entity && `${entity.position.x.toFixed(3)}-${entity.position.y.toFixed(3)}`;

        if (id && id !== currentId) {
          reset(plot);
          const node = entity.selection.node() as any;
          const {
            x, y, width, height
          } = node.getBBox();

          plot
            .foreground()
            .append('text')
            .attr('class', 'plot-label hover-label')
            .attr('x', orientation === 'vertical' ? x + width / 2 : width + x + 5)
            .attr('y', orientation === 'horizontal' ? y + height / 2 : y - 10)
            .attr('text-anchor', orientation === 'vertical' ? 'middle' : 'start')
            .attr('style', `fill: ${entity.selection.attr('fill')}`)
            .text(`${prefix}${approximate(entity.datum.value)}${suffix}`);

          const fill = color(entity.selection.attr('initial-fill')).darker(0.7);

          entity.selection.attr('fill', fill.toString());

          currentId = id;
        }
      });

    interaction.attachTo(plot);

    plot.onDetach(_plot => {
      interaction.detachFrom(_plot);
    });
  };
};

export default (element: HTMLElement, plot: BarPlot, config: Config): CategoricChart => {
  const {
    interactions = { enable: false },
    tooltips = { enable: true },
    labeling = {showLabels: false},
    orientation,
    highlight
  } = config;

  const chart: CategoricChart = createCategoricChart({ element, plot, config });

  plot.onAnchor((_plotComponent: Component) => {
    setTimeout(() => {
      if (interactions.enable) {
        createBarInteraction({orientation, labeling, highlight})(plot);
      }
      if (labeling.custom) {
        createCustomLabels({prefix: labeling.prefix, plot});
      }
      if (tooltips.enable) {
        createBarTipper(element, labeling, config.orientation || 'vertical')(plot);
      }
    }, 500);
  });

  return chart;
};
