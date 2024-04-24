import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | FooBar', function(hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function() {
        this.actions = {};
        this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
    });

    test('it happens', async function(assert) {
        assert.expect(1);

        this.actions.test = () => assert.ok(true);
        await render(hbs`{{test-component test="test"}}`);
    });

    test('it happens non-dotable identifier e.g. [test-foo]', async function(assert) {
        assert.expect(1);

        this.actions['test-foo'] = () => assert.ok(true);
        await render(hbs`{{test-component test="test"}}`);
    });
});

module('Integration | Component | FooBar', function(hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function() {
        this.actions = {};
        this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
    });

    hooks.beforeEach(function(assert) {
        this.actions.test = () => assert.ok(true);
    });

    test('it happens', async function(assert) {
        assert.expect(1);

        await render(hbs`{{test-component test="test"}}`);
    });
});