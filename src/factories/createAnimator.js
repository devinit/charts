
// Eases scales in a linear fashion ^_^
// ...
export const createScaleAnimator = (duration) => {

  const frequency = 1000 / 24;
  const frames = duration / frequency;
  const intervals = [];

  // Animator function:
  // takes an array of scales and a list of transformations for each scale
  return (scales, ...to) => new Promise((resolve) => {

    // Stop all intervals
    while (intervals.length) clearInterval(intervals.pop());

    const steps = scales
      .map(scale => scale.domain())
      .map(([fromMin, fromMax], i) => {
        const [toMin, toMax] = to[i];

        return [
          (fromMin - toMin) / frames,
          (toMax - fromMax) / frames
        ]
      });


    // TODO: Use animation frame
    const interval = setInterval(() => {
      const movements = scales
        .map((scale, index) => {

          const [fn, fx] = scale.domain();
          const [toMin, toMax] = to[index];
          const [dn, dx] = steps[index];

          if (!(fn === toMin && fx === toMax)) {
            return [
              Math.abs(fn - toMin) < Math.abs(dn) ? toMin : fn - dn,
              Math.abs(toMax - fx) < Math.abs(dx) ? toMax : fx + dx
            ]
          }
        });

      if (movements.some(f => f)) {
        focusScales(scales, ...movements)
      } else {
        clearInterval(interval);
        resolve()
      }

    }, frequency);

    intervals.push(interval);
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