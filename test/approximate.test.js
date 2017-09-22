const chai = require('chai');
const chaiStats = require('chai-stats');
const mocha = require('mocha');
const approximate = require('../lib/factories/approximate').default;

chai.use(chaiStats);

const expect = chai.expect;
const it = mocha.it;
const describe = mocha.describe;

describe('approximate', () => {
  it('should round off and format values', () => {
    const formatted = approximate(6422108692);
    expect(formatted).to.equal('6.42bn');
  });
  it('should round off to two or less decimal places', () => {
    expect(approximate(6422108692)).to.equal('6.42bn');
    expect(approximate(6400000000)).to.equal('6.4bn');
    expect(approximate(6000000000)).to.equal('6bn');
    expect(approximate(0)).to.equal('0');
  });
});
