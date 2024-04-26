import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | Foo', function(hooks) {
    setupTest(hooks);

    hooks.beforeEach(function() {
        this.owner.register('service:thingy', thingy);
        this.owner.register('service:thingy', thingy);
    });

    test('it happens', function() {
        this.owner.register('service:thingy', thingy);
        this.owner.register('service:thingy', thingy);
    });
});

module('Unit | Service | Bar', function(hooks) {
    setupTest(hooks);

    test('it happens again?', function() {
        this.owner.register('service:thingy', thingy);
        this.owner.register('service:thingy', thingy);
    });
});