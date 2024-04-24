import { clearRender, render, settled } from '@ember/test-helpers';
import { setupRenderingTest, setupTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | FooBar', function(hooks) {
    setupRenderingTest(hooks);

    test('it happens', async function() {
        await render(hbs`derp`);
    });

    test('it happens with comments', async function(assert) {
        // comments above this.render are preserved
        await render(hbs`derp`);

        assert.equal(this.element.textContent, 'derp');
    });

    test('multiple renders', async function() {
        await render(hbs`lololol`);

        assert.ok(this.$().text(), 'lololol');

        await clearRender();
        await render(hbs`other stuff`);

        assert.ok(this.$().text(), 'other stuff');
    });
});

module('Unit | Component | FooBar', function(hooks) {
    setupTest(hooks);

    test('it happens', function() {
    });

    test('it happens again', function() {
    });
});

module('Unit | Component | FooBar', function(hooks) {
    setupTest(hooks);

    test('it happens', function() {
    });

    test('it happens over and over', function() {
    });
});

module('Integration | Component | FooBar', function(hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(async function() {
        await render(hbs`derp`);
    });

    test('can make assertion', function(assert) {
        assert.equal(this.element.textContent, 'derp');
    });
});

module('Integration | Component | FooBar', function(hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function() {
        this.foo = async function() {
            await render(hbs`derp`);
        };
    });

    test('can use render in custom method', function(assert) {
        return settled().then(() => {
            assert.equal(this.element.textContent, 'derp');
        });
    });
});