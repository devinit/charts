import {Scales, Interactions} from 'plottable';
import Tooltip from 'tooltip.js';
import {Labeling} from '@devinit-charts/core/lib/types';
import {approximate} from '@devinit/prelude/lib/numbers';

export type CreateLineTipper = (
  container: HTMLElement | string,
  labeling: Labeling,
  scale: Scales.Category | Scales.Time)
  => (plot: any) => any;

const createLineTipper: CreateLineTipper = (container, labeling, scale) => {
  let currentHash = null;
  const {
    prefix = '',
    suffix = ''
  } = labeling as any;
  return plot => {
    const tooltipAnchor = plot
      .foreground()
      .append('circle')
      .attr('r', 3)
      .attr('fill', 'transparent');

    const tip = new Tooltip(tooltipAnchor.node(), {
      title: 'Tooltip',
      container,
      template: `
          <div class="tooltip" role="tooltip">
            <div class="tooltip-arrow"></div>
            <div id="tt-title" class="tooltip-inner"></div>
            <div id="tt-body" class="tooltip-body"></div>
          </div>
      `,
    });

    const template = datum => `
        <div>
          <span style="background: ${datum.color}; width: 10px; height: 10px; display: inline-block"></span>
          <span>${datum.group ? `${datum.group}:` : ''} ${prefix}${approximate(datum.value)}${suffix}</span>
        </div>
      `;

    const interaction = new Interactions.Pointer()
      .onPointerEnter(() => tip.show())
      .onPointerExit(() => {
        tip.hide();
        currentHash = null;
      })
      .onPointerMove(point => {
        let halfStepWidth = 0;

        if ((scale as Scales.Category).stepWidth) {
          halfStepWidth = (scale as Scales.Category).stepWidth() / 2;
        } else if ((scale as Scales.Time).tickInterval) {
          halfStepWidth = plot.width() / ((scale as Scales.Time).tickInterval('year').length * 2);
        }

        const entities = plot.entitiesIn(
          {min: point.x - halfStepWidth, max: point.x + halfStepWidth},
          {
            min: 0,
            max: plot.height(),
          },
        );

        const position = entities
          .reduce(
            ([p], e) => [
              {
                x: [...p.x, e.position.x],
                y: [...p.y, e.position.y],
              },
            ],
            [{x: [], y: []}],
          )
          .map(({x, y}) => ({
            x: x.reduce((sum, k) => sum + k, 0) / x.length,
            y: Math.min.apply(null, y),
          }))
          .reduce((_, d) => d);

        const hash = position.x.toString() + position.y.toString();

        if (entities.length && currentHash !== hash) {
          requestAnimationFrame(() => {
            tip.hide();
            tooltipAnchor.attr('cx', position.x);
            tooltipAnchor.attr('cy', position.y);
            tip.show();
            tip._tooltipNode.querySelector('#tt-title').innerText = entities[0].datum.label;
            tip._tooltipNode.querySelector('#tt-body').innerHTML = entities
              .map(e => template(e.datum))
              .join('');
            currentHash = hash;
          });
        }
      });

    interaction.attachTo(plot);

    plot.onDetach(_plot => {
      interaction.detachFrom(_plot);
      tip.dispose();
    });
  };
};
export default createLineTipper;
