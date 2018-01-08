import approximate from '../approximate/index';

// adding labels
export const drawLabels = (plot) => {
  const foreground = plot.foreground();
  return plot.entities().forEach((entity) => {
    const rect = entity.selection[0][0];
    // console.log('rect', rect.x.baseVal.value, rect.y.baseVal.value);
    const width = rect.width.baseVal.value;
    const height = rect.height.baseVal.value;
    foreground
      .append('foreignObject')
      .attr('width', width)
      .attr('height', height)
      .attr('x', rect.x.baseVal.value)
      .attr('y', rect.y.baseVal.value)
      .append('xhtml:body')
      .html(width > 50 ?
        `<div><p>${approximate(entity.datum.value)}</p></div>`
        : '<p></p>');
  });
};
