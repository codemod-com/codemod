import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('stuff:here', function(hooks) {
    setupTest(hooks);

    hooks.beforeEach(function() {
        this.customFunction = function() {
            return stuff();
        };
    });

    test('users customFunction', function(assert) {
        let custom = this.customFunction();
    });
});

module('stuff:here', function(hooks) {
    setupTest(hooks);

    hooks.beforeEach(function() {
        this.customFunction = function() {
            return stuff();
        };

        this.otherThing = function(basedOn) {
            return this.blah(basedOn);
        };
    });

    test('can have two', function(assert) {
        let custom = this.customFunction();
        let other = this.otherThing();
    });
});

module('foo:bar', function(hooks) {
    setupTest(hooks);

    hooks.beforeEach(function() {
        this.m3 = true;
    });

    test('can access', function(assert) {
        let usesM3 = this.m3;
    });
});

module('foo:bar', function(hooks) {
    setupTest(hooks);

    hooks.beforeEach(function() {
        this.m3 = true;
    });

    hooks.beforeEach(function() {
        doStuff();
    });

    test('separate `hooks.beforeEach` than lifecycle hooks', function(assert) {
        let usesM3 = this.m3;
    });
});