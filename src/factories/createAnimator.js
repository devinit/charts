import {easeCircleInOut as ease} from "d3";

// Eases scales ^_^
// ...
export const createScaleAnimator = (duration) => {

  const frequency = 1000 / 24;
  const frames = duration / frequency;
  let animationFrame, startTime;

  // Animator function:
  // takes an array of scales and a list of transformations for each scale
  return (scales, ...to) => new Promise((resolve) => {

    const initial = scales
      .map(scale => scale.domain());

    const diffs = initial
      .map(([fromMin, fromMax], i) => {
        const [toMin, toMax] = to[i];

        return [
          fromMin - toMin,
          toMax - fromMax
        ]
      });

    const animate = (timestamp) => {
      const runtime = timestamp - startTime;
      const progress = Math.min(runtime / duration, 1);

      const movements = initial
        .map(([fn, fx], index) => {
          const [dn, dx] = diffs[index];

          return [
            fn - dn * ease(progress, 1, 0.2),
            fx + dx * ease(progress, 1, 0.2)
          ]
        });

      focusScales(scales, ...movements);

      if (runtime < duration) {
        requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationFrame);
        resolve()
      }

    };

    requestAnimationFrame(timestamp => {
      startTime = timestamp;
      animate(timestamp)
    })
  });

};

const focusScales = (scales, ...domains) => {
  scales.forEach((scale, index) => {
    const domain = domains[index] || [];

    const [min, max] = domain;

    scale.domainMin(min);
    scale.domainMax(max);
  });
};