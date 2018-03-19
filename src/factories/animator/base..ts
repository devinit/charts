export default (stepFn, startTime, duration, callback) => {
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
  };
};