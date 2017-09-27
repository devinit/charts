
import { drag, event } from 'd3';

export default (table, timeScale, anchor = { start: 0 }, legend = {}, listeners) => {
  const originDate = new Date(timeScale.domainMin());
  const startDate = anchor.start ? new Date(anchor.start.toString()) : originDate;
  let currentYear = startDate.getFullYear().toString();

  const minYear = new Date(timeScale.domainMin()).getFullYear();
  const maxYear = new Date(timeScale.domainMax()).getFullYear();

  const origin = timeScale.scaleTransformation(originDate);
  const start = timeScale.scaleTransformation(startDate);

  const chartArea = table.componentAt(1, 0);

  const plotArea = legend.showLegend ? chartArea.componentAt(0, 0) : chartArea;

  const timeAxis = plotArea.componentAt(2, 1);

  const foreground = plotArea.foreground();

  foreground.attr('style', 'z-index: 1');

  const foregroundBounds = foreground.node().getBoundingClientRect();
  const timeAxisBounds = timeAxis
    .content()
    .node()
    .getBoundingClientRect();

  const leftOffset = timeAxisBounds.left - foregroundBounds.left;

  const xPosition = leftOffset + start;

  // Circle radius
  const topPosition = 20;

  const circle = foreground
    .append('circle')
    .attr('class', 'symbol')
    .attr('cx', xPosition)
    .attr('cy', topPosition)
    .attr('fill', 'rgb(232, 68, 58)')
    // .attr('stroke', '#444')
    .attr('r', topPosition);

  const text = foreground
    .append('text')
    .text(startDate.getFullYear().toString())
    .attr('class', 'symbol-label')
    .attr('x', xPosition)
    .attr('y', topPosition + 5)
    .attr('fill', '#fff')
    .attr('font-size', 13)
    .attr('text-anchor', 'middle');

  const line = foreground
    .append('line')
    .attr('class', 'symbol-line')
    .attr('x1', xPosition)
    .attr('x2', xPosition + 1)
    .attr('y1', topPosition + 22)
    .attr('y2', timeAxisBounds.top - foregroundBounds.top)
    .attr('stroke', '#444')
    .attr('stroke-width', 2);

  const changeAnchorPosition = year => {
    // Prevent duplicate movements,
    // oh and they'll be duplicate movements
    // -- remove this condition at your own risk.
    // just kidding, i think
    if (year !== currentYear && year >= minYear && year <= maxYear) {
      const foregroundBounds = foreground.node().getBoundingClientRect();
      const timeAxisBounds = timeAxis
        .content()
        .node()
        .getBoundingClientRect();

      const leftOffset = timeAxisBounds.left - foregroundBounds.left;

      const xPosition = timeScale.scaleTransformation(year);

      circle.attr('cx', leftOffset + xPosition);

      text.attr('x', leftOffset + xPosition).text(year);

      line.attr('x1', leftOffset + xPosition).attr('x2', leftOffset + xPosition);

      // ... notify movement listeners
      listeners.forEach(callback => {
        if (callback && callback.call) {
          callback(year);
        }
      });

      // ... update global current year
      currentYear = year;
    }
  };

  function started() {
    // Change cursor style
    document.body.style.cursor = 'ew-resize';

    function dragged() {
      const { x } = event;

      const xDate = timeScale.invertedTransformation((origin + x) - leftOffset);

      const draggedYear = new Date(xDate).getFullYear().toString();

      changeAnchorPosition(draggedYear);
    }

    function ended() {
      // revert cursor style
      document.body.style = {};
    }

    event.on('drag', dragged).on('end', ended);
  }

  circle.call(drag().on('start', started));
  text.call(drag().on('start', started));
  line.call(drag().on('start', started));

  return changeAnchorPosition;
};
