import Plottable from "plottable";
import createPlottableChart from './createPlottableChart';

export default ({element,
  plot,
  config: {
    title = null,

    titleAlignment = 'left',

    circular: {
      innerRadius = 0,
      strokeWidth = 0,
      strokeColor = '#fff'
    } = {},

    legend: {
      showLegend = false,
      legendPosition =  'center'
    } = {},


    // ...
  }}) => {

  plot
    .attr('stroke', strokeColor)
    .attr('stroke-width', strokeWidth)
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .sectorValue(d => d.value)
    .innerRadius(innerRadius);

  const titleLabel = new Plottable.Components.TitleLabel(title, 0)
    .xAlignment(titleAlignment)
    .yAlignment('top');

  const colorScale = new Plottable.Scales.Color();

  const legend = (showLegend || null) && new Plottable.Components.Legend(colorScale)
    .xAlignment(legendPosition)
    .symbol(d => size => Plottable.SymbolFactories.square()(size))
    .maxEntriesPerRow(Infinity);

  const plotWithLegend = new Plottable.Components.Table([[plot], [legend]]);

  const table = new Plottable.Components.Table([
    [titleLabel],
    [plotWithLegend],
  ]);


  table.rowPadding(10);

  table.renderTo(element);

  const transform = (series) => [new Plottable.Dataset(series.map(({color, label, value}) => ({label, color, value})))];



  const addData = (series = []) => {

    // TODO: Efficiently update legend
    if (showLegend) {

      const domain = series.map(d => d.label);
      const range = series.map(d => d.color);
      colorScale.domain(domain).range(range);
    }

    plot.datasets(transform(series));
  };

  return {

    table,

    addData
  };

};