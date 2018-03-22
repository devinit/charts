import * as Plottable from 'plottable';
import { color } from 'd3';
import Tooltip from 'tooltip.js';
import {approximate} from '@devinit/prelude/lib/numbers';

type PercentageCalculator = (datum: {x1: number, x0: number; y0: number, y1: number}) => number;

export default (container, labeling, percentage: PercentageCalculator) => {
  let currentId = null;

  return plot => {
    const tooltipAnchor = plot
      .foreground()
      .append('circle')
      .attr('r', 3)
      .attr('fill', 'transparent');

    const tip = new Tooltip(tooltipAnchor.node(), {
      title: 'Tooltip',
      container,
      template:
        '<div class="tooltip" role="tooltip">' +
        '<div class="tooltip-arrow"></div>' +
        '<div id="tt-title" class="tooltip-inner"></div>' +
        '<div id="tt-body" class="tooltip-body"></div>' +
        '</div>',
    });

    const interaction = new Plottable.Interactions.Pointer()
      .onPointerEnter(() => {
        tip.show();
      })
      .onPointerMove(p => {
        const [entity] = plot.entitiesAt(p);

        requestAnimationFrame(() => {
          tooltipAnchor
            .attr('cx', p.x)
            .attr('cy', p.y);
          tip.hide();

          if (entity) tip.show();

          if (entity && entity.datum.id !== currentId) {
            const percent = percentage(entity.datum);
            tip._tooltipNode.querySelector('#tt-title').innerText = entity.datum.id;
            const label = labeling.showValues ? `| ${labeling.prefix || ''} ${approximate(entity.datum.value)}` : '';
            tip._tooltipNode.querySelector('#tt-body').innerText =
              percent === 100 || percent < 1 ? '' : `${percent}% ${label}`;

            currentId = entity.datum.id;

            plot.entities().forEach(_entity => {
              if (_entity.selection.attr('initial-fill')) {
                _entity.selection.attr('fill', _entity.selection.attr('initial-fill'));
              } else {
                _entity.selection.attr('initial-fill', _entity.selection.attr('fill'));
              }
            });

            const fill = color(entity.selection.attr('initial-fill')).darker(0.8);

            entity.selection.attr('fill', fill);
          }
        });
      })
      .onPointerExit(() => {
        tip.hide();

        plot.entities().forEach(_entity => {
          if (_entity.selection.attr('initial-fill')) {
            _entity.selection.attr('fill', _entity.selection.attr('initial-fill'));
          } else {
            _entity.selection.attr('initial-fill', _entity.selection.attr('fill'));
          }
        });

        currentId = null;
      })
      .attachTo(plot);

    plot.onDetach(() => interaction.detachFrom(plot));
  };
};
