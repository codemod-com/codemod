import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | FooBar', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        this.foo = this.owner.lookup('service:foo');
        this.bar = this.owner.lookup('service:foo');
    });

    test('it works for controllers', function(assert) {
        this.foo = this.owner.lookup('controller:foo');
        this.bar = this.owner.lookup('controller:foo');
    });

    test('handles dasherized names', function(assert) {
        this['foo-bar'] = this.owner.lookup('service:foo-bar');
    });
});