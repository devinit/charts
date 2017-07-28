import {easeCircleInOut as ease} from "d3";

// Eases scales ^_^
// ...
export const createScaleAnimator = (duration) => {
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

    const stepFn = progress => {

      const movements = initial
        .map(([fn, fx], index) => {
          const [dn, dx] = diffs[index];

          return [
            fn - dn * ease(progress, 1, 0.2),
            fx + dx * ease(progress, 1, 0.2)
          ]
        });

      focusScales(scales, ...movements);
    };

    requestAnimationFrame(timestamp => {
      const animate = createAnimator(stepFn, timestamp, duration, resolve);
      animate(timestamp)
    })
  });

};

export const createTooltipAnimator = (duration, anchor, tooltip) => {

  return (position) => new Promise((resolve, reject) => {

    const initial = anchor.node().getBBox();

    const diff = {
      x: position.x - initial.x,
      y: position.y - initial.y,
    };

    const stepFn = progress => {
      tooltip.hide();
      anchor.attr('cx', initial.x + diff.x * ease(progress, 1, 0.2));
      anchor.attr('cy', initial.y + diff.y * ease(progress, 1, 0.2));
      tooltip.show();
    };

    requestAnimationFrame(timestamp => {
      const animate = createAnimator(stepFn, timestamp, duration, resolve);
      animate(timestamp)
    });
  })
};

const createAnimator = (stepFn, startTime, duration, callback) => {

  let animationFrame = null;

  return function animate(timestamp) {
    const runtime = timestamp - startTime;
    const progress = Math.min(runtime / duration, 1);

    stepFn(progress);

    if (runtime < duration) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrame);
      callback();
    }

  }
};

const focusScales = (scales, ...domains) => {
  scales.forEach((scale, index) => {
    const domain = domains[index] || [];

    const [min, max] = domain;

    scale.domainMin(min);
    scale.domainMax(max);
  });
};