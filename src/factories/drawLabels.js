import approximate from "approximate-number";
import color from "d3-color/src/color"

export default function () {
  const foreground = this.foreground();
  const entities = this.entities();

  // Remove all current labels
  foreground.selectAll("foreignObject").remove();

  entities.forEach(entity => {
    const value = approximate(entity.datum.value);
    const label = this._label(entity.datum);

    const node = entity.selection.node();
    const {r, g, b} = color(node.getAttribute('fill')).rgb();
    const brightness = (r + g + b) / (256 * 3);
    const { width, height, x, y} = node.getBBox();

    if (height > 20 && width > 40) {
      foreground
        .append('foreignObject')
        .attr('width', width)
        .attr('height', height)
        .attr('x', x)
        .attr('y', y)
        .html(`<div class="plottable ${brightness > 0.5 ? 'dark' : 'light'}-label plot-label"><div class="plot-label-header">${label}</div><div class="plot-label-value">${value}</div></div>`);
    }

    /*const rect = entity.selection[0][0];
    const baseline = rect.parentNode.parentNode.lastChild;
    const width = baseline.x2.baseVal.value;
    const height = rect.height.baseVal.value;

    if (height > 20 && width > 40) {
      foreground
        .append('foreignObject')
        .attr('width', width)
        .attr('height', height)
        .attr('x', rect.x.baseVal.value)
        .attr('y', rect.y.baseVal.value)
        .append('xhtml:body')
        .html(`<div class="plottable html-label"><div class="html-label-header">${text}</div><div class="html-label-value">${text}</div></div>`);

    }*/
  })
};