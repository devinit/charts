
import { color } from 'd3';

/**
 * @typedef {Object} AnnotationBound
 * @property {nuumber} maximum - Maximim
 * @property {number} minimum - Minimum
 */

/**
 * @typedef {Object} Annotation
 * @property {string} title
 * @property {string} body
 * @property {string} fill
 * @property {AnnotationBound} horizontalAxis
 * @property {AnnotationBound} verticalAxis
 */


export default (config) => {
  const {
    annotations,
    verticalScale,
    horizontalScale,
    plot
  } = config;

  plot
    .background()
    .selectAll('.annotation-background')
    .remove();

  plot
    .foreground()
    .selectAll('.annotation-text')
    .remove();

  annotations.forEach(({
    title, body, fill, horizontalAxis = {}, verticalAxis = {}
  }) => {
    const x0 = horizontalScale.scale(
      typeof horizontalAxis.minimum !== 'number' ||
      horizontalAxis.minimum < horizontalScale.domainMin()
        ? horizontalScale.domainMin()
        : horizontalAxis.minimum);

    const x1 = horizontalScale.scale(
      !horizontalAxis.maximum || (horizontalAxis.maximum > horizontalScale.domainMax())
        ? horizontalScale.domainMax()
        : horizontalAxis.maximum);

    const y0 = verticalScale.scale(
      !verticalAxis.maximum || (verticalAxis.maximum > verticalScale.domainMax())
        ? verticalScale.domainMax()
        : verticalAxis.maximum);

    const y1 = verticalScale.scale(
      !verticalAxis.minimum || (verticalAxis.minimum < verticalScale.domainMin())
        ? verticalScale.domainMin()
        : verticalAxis.minimum);

    const colorFill = fill || '#ccc';
    const { r, g, b } = color(colorFill).rgb();
    const brightness = (r + g + b) / (256 * 3);

    plot
      .background()
      .append('rect')
      .attr('class', 'annotation-background')
      .attr('x', x0)
      .attr('y', y0)
      .attr('width', x1 - x0)
      .attr('height', y1 - y0)
      .attr('fill', fill || '#ccc')
      .attr('opacity', '0.5');

    plot
      .foreground()
      .append('foreignObject')
      .attr('class', 'annotation-text')
      .attr('width', x1 - x0)
      .attr('height', y1 - y0)
      .attr('x', x0)
      .attr('y', y0)
      .html(`
            <div class="${brightness > 0.5
    ? 'dark'
    : 'light'}-label plot-label" style="text-align: left">
              <div class="plot-label-header">${title}</div>
              <div class="plot-label-value">${body || ''}</div>
            </div>
          `);
  });
};
