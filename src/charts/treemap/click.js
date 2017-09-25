import { createScaleAnimator } from '../../factories/createAnimator';

export default (orientation, callbacks) => {
  const animate = createScaleAnimator(500);

  return (entities, xScale, yScale) => {
    const entity = entities.pop();

    const { datum } = entity;

    const orientationAwareness = [
      orientation === 'vertical' ? ['x0', 'x1'] : ['y0', 'y1'],
      orientation === 'horizontal' ? ['x0', 'x1'] : ['y0', 'y1'],
    ];

    const nextDomain = orientationAwareness.map(([min, max]) => [datum[min], datum[max]]);

    const previousDomain = [xScale.domain(), yScale.domain()];

    const shouldReset = [
      [nextDomain, previousDomain],
    ].every(([[[a, b], [c, d]], [[w, x], [y, z]]]) => {
      const diff = (a + b + c + d) - (w + x + y + z);

      return +diff.toFixed(2) === 0;
    });

    const onAnimated = () => callbacks.forEach(callback => callback(datum.data));

    if (shouldReset) animate([xScale, yScale], [0, 1], [0, 1]).then(onAnimated);
    else animate([xScale, yScale], ...nextDomain).then(onAnimated);
  };
};
