import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | Foo', function(hooks) {
    setupTest(hooks);

    hooks.beforeEach(function() {
        doStuff();
    });

    test('it happens', function() {

    });
});

module('Unit | Service | Foo', function(hooks) {
    setupTest(hooks);

    hooks.after(function() {
        afterStuff();
    });

    test('it happens', function() {

    });
});

module('Unit | Service | Foo', function(hooks) {
    setupTest(hooks);

    // Comments are preserved
    hooks.before(function derpy() {
        let foo = 'bar';
    });

    hooks.beforeEach(function(assert) {
        assert.ok(true, 'lol');
    });

    hooks.afterEach(function() {
        herk = derp;
    });

    hooks.after(function() {
        afterStuff();
    });

    test('it happens', function() {

    });
});