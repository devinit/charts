import approximate from "approximate-number";
import {color} from "d3"

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

    if (height > 50 && width > 40) {
      foreground
        .append('foreignObject')
        .attr('width', width)
        .attr('height', height)
        .attr('x', x)
        .attr('y', y)
        .html(`<div class="${brightness > 0.5 ? 'dark' : 'light'}-label plot-label"><div class="plot-label-header">${label}</div><div class="plot-label-value">${value}</div></div>`);
    }
  })
};