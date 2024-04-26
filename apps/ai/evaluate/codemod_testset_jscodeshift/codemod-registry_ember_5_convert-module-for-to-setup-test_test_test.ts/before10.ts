import { moduleForComponent, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
    integration: true
});

test('it happens', function() {
    this.render(hbs`derp`);
});

test('it happens with comments', function(assert) {
    // comments above this.render are preserved
    this.render(hbs`derp`);

    assert.equal(this._element.textContent, 'derp');
});

test('multiple renders', function() {
    this.render(hbs`lololol`);

    assert.ok(this.$().text(), 'lololol');

    this.clearRender();
    this.render(hbs`other stuff`);

    assert.ok(this.$().text(), 'other stuff');
});

moduleForComponent('foo-bar', 'Unit | Component | FooBar', {
    needs: [],
});

test('it happens', function() {
});

test('it happens again', function() {
});

moduleForComponent('foo-bar', 'Unit | Component | FooBar', {
    unit: true,
});

test('it happens', function() {
});

test('it happens over and over', function() {
});

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
    integration: true,

    beforeEach() {
        this.render(hbs`derp`);
    },
});

test('can make assertion', function(assert) {
    assert.equal(this._element.textContent, 'derp');
});

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
    integration: true,

    foo() {
        this.render(hbs`derp`);
    },
});

test('can use render in custom method', function(assert) {
    return wait().then(() => {
        assert.equal(this._element.textContent, 'derp');
    });
});