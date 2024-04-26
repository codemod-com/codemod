import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | Flash', function(hooks) {
    setupTest(hooks);

    test('can fix getOwner(this) usage in a test', function(assert) {
        let owner = this.owner;
    });
});

module('Unit | Service | Flash', function(hooks) {
    setupTest(hooks);

    hooks.beforeEach(function() {
        let owner = this.owner;
    });

    test('can use getOwner(this) in beforeEach', function(assert) {
        // stuff
    });
});

module('Unit | Service | Flash', function(hooks) {
    setupTest(hooks);

    test('can use Ember.getOwner(this) also', function(assert) {
        let owner = this.owner;
    });

    test('objects registered can continue to use `getOwner(this)`', function(assert) {
        this.owner.register('service:foo', Service.extend({
            someMethod() {
                let owner = getOwner(this);
                return owner.lookup('other:thing').someMethod();
            }
        }));
    });
});

module('service:flash', function(hooks) {
    setupTest(hooks);

    hooks.beforeEach(function() {
        this.blah = this.owner.lookup('service:blah');
        this.owner.register('service:foo', Service.extend({
            someMethod() {
                let owner = getOwner(this);
                return owner.lookup('other:thing').someMethod();
            }
        }));
    });

    test('can use getOwner(this) in beforeEach for each context', function(assert) {
        // stuff
    });
});