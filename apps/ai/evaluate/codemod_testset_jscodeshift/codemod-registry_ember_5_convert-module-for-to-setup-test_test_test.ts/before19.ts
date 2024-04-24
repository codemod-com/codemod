import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
    integration: true
});

test('it happens', function(assert) {
    assert.expect(1);

    this.on('test', () => assert.ok(true));
    this.render(hbs`{{test-component test="test"}}`);
});

test('it happens non-dotable identifier e.g. [test-foo]', function(assert) {
    assert.expect(1);

    this.on('test-foo', () => assert.ok(true));
    this.render(hbs`{{test-component test="test"}}`);
});

moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
    integration: true,
    beforeEach(assert) {
        this.on('test', () => assert.ok(true));
    }
});

test('it happens', function(assert) {
    assert.expect(1);

    this.render(hbs`{{test-component test="test"}}`);
});