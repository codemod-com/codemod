import Service from '@ember/service';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:flash', 'Unit | Service | Flash', {
    unit: true
});

test('can fix getOwner(this) usage in a test', function(assert) {
    let owner = getOwner(this);
});

moduleFor('service:flash', 'Unit | Service | Flash', {
    unit: true,
    beforeEach() {
        let owner = getOwner(this);
    }
});

test('can use getOwner(this) in beforeEach', function(assert) {
    // stuff
});

moduleFor('service:flash', 'Unit | Service | Flash', {
    unit: true
});

test('can use Ember.getOwner(this) also', function(assert) {
    let owner = Ember.getOwner(this);
});

test('objects registered can continue to use `getOwner(this)`', function(assert) {
    this.register('service:foo', Service.extend({
        someMethod() {
            let owner = getOwner(this);
            return owner.lookup('other:thing').someMethod();
        }
    }));
});

moduleFor('service:flash', {
    beforeEach() {
        this.blah = getOwner(this).lookup('service:blah');
        this.register('service:foo', Service.extend({
            someMethod() {
                let owner = getOwner(this);
                return owner.lookup('other:thing').someMethod();
            }
        }));
    }
});

test('can use getOwner(this) in beforeEach for each context', function(assert) {
    // stuff
});