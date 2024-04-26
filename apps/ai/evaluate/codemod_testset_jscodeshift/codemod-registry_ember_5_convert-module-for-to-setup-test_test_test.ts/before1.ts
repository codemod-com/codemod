import { moduleFor, test } from 'ember-qunit';

moduleFor('stuff:here', {
    customFunction() {
        return stuff();
    }
});

test('users customFunction', function(assert) {
    let custom = this.customFunction();
});

moduleFor('stuff:here', {
    customFunction() {
        return stuff();
    },

    otherThing(basedOn) {
        return this.blah(basedOn);
    }
});

test('can have two', function(assert) {
    let custom = this.customFunction();
    let other = this.otherThing();
});

moduleFor('foo:bar', {
    m3: true,
});

test('can access', function(assert) {
    let usesM3 = this.m3;
});

moduleFor('foo:bar', {
    m3: true,

    beforeEach() {
        doStuff();
    },
});

test('separate `hooks.beforeEach` than lifecycle hooks', function(assert) {
    let usesM3 = this.m3;
});