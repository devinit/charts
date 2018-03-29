import * as Plottable from 'plottable';

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
export interface Config {
  showLegend: boolean;
  symbol?: string;
  alignment?: Plottable.XAlignment;
  rowSpan?: any;
}
export const createColorLegend = (colorScale, config: Config) => {
  const {
    showLegend = false, symbol = 'square', alignment = 'left', rowSpan = Infinity
  } = config;

  if (!showLegend || !colorScale) return null;

  return new Plottable.Components.Legend(colorScale)
    .symbol(() => size => Plottable.SymbolFactories[symbol]()(size))
    .xAlignment(alignment)
    .maxEntriesPerRow(rowSpan);
};
