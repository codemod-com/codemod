import { describe, it } from 'vitest';

describe('Test Suite 1', () => {
    it('addition', function() {
        assert(1 + 1 == 2);
    });

    it('subtraction', (otherThing) => {
        assert(1 - 1 == 0);
    });
});