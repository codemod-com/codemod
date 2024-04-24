import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | Flash', function(hooks) {
    setupTest(hooks);

    test('should allow messages to be queued', function(assert) {
        let subject = this.owner.lookup('service:flash');
    });
});