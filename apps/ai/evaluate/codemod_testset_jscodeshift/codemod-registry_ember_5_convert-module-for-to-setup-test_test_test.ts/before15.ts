import { abs } from 'dummy/helpers/abs';
import { module, test } from 'qunit';

module('Unit | Helper | abs');

test('absolute value works', function(assert) {
    let result;
    result = abs([-1]);
    assert.equal(result, 1);
    result = abs([1]);
    assert.equal(result, 1);
});