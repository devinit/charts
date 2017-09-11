const chai = require('chai');
const Plottable = require("plottable");
const chaiStats = require('chai-stats');
const mocha = require("mocha");
const {
  createAxisModifier,
  createNumericAxis,
  createCategoryAxis
} = require('../lib/factories/createAxis');
const {
  createLinearScale,
  createCategoryScale
} = require('../lib/factories/createScale');

chai.use(chaiStats);

const expect = chai.expect;
const it = mocha.it;
const describe = mocha.describe;

describe('createAxisModifier', function () {

  it('creates a valid modifier', function () {
    const {format, modify} = createAxisModifier({modifier: 'log', modifierParam: 10});

    expect(modify(1000)).to.almost.equal(3);
    expect(format(3)).to.almost.equal(1000);
    expect(format(modify(1000))).to.almost.equal(1000);
  });

  it('creates a valid absolute modifier', function () {
    const {format, modify} = createAxisModifier({modifier: 'multiply', modifierParam: 1, absolute: true});

    expect(modify(-1000)).to.equal(-1000);
    expect(format(-1000)).to.equal(1000);
  });

});

describe('createNumericAxis', function() {

  it('creates a numeric scale', function () {
    const axisScale = createLinearScale({});
    const axis = createNumericAxis({axisScale});

    expect(axis instanceof Plottable.Axes.Numeric);
  });

});

describe('createCategoryAxis', function() {

  it('creates a category axis', function () {
    const axisScale = createCategoryScale({});
    const axis = createCategoryAxis({axisScale});

    expect(axis instanceof Plottable.Axes.Category);
  });

});