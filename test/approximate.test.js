const chai = require('chai');
const chaiStats = require('chai-stats');
const mocha = require('mocha');
const approximate = require('../lib/factories/approximate').default;


chai.use(chaiStats);

const expect = chai.expect;
const it = mocha.it;
const describe = mocha.describe;

describe('approximate', function () {

  it('should round off and format values', function () {
    const formatted = approximate(6422108692);
    expect(formatted).to.equal('6.4bn');
  });

});