import Plottable from "plottable";
//noinspection JSFileReferences
import Tooltip from "tooltip.js";
import approximate from "approximate-number";
import {createLinearChart} from "../factories/createLinearChart";
import {createTooltipAnimator} from "../factories/createAnimator";

/**
 * @typedef {LinearCategoryChart} Line
 * @public
 * @property {'line'} type
 *
 */
export default (element, data, config) => {

  const plot = new Plottable.Plots.Line();

  const linearChart = createLineChart(element, plot, config);

  linearChart.addData(data);

  return linearChart
};

export const createLineChart = (element, plot, config) => {

  const {categoryAxis = {}, ...more} = config;

  const chart = createLinearChart({
    element,
    plot,
    config: {
      categoryAxis: {

        // TODO: Fix [https://github.com/palantir/plottable/issues/747](#747)
        // Temporary work around for [https://github.com/palantir/plottable/issues/747](#747)
        // Issue: AreaPlot / LinePlot should default to no padding on xScale
        innerPadding: 999,

        ...categoryAxis
      },

      ...more
    }
  });

  const {linearScale, categoryScale} = chart;

  plot.onAnchor(createLineTipper(element, config.labeling, categoryScale, config.orientation));

  return chart;
};

export const createLineTipper = (container, labeling = {}, scale, orientation = 'vertical') => (plot) => {

  let currentHash = null;

  const foreignObject = plot.foreground()
    .append('foreignObject')
    .html('<div id="tooltip-container"></div>');

  const tooltipAnchor = plot.foreground()
    .append('circle')
    .attr('r', 3)
    .attr('fill', 'transparent');

  const tip = new Tooltip(tooltipAnchor.node(), {
    title: 'Tooltip',
    container: container,
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
        <span>${datum.group ? (datum.group + ':') : ''} ${approximate(datum.value)}</span>
      </div>
    `;

  const interaction = new Plottable.Interactions.Pointer()
    .onPointerEnter(() => tip.show())
    .onPointerExit(() => tip.hide())
    .onPointerMove(point => {
      let halfStepWidth = 0;

      if (scale.stepWidth) {
        halfStepWidth = scale.stepWidth() / 2;
      }

      else if (scale.tickInterval) {
        halfStepWidth = plot.width() / (scale.tickInterval('year').length * 2)
      }

      const entities = plot.entitiesIn({min: point.x - halfStepWidth, max: point.x + halfStepWidth}, {
        min: 0,
        max: plot.height()
      });

      const position = entities
        .reduce(([p], e) => ([{
          x: [...p.x, e.position.x],
          y: [...p.y, e.position.y],
        }]), [{x: [], y: []}])
        .map(({x, y}) => ({
          x: x.reduce((sum, k) => sum + k, 0) / x.length,
          y: Math.min.apply(null, y)
        }))
        .reduce((_, d) => d);

      if (entities.length && currentHash !== position.x.toString() + position.y.toString()) {
        tip.hide();
        tooltipAnchor.attr('cx', position.x);
        tooltipAnchor.attr('cy', position.y);
        tip.show();
          tip._tooltipNode.querySelector('#tt-title').innerText = entities[0].datum.label;
          tip._tooltipNode.querySelector('#tt-body').innerHTML =
            entities.map(e => template(e.datum)).join('');
        currentHash = position.x.toString() + position.y.toString()

      }

    });

  interaction.attachTo(plot);
};
