export default (stepFn: (number: number) => any, startTime: number, duration: number, callback: () => void) => {
  let animationFrame: number | null = null;

  return function animate(timestamp) {
    const runtime = timestamp - startTime;
    const progress = Math.min(runtime / duration, 1);

    stepFn(progress);

    if (runtime < duration) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrame as number);
      callback();
    }
  };
};
