import Plottable from "plottable";
import {color} from "d3";
import approximate from "approximate-number";
import {createLinearChart} from "./createLinearChart";

export default (element, plot, config) => {
  const { interactions = { enable: false } } = config;
  const chart = createLinearChart({element, plot, config});

  if (interactions.enable) {
    plot.onAnchor(createBarInteraction(config.orientation, config.labeling));
  }

  return chart;
}

const createBarInteraction = (orientation = 'vertical', labeling = {}) => {

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