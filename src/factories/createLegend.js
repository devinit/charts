import Plottable from 'plottable';


/**
 *
 * @typedef {Object} ColorLegend
 * @private
 * @property {boolean} showLegend - Show Legend
 * @property {('circle'|'square'|'cross'|'diamond'|'triangle'|'star'|'wye')} symbol=square - Legend symbol
 * @property {('bottom'|'right')} alignment=bottom - Legend alignment
 * @property {number} rowSpan - Maximum entries per row
 */

export const createColorLegend = (colorScale, config = {}) => {

  const {
    showLegend = false,
    symbol = 'square',
    alignment = 'bottom',
    rowSpan = Infinity
  } = config;

  if (!showLegend || !colorScale) return null;

  return new Plottable.Components.Legend(colorScale)
    .symbol(d => size => Plottable.SymbolFactories[symbol]()(size))
    .xAlignment(alignment)
    .maxEntriesPerRow(rowSpan);

};

export const createBubbleLegend = (colorScale, config) => {

  const {showLegend = false, symbol = 'circle', alignment = 'left', rowSpan = Infinity} = config;
  if (!showLegend || !colorScale) return null;

  return new Plottable.Components.Legend(colorScale)
    .symbol(d => size => Plottable.SymbolFactories[symbol]()(size))
    .xAlignment(alignment)
    .maxEntriesPerRow(rowSpan);

};