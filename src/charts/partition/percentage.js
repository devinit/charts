export default orientation => datum => {
  return Math.round(orientation === 'horizontal' ? (datum.x1 - datum.x0) * 100 : (datum.y1 - datum.y0) * 100, );
};
