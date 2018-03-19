import { easeCircleInOut } from 'd3';
import createAnimator from './base';
import focus from './focus';

export default duration => {
  // Animator function:
  // takes an array of scales and a list of transformations for each scale
  return (scales, ...to) =>
    new Promise(resolve => {
      const initial = scales.map(scale => scale.domain());

      const diffs = initial.map(([fromMin, fromMax], i) => {
        const [toMin, toMax] = to[i];

        return [fromMin - toMin, toMax - fromMax];
      });

      const stepFn = progress => {
        const movements = initial.map(([fn, fx], index) => {
          const [dn, dx] = diffs[index];

          return [
            fn - (dn * easeCircleInOut(progress, 1, 0.2)),
            fx + (dx * easeCircleInOut(progress, 1, 0.2)),
          ];
        });

        focus(scales, ...movements);
      };

      requestAnimationFrame(timestamp => {
        const animate = createAnimator(stepFn, timestamp, duration, resolve);
        animate(timestamp);
      });
    });
};