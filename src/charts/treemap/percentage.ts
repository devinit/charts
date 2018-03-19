export default (width, height) => {
  const percentArea = (width * height) / 100;
  return datum =>
    Math.round(((datum.x1 - datum.x0) * (datum.y1 - datum.y0)) / percentArea);
};
