import Plottable from 'plottable';
import Tooltip from 'tooltip.js';
import approximate from '../approximate/index';

export default (container, labeling = {}, scale, orientation = 'vertical') => {
  let currentHash = null;
  const {
    prefix = '',
    suffix = ''
  } = labeling;
  return plot => {
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
            <span>${datum.group ? `${datum.group}:` : ''} ${prefix}${approximate(value)}${suffix}</span>
          </div>
        `;
    };

    const getEntities = point =>
      plot.entitiesIn(
        orientation === 'vertical'
          ? {min: point.x - 1, max: point.x + 1}
          : {min: 0, max: plot.width()},
        orientation !== 'vertical'
          ? {min: point.y - 1, max: point.y + 1}
          : {min: 0, max: plot.height()},
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
          [{x: [], y: []}],
        )
        .map(({x, y}) => ({
          x: orientation === 'vertical' ? x.reduce((sum, k) => sum + k, 0) / x.length : Math.min.apply(null, x),
          y: orientation !== 'vertical' ? y.reduce((sum, k) => sum + k, 0) / y.length : Math.min.apply(null, y),
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
};
