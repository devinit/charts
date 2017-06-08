import Plottable from "plottable";
import {createTitle} from './createTitle';
import {createColorLegend} from './createLegend';
import {createChartTable} from './createTable';

export default ({element,
  plot,
  config: {
    title = null,

    titleAlignment = 'left',

    colors = [],

    circular = {
      label: 'label',
      value: 'value',
      innerRadius: 0,
      strokeWidth: 0,
      strokeColor: '#fff'
    },

    legend = {
      showLegend: false,
      position: 'bottom',
      alignment: 'center',
    },


    // ...
  }}) => {

  const colorScale = new Plottable.Scales.Color();

  const table = createChartTable({
    title: createTitle({title, titleAlignment}),
    chart: createCircularPlot({plot, ...circular}),
    legend: createColorLegend({colorScale, ...legend}),
    legendPosition: legend.position
  });

  table.renderTo(element);

  const addData = (data = []) => {

    const series = data.map((d, i) => ({
      label: d[circular.label],
      value: d[circular.value],
      color: colors[i] || '#abc',
    }));

    // TODO: Efficiently update legend
    if (legend.showLegend) {

      const domain = series.map(d => d.label);
      const range = series.map(d => d.color);
      colorScale.domain(domain).range(range);
    }

    plot.datasets([new Plottable.Dataset(series)]);
  };

  return {

    table,

    addData
  };

};

export const createCircularPlot = ({plot, innerRadius = 0, strokeColor = '#fff', strokeWidth = 0}) => {
  return plot
    .attr('fill', d => d.color)
    .attr('fill-opacity', d => d.opacity)
    .attr('style', `stroke: ${strokeColor}; stroke-width: ${strokeWidth}`)
    .sectorValue(d => d.value)
    .innerRadius(innerRadius);
};