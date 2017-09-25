import { color } from 'd3';
import approximate from './approximate';

/**
 * @typedef {Object} Labeling
 * @property {boolean} showLabels=true - Show Labels
 * @property {boolean} showValues=true - Show Values
 * @property {boolean} showPercents=true - Show Percents
 * @property {string} prefix - Prefix
 * @property {string} suffix - Suffix
 *
 */
export const createTreeChartLabeler = (config, percentage = d => 100) => {
  const {
    showLabels = true,
    showValues = true,
    showPercents = true,
    prefix = '',
    suffix = '',
  } = config;

  // eslint-disable-next-line func-names
  return function () {
    const foreground = this.foreground();
    const entities = this.entities();

    // Remove all current labels
    foreground.selectAll('foreignObject').remove();

    entities.forEach(entity => {
      const node = entity.selection.node();
      const {
        width, height, x, y
      } = node.getBBox();

      if (height > 50 && width > 40) {
        const { r, g, b } = color(node.getAttribute('fill')).rgb();
        const brightness = (r + g + b) / (256 * 3);

        const { datum } = entity;
        const value = approximate(datum.value);
        const label = showLabels ? this._label(datum) : '';
        const percent = percentage(datum);

        const percentageLabel = percent === 100 || !showPercents ? '' : `${percent}% | `;
        const valueLabel = showValues
          ? `${prefix ? `${prefix} ` : ''}${value}${suffix ? ` ${suffix}` : ''}`
          : '';

        foreground
          .append('foreignObject')
          .attr('width', width)
          .attr('height', height)
          .attr('x', x)
          .attr('y', y)
          .html(`<div class="${brightness > 0.7 ? 'dark' : 'light'}-label plot-label">
                    <div class="plot-label-header">${label}</div>
                    <div class="plot-label-value">${percentageLabel}${valueLabel} </div>
                 </div>`);
      }
    });
  };
};
