import * as Plottable from 'plottable';
import Tooltip from 'tooltip.js';
import {approximate} from '@devinit/prelude/lib/numbers';

export interface TooltipI {
  enable: boolean;
  titleIndicator: any;
}
export default (container, tooltips: TooltipI, axes) => {
  let currentId: string | null = null;
  const { enable = true, titleIndicator } = tooltips as any;

  if (!enable || !titleIndicator) {
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

    const interaction = new Plottable.Interactions.Pointer()
      // tslint:disable-next-line:no-empty
      .onPointerEnter(() => {})
      .onPointerMove(p => {
        const [entity] = plot.entitiesAt(p);

        requestAnimationFrame(() => {
          if (entity) {
            const id = `${entity.datum.x}-${entity.datum.y}`;

            if (id !== currentId) {
              tip.hide();
              tooltipAnchor.attr('cx', entity.position.x).attr('cy', entity.position.y);
              tip.show();

              tip._tooltipNode.querySelector('#tt-title').innerText =
                titleIndicator && entity.datum[titleIndicator];
              tip._tooltipNode.querySelector('#tt-body').innerHTML = `<table>${axes
                .filter(axis => axis && entity.datum[axis.indicator || ''])
                .map(axis =>
                  `<tr>
                    <td>${axis.axisLabel || axis.label}</td>
                    <td style="text-align: right">${approximate(entity.datum[axis.indicator])}</td>
                  </tr>`)
                .join('')}
              </table>`;

              currentId = `${entity.datum.x}-${entity.datum.y}`;
            }
          } else {
            currentId = null;
            tip.hide();
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
