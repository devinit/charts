import 'jest';
import {
  createAxisModifier,
  createNumericAxis,
  createCategoryAxis,
} from '../src/factories/axis';
import {Axes} from 'plottable';
import { createLinearScale, createCategoryScale } from '../lib/factories/scale';


describe('createAxisModifier', () => {
  it('creates a valid modifier', () => {
    const { format, modify } = createAxisModifier({ modifier: 'log', modifierParam: 10 });

    expect(modify(1000)).toBe(3);
    expect(format(3)).toBe(1000);
    expect(format(modify(1000))).toBe(1000);
  });

  it('creates a valid absolute modifier', () => {
    const { format, modify } = createAxisModifier({
      modifier: 'multiply',
      modifierParam: 1,
      absolute: true,
    });

    expect(modify(-1000)).toBe(-1000);
    expect(format(-1000)).toBe(1000);
  });
});

describe('createNumericAxis', () => {
  it('creates a numeric scale', () => {
    const axisScale = createLinearScale({});
    const axis = createNumericAxis({ axisScale });

    expect(axis instanceof Axes.Numeric);
  });
});

describe('createCategoryAxis', () => {
  it('creates a category axis', () => {
    const axisScale = createCategoryScale({});
    const axis = createCategoryAxis({ axisScale });

    expect(axis instanceof Axes.Category);
  });
});
