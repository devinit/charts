import {Datum} from '../types';

export type Percentage =
  (width: number, height: number, orientation: string) => (datum: Datum) => number;

const percentageCalculator: Percentage = (width, height, orientation) => {
  return datum => {
    return Math.round(orientation === 'horizontal' ?
      (datum.x1 - datum.x0) * (100 / height) :
      (datum.y1 - datum.y0) * (100 / width));
  };
};
export default percentageCalculator;
