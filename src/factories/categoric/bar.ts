import * as Plottable from 'plottable';
import { color } from 'd3';
import {approximate} from '@devinit/prelude/lib/numbers';
import { createCategoricChart, CategoricChart } from '.';
import { createBarTipper } from '../tooltips';
import {createCustomLabels} from './helper';

export interface Labeling {
  prefix: string;
  suffix: string;
}
const createBarInteraction = (orientation = 'vertical', labeling: Labeling, highlight: string[] = []) => {
  const { prefix = '', suffix = '' } = labeling;

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

  return plot => {
    // QUICKFIX: Highlight some bars in a bar chart
    if (highlight.length) {
      plot
        .entities()
        .filter((entity => highlight.indexOf(entity.datum.label) > -1))
        .forEach(entity => {
          const {
            x, y, width, height
          } = entity.selection.node().getBBox();

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

          const {
            x, y, width, height
          } = entity.selection.node().getBBox();

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

          entity.selection.attr('fill', fill);

          currentId = id;
        }
      });

    interaction.attachTo(plot);

    plot.onDetach(_plot => {
      interaction.detachFrom(_plot);
    });
  };
};

export default (element, plot, config) => {
  const { interactions = { enable: false }, tooltips = { enable: true } } = config;
  const chart: CategoricChart = createCategoricChart({ element, plot, config });

  plot.onAnchor(_plot => {
    setTimeout(() => {
      if (interactions.enable) {
        createBarInteraction(config.orientation, config.labeling, config.highlight)(_plot);
      }
      if (config.labeling.custom) {
        createCustomLabels(config.labeling, _plot);
      }
      if (tooltips.enable) {
        createBarTipper(element, config.labeling, config.orientation)(_plot);
      }
    }, 500);
  });
  return chart;
};
