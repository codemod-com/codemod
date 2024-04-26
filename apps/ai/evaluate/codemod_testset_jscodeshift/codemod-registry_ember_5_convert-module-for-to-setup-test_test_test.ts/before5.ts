import { moduleFor, test } from 'ember-qunit';

moduleFor('service:foo-bar', 'Unit | Service | FooBar', {
});

test('it exists', function(assert) {
    this.inject.service('foo');
    this.inject.service('foo', { as: 'bar' });
});

test('it works for controllers', function(assert) {
    this.inject.controller('foo');
    this.inject.controller('foo', { as: 'bar' });
});

test('handles dasherized names', function(assert) {
    this.inject.service('foo-bar');
});