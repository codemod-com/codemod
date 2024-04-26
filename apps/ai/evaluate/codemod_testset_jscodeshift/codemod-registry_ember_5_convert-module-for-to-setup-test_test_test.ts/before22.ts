import engineResolverFor from 'ember-engines/test-support/engine-resolver-for';
import { moduleFor, moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module } from 'qunit';

const resolver = engineResolverFor('appointments-manager');

moduleForComponent('date-picker', 'Integration | Component | Date picker', {
    integration: true,
    resolver
});

test('renders text', function(assert) {
    this.render(hbs`{{date-picker}}`);
    assert.equal(this.$().text().trim(), 'una fecha');
});

moduleFor('service:foo', {
    resolver
});

test('can resolve from custom resolver', function(assert) {
    assert.ok(this.container.lookup('service:foo'));
});

module('non-ember-qunit module', {
    resolver
});

test('custom resolver property means nothing, and ends up in `beforeEach`', function(assert) {
    assert.ok(this.container.lookup('service:foo'));
});