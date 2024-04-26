import { moduleFor, test } from 'ember-qunit';

moduleFor('service:foo', 'Unit | Service | Foo', {
    beforeEach() {
        doStuff();
    }
});

test('it happens', function() {

});

moduleFor('service:foo', 'Unit | Service | Foo', {
    after() {
        afterStuff();
    }
});

test('it happens', function() {

});

moduleFor('service:foo', 'Unit | Service | Foo', {
    // Comments are preserved
    before: function derpy() {
        let foo = 'bar';
    },

    beforeEach(assert) {
        assert.ok(true, 'lol');
    },

    afterEach() {
        herk = derp;
    },

    after() {
        afterStuff();
    }
});

test('it happens', function() {

});