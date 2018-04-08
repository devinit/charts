import createScaleAnimator from '@devinit-charts/core/lib/animator/scale';

export interface Config {
  width: number;
  height: number;
  listeners: any;
  orientation: string;
}

export default (config: Config) => {
  const animate = createScaleAnimator(500);
  const onAnimated = datum => config.listeners.forEach(callback => callback(datum.data));
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
      animate([xScale, yScale], [0, config.width], [0, config.height])
        .then(() => onAnimated(datum));
    } else {
      animate([xScale, yScale], ...nextDomain)
        .then(() => onAnimated(datum));
    }
  };
};
