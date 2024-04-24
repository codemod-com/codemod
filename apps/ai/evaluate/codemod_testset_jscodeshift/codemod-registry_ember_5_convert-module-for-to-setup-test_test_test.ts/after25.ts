import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { run } from '@ember/runloop';

module('Unit | Service | Flash', function(hooks) {
    setupTest(hooks);

    test('should allow messages to be queued', function(assert) {
        let subject = this.owner.lookup('service:flash');
    });
});

module('Unit | Service | NonSingletonService', function(hooks) {
    setupTest(hooks);

    test('does something', function(assert) {
        let subject = this.owner.factoryFor('service:non-singleton-service').create({ name: 'James' });
    });
});

module('Unit | Model | Foo', function(hooks) {
    setupTest(hooks);

    test('has some thing', function(assert) {
        let subject = run(() => this.owner.lookup('service:store').createRecord('foo'));
    });

    test('has another thing', function(assert) {
        let subject = run(() => this.owner.lookup('service:store').createRecord('foo', { size: 'big' }));
    });
});

module('Integration | Model | Foo', function(hooks) {
    setupTest(hooks);

    test('has some thing', function(assert) {
        let subject = run(() => this.owner.lookup('service:store').createRecord('foo'));
    });
});

module('Unit | Model | Foo', function(hooks) {
    setupTest(hooks);

    test('has some thing', function(assert) {
        let subject = run(() => this.owner.lookup('service:store').createRecord('foo'));
    });
});

module('Unit | Component | FooBar', function(hooks) {
    setupTest(hooks);

    test('has some thing', function(assert) {
        let subject = this.owner.factoryFor('component:foo-bar').create();
    });

    test('has another thing', function(assert) {
        let subject = this.owner.factoryFor('component:foo-bar').create({ size: 'big' });
    });
});

module('service:foo', function(hooks) {
    setupTest(hooks);

    hooks.beforeEach(function() {
        this.subject = function() {
            return derp();
        };
    });

    test('can use custom subject', function(assert) {
        let subject = this.subject();
    });
});

module('Unit | Service | Foo', function(hooks) {
    setupTest(hooks);

    hooks.beforeEach(function() {
        this.service = this.owner.lookup('service:foo');
    });

    test('can use service', function(assert) {
        this.service.something();
    });
});

module('service:foo', function(hooks) {
    setupTest(hooks);

    test('does not require more than one argument', function(assert) {
        let subject = this.owner.lookup('service:foo');
    });
});

module('service:foo', function(hooks) {
    setupTest(hooks);

    test('can use subject in moduleFor + integration: true', function(assert) {
        let subject = this.owner.lookup('service:foo');
    });
});