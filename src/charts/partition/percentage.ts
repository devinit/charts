export default (width, height, orientation) => {
  return datum => {
    return Math.round(orientation === 'horizontal' ?
      (datum.x1 - datum.x0) * (100 / height) :
      (datum.y1 - datum.y0) * (100 / width));
  };
};
