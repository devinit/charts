import 'jest';
import { createLinearScale, createCategoryScale } from '../src/factories/scale';
import {Scales} from 'plottable';

describe('createLinearScale', () => {
  it('creates a linear scale', () => {
    const scale = createLinearScale({});

    expect(scale instanceof Scales.Linear);
  });

  it('creates a linear scale with minimum and maximum', () => {
    const axisMinimum = 0;
    const axisMaximum = 100;
    const scale = createLinearScale({ axisMinimum, axisMaximum });

    expect(scale.domainMin()).toBe(axisMinimum);
    expect(scale.domainMax()).toBe(axisMaximum);
  });
});

describe('createCategoryScale', () => {
  it('creates a category scale', () => {
    const scale = createCategoryScale({});

    expect(scale instanceof Scales.Category);
  });

  it('creates a category scale with inner and outer padding', () => {
    const innerPadding = 0;
    const outerPadding = 100;
    const scale = createCategoryScale({ innerPadding, outerPadding });

    expect(scale.innerPadding()).toBe(innerPadding);
    expect(scale.outerPadding()).toBe(outerPadding);
  });
});
