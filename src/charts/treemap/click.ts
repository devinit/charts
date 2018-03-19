import createScaleAnimator from '../../factories/animator/scale';

export default (config = {}) => {
  const {
    width,
    height,
    listeners = [],
  } = config;

  const animate = createScaleAnimator(500);
  const onAnimated = datum => listeners.forEach(callback => callback(datum.data));

  return (entities, xScale, yScale) => {
    const entity = entities.pop();

    const { datum } = entity;

    const nextDomain = [['x0', 'x1'], ['y0', 'y1']]
      .map(([min, max]) => [datum[min], datum[max]]);

    const previousDomain = [
      xScale.domain(),
      yScale.domain(),
    ];

    const shouldReset = [[nextDomain, previousDomain]]
      .every(([[[a, b], [c, d]], [[w, x], [y, z]]]) => {
        const diff = (a + b + c + d) - (w + x + y + z);

        return +diff.toFixed(2) === 0;
      });

    if (shouldReset) {
      animate([xScale, yScale], [0, width], [0, height])
        .then(() => onAnimated(datum));
    } else {
      animate([xScale, yScale], ...nextDomain)
        .then(() => onAnimated(datum));
    }
  };
};
