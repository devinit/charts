import Plottable from 'plottable';
import Tooltip from 'tooltip.js';

const template =
    '<div class="tooltip" role="tooltip" style="text-align: left;">' +
    '<div class="tooltip-arrow"></div>' +
    '<div id="tt-title" class="tooltip-inner"></div>' +
    '<div id="tt-body" class="tooltip-body"></div>' +
    '</div>';

export default (container, tooltips, idIndicator, listeners) => {
  const { enable = true, titleIndicator } = tooltips;

  const selected = {};

  if (!enable || !titleIndicator || !idIndicator) {
    return {
      init: () => {},
      update: () => {},
    };
  }

  return {
    init: plot => {
      // eslint-disable-next-line
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
        .forEach(key => {
          const tip = selected[key];
          tip.hide();

          if (tip.reference.id === `bubble-${key}`) {
            tip.show();
          }
        });
    },
  };
};