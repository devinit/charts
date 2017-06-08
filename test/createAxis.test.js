const expect = require('chai').expect;
const {createNumericAxis, createCategoryAxis} = require('../lib/factories/createAxis');
const {createLinearScale, createCategoryScale} = require('../lib/factories/createScale');
const it = require("mocha").it;
const describe = require("mocha").describe;
const Plottable = require("plottable");

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