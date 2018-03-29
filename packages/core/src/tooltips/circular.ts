import * as Plottable from 'plottable';
import Tooltip from 'tooltip.js';
import * as hash from 'object-hash';
import { color } from 'd3';
import {approximate} from '@devinit/prelude/lib/numbers';
import { ITooltip } from './types';

export default (container: HTMLElement, tooltips: ITooltip) => {
  let currentId: string | null = null;
  const { enable = true } = tooltips;

  // ...
  if (!enable)  {
    // tslint:disable-next-line:no-empty
    return () => {};
  }

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
        '<div class="tooltip" role="tooltip" style="text-align: left;">' +
        '<div class="tooltip-arrow"></div>' +
        '<div id="tt-title" class="tooltip-inner"></div>' +
        '<div id="tt-body" class="tooltip-body"></div>' +
        '</div>',
    });

    tip.show();
    const titleNode = tip._tooltipNode.querySelector('#tt-title');
    const bodyNode = tip._tooltipNode.querySelector('#tt-body');
    tip.hide();

    const interaction = new Plottable.Interactions.Pointer()
      // tslint:disable-next-line:no-empty
      .onPointerEnter(() => {})
      .onPointerMove(p => {
        const [entity] = plot.entitiesAt(p);

        requestAnimationFrame(() => {
          tooltipAnchor
            .attr('cx', p.x)
            .attr('cy', p.y);
          tip.hide();

          if (entity) tip.show();

          if (entity && entity.datum.id !== currentId) {
            titleNode.innerText = entity.datum.label;
            bodyNode.innerText = approximate(entity.datum.value);

            currentId = hash(entity.datum);

            plot.entities().forEach(_entity => {
              if (entity.selection.attr('initial-fill')) {
                entity.selection.attr('fill', entity.selection.attr('initial-fill'));
              } else {
                entity.selection.attr('initial-fill', entity.selection.attr('fill'));
              }
            });

            const fill = color(entity.selection.attr('initial-fill')).darker(0.8);

            entity.selection.attr('fill', fill);
          }
        });
      })
      .onPointerExit(() => {
        tip.hide();

        currentId = null;
      })
      .attachTo(plot);

    plot.onDetach(() => interaction.detachFrom(plot));
  };
};
