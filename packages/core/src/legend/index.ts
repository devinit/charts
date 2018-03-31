import {Components, Scales, XAlignment, SymbolFactories} from 'plottable';

/**
 *
 * @typedef {Object} ColorLegend
 * @private
 * @property {boolean} showLegend - Show Legend
 * @property {('circle'|'square'|'cross'|'diamond'|'triangle'|'star'|'wye')} symbol=square - Legend symbol
 * @property {('left'|'center'|'right')} alignment=left - Legend Alignment
 * @property {('bottom'|'right')} position=bottom - Legend Position
 * @property {number} rowSpan - Maximum entries per row
 */

/**
 * @typedef {ColorLegend} TreeLegend
 * @private
 * @property {number} depth - Depth of Legend
 */

/**
 *
 * @param {Color} colorScale
 * @param {ColorLegend} config
 * @returns {*}
 */
export interface LegendConfig {
  showLegend?: boolean;
  symbol?: string;
  alignment?: XAlignment;
  rowSpan?: any;
}
export const createColorLegend = (colorScale: Scales.Color, config: LegendConfig) => {
  const {
    showLegend = false, symbol = 'square', alignment = 'left', rowSpan = Infinity
  } = config;

  if (!showLegend || !colorScale) return undefined;

  return new Components.Legend(colorScale)
    .symbol(() => size => SymbolFactories[symbol]()(size))
    .xAlignment(alignment)
    .maxEntriesPerRow(rowSpan);
};
