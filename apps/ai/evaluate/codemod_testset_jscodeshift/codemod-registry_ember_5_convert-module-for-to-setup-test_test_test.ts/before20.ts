import { moduleFor, test } from 'ember-qunit';

moduleFor('service:foo', 'Unit | Service | Foo', {
    beforeEach() {
        this.register('service:thingy', thingy);
        this.registry.register('service:thingy', thingy);
    }
});

test('it happens', function() {
    this.register('service:thingy', thingy);
    this.registry.register('service:thingy', thingy);
});

moduleFor('service:bar', 'Unit | Service | Bar');

test('it happens again?', function() {
    this.register('service:thingy', thingy);
    this.registry.register('service:thingy', thingy);
});