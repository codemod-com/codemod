import type { Context } from 'mocha';

describe('Test Suite 1', () => {
    it('addition', function(this: Context) {
        assert(1 + 1 == 2);
    });

    it('subtraction', (otherThing: Context) => {
        assert(1 - 1 == 0);
    });
});