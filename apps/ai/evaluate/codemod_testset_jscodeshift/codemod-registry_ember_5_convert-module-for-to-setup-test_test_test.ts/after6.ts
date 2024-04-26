import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | Foo', function(hooks) {
    setupTest(hooks);

    hooks.beforeEach(function() {
        let service = this.owner.lookup('service:thingy');
    });

    test('it happens', function() {
        this.owner.lookup('service:thingy').doSomething();
    });
});

module('Unit | Service | Bar', function(hooks) {
    setupTest(hooks);

    test('it happens again?', function() {
        this.owner.lookup('service:thingy').doSomething();
    });
});