import { clearRender, render, settled } from '@ember/test-helpers';
import { setupRenderingTest, setupTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | FooBar', hooks => {
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