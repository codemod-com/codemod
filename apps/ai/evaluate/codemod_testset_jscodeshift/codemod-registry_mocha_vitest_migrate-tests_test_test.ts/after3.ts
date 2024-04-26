import { afterAll, beforeEach, describe, it } from 'vitest';

describe('Test Suite 1', () => {
    beforeEach(() => {
        doAThing();
    });

    it('addition', () => {
        assert(1 + 1 == 2);
    });

    it('subtraction', () => {
        assert(1 - 1 == 0);
    });

    afterAll(() => {
        doAThing();
    });
});