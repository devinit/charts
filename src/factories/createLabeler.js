import approximate from "approximate-number";
import {color} from "d3"

/**
 * @typedef {Object} Labeling
 * @property {boolean} showLabels=true - Show Labels
 * @property {string} prefix - Prefix
 * @property {string} suffix - Suffix
 *
 */
export const createTreeChartLabeler =  (config, percentage = d => 100) => {
  const {
    showLabels = true, prefix = '', suffix = ''
  } = config;

  return function () {
    const foreground = this.foreground();
    const entities = this.entities();

    // Remove all current labels
    foreground.selectAll("foreignObject").remove();

    entities.forEach(entity => {

      const node = entity.selection.node();
      const { width, height, x, y} = node.getBBox();

      if (height > 50 && width > 40) {
        const {r, g, b} = color(node.getAttribute('fill')).rgb();
        const brightness = (r + g + b) / (256 * 3);

        const datum = entity.datum;
        const value = approximate(datum.value);
        const label = this._label(datum);
        const percent = percentage(datum);

        const percentageLabel = percent === 100 ? '' : `${percent}% | `;
        const valueLabel = `${prefix ? prefix + ' ' : ''}${value}${suffix ?  ' ' + suffix : ''}`;

        foreground
          .append('foreignObject')
          .attr('width', width)
          .attr('height', height)
          .attr('x', x)
          .attr('y', y)
          .html(`<div class="${brightness > 0.5 ? 'dark' : 'light'}-label plot-label">
                    <div class="plot-label-header">${label}</div>
                    <div class="plot-label-value">${percentageLabel}${valueLabel} </div>
                 </div>`);
      }
    })
  }
};