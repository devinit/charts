import Plottable from 'plottable';

export const createColorLegend = ({colorScale, showLegend = false, symbol = 'square', alignment = 'left', rowSpan = Infinity}) => {

  if (!showLegend || !colorScale) return null;

  return new Plottable.Components.Legend(colorScale)
    .symbol(d => size => Plottable.SymbolFactories[symbol]()(size))
    .xAlignment(alignment)
    .maxEntriesPerRow(rowSpan);

};