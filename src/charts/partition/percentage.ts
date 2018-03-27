export type Percentage = (width: number, height: number, orientation: string)
  => (datum: {x1: number, x0: number; y0: number, y1: number}) => number;

const percentageCalculator: Percentage = (width: number, height: number, orientation: string) => {
  return datum => {
    return Math.round(orientation === 'horizontal' ?
      (datum.x1 - datum.x0) * (100 / height) :
      (datum.y1 - datum.y0) * (100 / width));
  };
};
export default percentageCalculator;
