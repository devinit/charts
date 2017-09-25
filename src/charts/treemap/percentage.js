export default datum => {
  return Math.round((datum.x1 - datum.x0) * (datum.y1 - datum.y0) * 100);
};
