import Plottable from 'plottable';


/**
 *
 * @typedef {Object} ColorLegend
 * @private
 * @property {boolean} showLegend - Show Legend
 * @property {('circle'|'square'|'cross'|'diamond'|'triangle'|'star'|'wye')} symbol - Legend symbol
 * @property {('bottom'|'right')} alignment - Legend alignment
 * @property {number} rowSpan - Maximum entries per row
 */

export const createColorLegend = (colorScale, config) => {

  const {
    showLegend = false,
    symbol = 'square',
    alignment = 'left',
    rowSpan = Infinity
  } = config;

  if (!showLegend || !colorScale) return null;

  return new Plottable.Components.Legend(colorScale)
    .symbol(d => size => Plottable.SymbolFactories[symbol]()(size))
    .xAlignment(alignment)
    .maxEntriesPerRow(rowSpan);

};

export const createBubbleLegend = (colorScale, {showLegend = false, symbol = 'circle', alignment = 'left', rowSpan = Infinity}) => {

  if (!showLegend || !colorScale) return null;

  return new Plottable.Components.Legend(colorScale)
    .symbol(d => size => Plottable.SymbolFactories[symbol]()(size))
    .xAlignment(alignment)
    .maxEntriesPerRow(rowSpan);

};