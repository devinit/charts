const chai = require('chai');
const chaiStats = require('chai-stats');
const mocha = require('mocha');
const approximate = require('../lib/factories/approximate').default;

chai.use(chaiStats);

const { expect } = chai;
const { it } = mocha;
const { describe } = mocha;

describe('approximate', () => {
  it('should round off to one or less decimal places', () => {
    expect(approximate(6472108692)).to.equal('6.5bn');
    expect(approximate(6400000000)).to.equal('6.4bn');
    expect(approximate(6000000000)).to.equal('6bn');
    expect(approximate(0)).to.equal('0');
  });
});
