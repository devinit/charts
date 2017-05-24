var expect = require('chai').expect;
var common = require('../lib/common');

describe('NaNSafeSort', function() {

  it('should sort', function () {
    var result = [54,12,24].sort(common.NaNSafeSort);

    expect(result).to.deep.equal([12,24,54]);
  });

  it('should sort safely', function () {
    var result = [54,12, NaN, 24].sort(common.NaNSafeSort);

    expect(result).to.deep.equal([NaN, 12,24,54]);
  });

});