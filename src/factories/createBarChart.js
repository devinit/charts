import Plottable from "plottable";
import {color} from "d3";
//noinspection JSFileReferences
import Tooltip from "tooltip.js";
import approximate from "./approximate";
import {createLinearChart} from "./createLinearChart";

export default (element, plot, config) => {
  const {
    interactions = { enable: false },
    tooltips = { enable: true },
  } = config;
  const chart = createLinearChart({element, plot, config});

  plot.onAnchor(plot => {
    setTimeout(() => {
      if (interactions.enable) {
        createBarInteraction(config.orientation, config.labeling, config.highlight)(plot)
      }

      if (tooltips.enable) {
        createBarTipper(element, config.labeling, chart.categoryScale, config.orientation)(plot);
      }
    }, 500)
  });

  return chart;
}

export const createBarTipper = (container, labeling = {}, scale, orientation = 'vertical') => (plot) => {

  let currentHash = null;

  const foreignObject = plot.foreground()
    .append('foreignObject')
    .html('<div id="tooltip-container"></div>');

  const tooltipAnchor = plot.foreground()
    .append('circle')
    .attr('r', 3)
    .attr('fill', 'transparent');

  const placement = orientation => {
    return {
      'vertical': 'top',
      'horizontal': 'right',
      'inverted-vertical': 'bottom',
      'inverted-horizontal': 'left',
    }[orientation];
  }

  const tip = new Tooltip(tooltipAnchor.node(), {
    title: 'Tooltip',
    placement: placement(orientation),
    container: container,
    template: `
        <div class="tooltip" role="tooltip">
          <div class="tooltip-arrow"></div>
          <div id="tt-title" class="tooltip-inner"></div>
          <div id="tt-body" class="tooltip-body"></div>
        </div>
    `,
  });

  const template = datum => {
    return `
        <div>
          <span style="background: ${datum.color}; width: 10px; height: 10px; display: inline-block"></span>
          <span>${datum.group ? (datum.group + ':') : ''} ${approximate(datum.value)}</span>
        </div>
      `;
  };

  const getEntities = (point) =>
    plot.entitiesIn(
      orientation === 'vertical' ? { min: point.x - 1, max: point.x + 1 } : {min: 0, max: plot.width()},
      orientation !== 'vertical' ? { min: point.y - 1, max: point.y + 1 } : { min: 0, max: plot.height() }
    );

  const getPosition = entities =>
    entities
      .reduce(([p], e) => ([{
        x: [...p.x, e.position.x],
        y: [...p.y, e.position.y],
      }]), [{x: [], y: []}])
      .map(({x, y}) => ({
        x: orientation === 'vertical' ? x.reduce((sum, k) => sum + k, 0) / x.length : Math.min.apply(null, x),
        y: orientation !== 'vertical' ? y.reduce((sum, k) => sum + k, 0) / y.length : Math.min.apply(null, y),
      }))
      .reduce((_, d) => d);

  const interaction = new Plottable.Interactions.Pointer()
    // .onPointerEnter(() => tip.show())
    .onPointerExit(() => tip.hide())
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
          tip._tooltipNode.querySelector('#tt-body').innerHTML =
            entities.map(e => template(e.datum)).join('');
          currentHash = hash;
        });
      }

    });

  interaction.attachTo(plot);

  plot.onDetach(plot => {
    interaction.detachFrom(plot);
    tip.dispose()
  })
};

const createBarInteraction = (orientation = 'vertical', labeling = {}, highlight = []) => {

  const {
    prefix = '',
    suffix = ''
  } = labeling;

  let currentId = null;

  const reset = plot => {
    plot.entities()
      .forEach(entity => {
        if (!entity.selection.attr('initial-fill')) {
          entity.selection.attr("initial-fill", entity.selection.attr('fill'));
        } else {
          entity.selection.attr("fill", entity.selection.attr('initial-fill'));
        }
      });

    plot.foreground().select('text').remove()
  };

  return plot => {
    // QUICKFIX: Highlight some bars in a bar chart
    if (highlight.length) {
      plot.entities()
        .filter(entity => highlight.indexOf(entity.datum.label) > -1)
        .forEach(entity => {
          const { x, y, width, height } = entity.selection.node().getBBox();

          plot
            .background()
            .append('text')
            .attr('class', 'plot-label hover-label')
            .attr('x', orientation === 'vertical' ? x + ( width / 2 ) : width + x + 5)
            .attr('y', orientation === 'horizontal' ? y + ( height / 2 ) : y - 10)
            .attr('text-anchor', orientation === 'vertical' ? 'middle' : 'start')
            .attr('style', `fill: ${entity.selection.attr("fill")}`)
            .text(`${prefix}${approximate(entity.datum.value)}${suffix}`);
        })
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

          const { x, y, width, height } = entity.selection.node().getBBox();

          plot
            .foreground()
            .append('text')
            .attr('class', 'plot-label hover-label')
            .attr('x', orientation === 'vertical' ? x + ( width / 2 ) : width + x + 5)
            .attr('y', orientation === 'horizontal' ? y + ( height / 2 ) : y - 10)
            .attr('text-anchor', orientation === 'vertical' ? 'middle' : 'start')
            .attr('style', `fill: ${entity.selection.attr("fill")}`)
            .text(`${prefix}${approximate(entity.datum.value)}${suffix}`);

          const fill = color(entity.selection.attr('initial-fill')).darker(0.7);

          entity.selection.attr("fill", fill);

          currentId = id;
        }
      });

    interaction.attachTo(plot);

    plot.onDetach(plot => {
      interaction.detachFrom(plot);
    })
  }
};