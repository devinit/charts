const chai = require('chai');
const Plottable = require('plottable');
const chaiStats = require('chai-stats');
const mocha = require('mocha');
const {
  createAxisModifier,
  createNumericAxis,
  createCategoryAxis,
} = require('../lib/factories/axis');
const { createLinearScale, createCategoryScale } = require('../lib/factories/scale');

chai.use(chaiStats);

const expect = chai.expect;
const it = mocha.it;
const describe = mocha.describe;

describe('createAxisModifier', () => {
  it('creates a valid modifier', () => {
    const { format, modify } = createAxisModifier({ modifier: 'log', modifierParam: 10 });

    expect(modify(1000)).to.almost.equal(3);
    expect(format(3)).to.almost.equal(1000);
    expect(format(modify(1000))).to.almost.equal(1000);
  });

  it('creates a valid absolute modifier', () => {
    const { format, modify } = createAxisModifier({
      modifier: 'multiply',
      modifierParam: 1,
      absolute: true,
    });

    expect(modify(-1000)).to.equal(-1000);
    expect(format(-1000)).to.equal(1000);
  });
});

describe('createNumericAxis', () => {
  it('creates a numeric scale', () => {
    const axisScale = createLinearScale({});
    const axis = createNumericAxis({ axisScale });

    expect(axis instanceof Plottable.Axes.Numeric);
  });
});

describe('createCategoryAxis', () => {
  it('creates a category axis', () => {
    const axisScale = createCategoryScale({});
    const axis = createCategoryAxis({ axisScale });

    expect(axis instanceof Plottable.Axes.Category);
  });
});
