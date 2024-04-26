import { moduleFor, test } from 'ember-qunit';

moduleFor('service:foo', 'Unit | Service | Foo', {
    beforeEach() {
        let service = this.container.lookup('service:thingy');
    }
});

test('it happens', function() {
    this.container.lookup('service:thingy').doSomething();
});

moduleFor('service:bar', 'Unit | Service | Bar');

test('it happens again?', function() {
    this.container.lookup('service:thingy').doSomething();
});