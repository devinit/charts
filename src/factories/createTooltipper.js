import Plottable from 'plottable';
import { color } from 'd3';
// noinspection JSFileReferences
import Tooltip from 'tooltip.js';
import approximate from './approximate';

/**
 * @typedef {Object} Tooltip
 * @property {boolean} enable
 */

export const createTreeTipper = (container, labeling, percentage = d => 100) => {
  return function (plot) {
    let currentId = null;

    const foreignObject = plot
      .foreground()
      .append('foreignObject')
      .html('<div id="tooltip-container"></div>');

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
          tooltipAnchor.attr('cx', p.x).attr('cy', p.y);
          tip.hide();

          if (entity) tip.show();

          if (entity && entity.datum.id !== currentId) {
            const percent = percentage(entity.datum);
            tip._tooltipNode.querySelector('#tt-title').innerText = entity.datum.id;
            tip._tooltipNode.querySelector('#tt-body').innerText = `${percent === 100
              ? ''
              : `${percent}% | `} ${labeling.prefix || ''} ${approximate(entity.datum.value, )} ${labeling.suffix || ''}`;

            currentId = entity.datum.id;

            plot.entities().forEach(entity => {
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

        plot.entities().forEach(entity => {
          if (entity.selection.attr('initial-fill')) {
            entity.selection.attr('fill', entity.selection.attr('initial-fill'));
          } else {
            entity.selection.attr('initial-fill', entity.selection.attr('fill'));
          }
        });

        currentId = null;
      })
      .attachTo(plot);

    plot.onDetach(() => interaction.detachFrom(plot));
  };
};

export const createBarTipper = (
  container,
  labeling = {},
  scale,
  orientation = 'vertical',
) => plot => {
  let currentHash = null;

  const foreignObject = plot
    .foreground()
    .append('foreignObject')
    .html('<div id="tooltip-container"></div>');

  const tooltipAnchor = plot
    .foreground()
    .append('circle')
    .attr('r', 3)
    .attr('fill', 'transparent');

  const placement = orientation => {
    return {
      vertical: 'top',
      horizontal: 'right',
      'inverted-vertical': 'bottom',
      'inverted-horizontal': 'left',
    }[orientation];
  };

  const tip = new Tooltip(tooltipAnchor.node(), {
    title: 'Tooltip',
    placement: placement(orientation),
    container,
    template: `
        <div class="tooltip" role="tooltip">
          <div class="tooltip-arrow"></div>
          <div id="tt-title" class="tooltip-inner"></div>
          <div id="tt-body" class="tooltip-body"></div>
        </div>
    `,
  });

  const template = datum => {
    const value = /inverted/.test(orientation) ? Math.abs(datum.value) : datum.value;
    return `
        <div>
          <span style="background: ${datum.color}; width: 10px; height: 10px; display: inline-block"></span>
          <span>${datum.group ? `${datum.group}:` : ''} ${approximate(value)}</span>
        </div>
      `;
  };

  const getEntities = point =>
    plot.entitiesIn(
      orientation === 'vertical'
        ? { min: point.x - 1, max: point.x + 1 }
        : { min: 0, max: plot.width() },
      orientation !== 'vertical'
        ? { min: point.y - 1, max: point.y + 1 }
        : { min: 0, max: plot.height() },
    );

  const getPosition = entities =>
    entities
      .reduce(
        ([p], e) => [
          {
            x: [...p.x, e.position.x],
            y: [...p.y, e.position.y],
          },
        ],
        [{ x: [], y: [] }],
      )
      .map(({ x, y }) => ({
        x:
          orientation === 'vertical'
            ? x.reduce((sum, k) => sum + k, 0) / x.length
            : Math.min.apply(null, x),
        y:
          orientation !== 'vertical'
            ? y.reduce((sum, k) => sum + k, 0) / y.length
            : Math.min.apply(null, y),
      }))
      .reduce((_, d) => d);

  const interaction = new Plottable.Interactions.Pointer()
    .onPointerExit(() => {
      tip.hide();
      currentHash = null;
    })
    .onPointerMove(point => {
      const entities = getEntities(point);

      const position = getPosition(entities);

      const sum = entities.reduce((sum, e) => sum + e.datum.value, 0);

      const hash = position.x.toString() + position.y.toString();

      if (entities.length && sum && currentHash !== hash) {
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

  plot.onDetach(plot => {
    interaction.detachFrom(plot);
    tip.dispose();
  });
};

export const createLineTipper = (
  container,
  labeling = {},
  scale,
  orientation = 'vertical',
) => plot => {
  let currentHash = null;

  const foreignObject = plot
    .foreground()
    .append('foreignObject')
    .html('<div id="tooltip-container"></div>');

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
        <span>${datum.group ? `${datum.group}:` : ''} ${approximate(datum.value)}</span>
      </div>
    `;

  const interaction = new Plottable.Interactions.Pointer()
    .onPointerEnter(() => tip.show())
    .onPointerExit(() => {
      tip.hide();
      currentHash = null;
    })
    .onPointerMove(point => {
      let halfStepWidth = 0;

      if (scale.stepWidth) {
        halfStepWidth = scale.stepWidth() / 2;
      } else if (scale.tickInterval) {
        halfStepWidth = plot.width() / (scale.tickInterval('year').length * 2);
      }

      const entities = plot.entitiesIn(
        { min: point.x - halfStepWidth, max: point.x + halfStepWidth },
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
          [{ x: [], y: [] }],
        )
        .map(({ x, y }) => ({
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

  plot.onDetach(plot => {
    interaction.detachFrom(plot);
    tip.dispose();
  });
};

export const createScatterClickTipper = (container, tooltips, idIndicator, listeners) => {
  const { enable = true, titleIndicator } = tooltips;

  const selected = {};

  if (!enable || !titleIndicator || !idIndicator) {
    return {
      init: plot => {},
      update: () => {},
    };
  }

  const template =
    '<div class="tooltip" role="tooltip" style="text-align: left;">' +
    '<div class="tooltip-arrow"></div>' +
    '<div id="tt-title" class="tooltip-inner"></div>' +
    '<div id="tt-body" class="tooltip-body"></div>' +
    '</div>';

  return {
    init: plot => {
      container.style.overflow = 'hidden';

      const interaction = new Plottable.Interactions.Click()
        .onClick(p => {
          const [entity] = plot.entitiesAt(p);

          if (entity) {
            const id = entity.datum[idIndicator];

            if (!selected[id]) {
              const selection = plot.content().select(`path#bubble-${id}`);

              const node = selection.node();

              if (node) {
                const tip = new Tooltip(node, {
                  title: entity.datum[titleIndicator],
                  placement: 'bottom',
                  container,
                  template,
                });

                selected[id] = tip;

                tip.show();

                listeners.forEach(listener => typeof listener === 'function' && listener(id));
              }
            } else if (selected[id]) {
              const tip = selected[id];

              tip.hide();
              tip.dispose();

              selected[id] = null;

              listeners.forEach(listener => typeof listener === 'function' && listener(id));
            }
          }
        })
        .attachTo(plot);

      plot.onDetach(() => interaction.detachFrom(plot));
    },
    update: () => {
      Object.keys(selected)
        .filter(key => selected[key])
        .map(key => {
          const tip = selected[key];
          tip.hide();

          if (tip.reference.id === `bubble-${key}`) {
            tip.show();
          }
        });
    },
  };
};

export const createScatterTipper = (container, tooltips = {}, axes) => {
  const { enable = true, titleIndicator } = tooltips;

  if (!enable || !titleIndicator) {
    return plot => {};
  }

  return function (plot) {
    let currentId = null;

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
                  `<tr><td>${axis.axisLabel || axis.label}</td>` +
                    `<td style="text-align: right">${approximate(entity.datum[axis.indicator], )}</td></tr>`, )
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
