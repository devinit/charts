import { color } from 'd3';
import { autofitStyles } from '../autofit/text';
import {approximate} from '@devinit/prelude/lib/numbers';

/**
 * @typedef {Object} Labeling
 * @property {boolean} showLabels=true - Show Labels
 * @property {boolean} showValues=true - Show Values
 * @property {boolean} showPercents=true - Show Percents
 * @property {boolean} autofit=false - Autofit Text
 * @property {string} prefix - Prefix
 * @property {string} suffix - Suffix
 *
 */
export interface Config {
  showLabels: boolean;
  showValues: boolean;
  showPercents: boolean;
  autofit: boolean;
  prefix: string;
  suffix: string;
}
export const createTreeChartLabeler = (config: Config, percentage: (number) => number = () => 100) => {
  const {
    showLabels = true,
    showValues = true,
    showPercents = true,
    prefix = '',
    suffix = '',
    autofit = false,
  } = config;
  return function(this: any) {
    const foreground = this.foreground();
    const entities = this.entities();
    // Remove all current labels
    foreground.selectAll('foreignObject').remove();

    entities.forEach(entity => {
      const node = entity.selection.node();
      const {
        width, height, x, y
      } = node.getBBox();

      if (height > 35 && width > 30) {
        const { r, g, b } = color(node.getAttribute('fill')).rgb();
        const brightness = (r + g + b) / (256 * 3);

        const { datum } = entity;
        const value = approximate(datum.value);
        const label = showLabels ? this._label(datum) : '';
        const percent = percentage(datum);

        const percentageLabel = percent === 100 || percent < 1 || !showPercents ? '' : `${percent}%`;
        const valueLabel = showValues
          ? `${prefix ? `${prefix} ` : ''}${value}${suffix ? ` ${suffix}` : ''}`
          : '';
        const separator = showValues && showPercents ? ' | ' : '';
        const autofitFontStyle: any = autofit ?
          autofitStyles(width, height, `${label} ${percentageLabel}${valueLabel}`) :
          '';
        foreground
          .append('foreignObject')
          .attr('width', width)
          .attr('height', height)
          .attr('x', x)
          .attr('y', y)
          .html(`<div class="${brightness > 0.8 ? 'dark' : 'light'}-label plot-label" ${autofitFontStyle.font}>
                    <div class="plot-label-header">${label}</div>
                    <div class="plot-label-value" ${autofitFontStyle.label}>
                      ${percentageLabel}${percentageLabel && separator}${valueLabel}
                    </div>
                 </div>`);
      }
    });
  };
};
