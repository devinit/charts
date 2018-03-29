import createAnimator from './base';
import { easeCircleInOut } from 'd3';

export default (duration: number, anchor, tooltip) => {
  return position =>
    new Promise(resolve => {
      const initial = anchor.node().getBBox();

      const diff = {
        x: position.x - initial.x,
        y: position.y - initial.y,
      };

      const stepFn = progress => {
        tooltip.hide();
        anchor.attr('cx', initial.x + (diff.x * easeCircleInOut(progress)));
        anchor.attr('cy', initial.y + (diff.y * easeCircleInOut(progress)));
        tooltip.show();
      };

      requestAnimationFrame(timestamp => {
        const animate = createAnimator(stepFn, timestamp, duration, resolve);
        animate(timestamp);
      });
    });
};
