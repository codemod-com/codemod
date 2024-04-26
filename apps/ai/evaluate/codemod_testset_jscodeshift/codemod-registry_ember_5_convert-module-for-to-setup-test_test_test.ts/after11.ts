import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { run } from '@ember/runloop';

module('Unit | Model | foo', function(hooks) {
    setupTest(hooks);

    test('It transforms the subject', function(assert) {
        const model = run(() => this.owner.lookup('service:store').createRecord('foo'));
    });
});

module('Unit | Model | Foo', function(hooks) {
    setupTest(hooks);

    test('uses store method', function(assert) {
        let store = this.owner.lookup('service:store');
    });
});