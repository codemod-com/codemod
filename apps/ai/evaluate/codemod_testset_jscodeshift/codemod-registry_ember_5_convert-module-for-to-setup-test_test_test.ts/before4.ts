import { test } from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('something');

test('uses global helpers', function(assert) {
    visit('/something');

    wait().then(() => assert.ok(true));
});