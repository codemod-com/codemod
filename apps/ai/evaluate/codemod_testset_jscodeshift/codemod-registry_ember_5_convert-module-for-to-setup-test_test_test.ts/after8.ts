import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { setupTestHelper } from 'setup-test-helper';

module('Acceptance | MyRoute', function(hooks) {
    setupApplicationTest(hooks);

    hooks.beforeEach(function() {
        // my comment
        setupTestHelper();
    });

    test('it happens', async function() {
        await visit('my-route');
        assert.equal(currentURL(), 'wat');
    });
});

module('Acceptance | ES5 MyRoute', function(hooks) {
    setupApplicationTest(hooks);

    hooks.beforeEach(function() {
        setupTestHelper();
    });

    test('it happens with es5 function', async function() {
        await visit('my-route');
        // visit me
        assert.equal(currentURL(), 'wat');
        assert.equal(currentURL(), 'wat');
        assert.equal(currentRouteName(), 'wat');
    });
});

module('Acceptance | OtherRoute', function(hooks) {
    setupApplicationTest(hooks);
    hooks.beforeEach(function() { });

    test('it happens with find', async function() {
        await visit('my-route');
        await blur('#my-input');
        await click('#my-block');
        await find('#my-block');
        await fillIn('#my-input', 'codemod');
        await focus('#my-input');
        await tap('#my-input');
        await triggerEvent('#my-input', 'focusin');
        await triggerKeyEvent('#my-input', 'keyup', 13);
    });
});

module('Acceptance | AndThenRoute', function(hooks) {
    setupApplicationTest(hooks);

    test('it works with andThen', async function() {
        await visit('my-route');
        assert.ok(true);
        assert.ok(false);
        await find('#my-block');
    });

    test('it works with es5 andThen', async function() {
        await visit('my-route');
        assert.ok(true);
        assert.ok(false);
        await find('#my-block');
    });

    test('it works with nested', async function() {
        await visit('my-route');
        assert.equal(currenURL(), 'my-route');
        await visit('other-route');
        assert.equal(currenURL(), 'other-route');
    });

    test('it works with nested andThens', async function() {
        await visit('my-route');
        assert.equal(currenURL(), 'my-route');
        await visit('other-route');
        assert.equal(currenURL(), 'other-route');
    });

    test('it works with assert.expect', async function() {
        assert.expect(2);
        await visit('my-route');
        assert.equal(currenURL(), 'my-route');
        await visit('other-route');
        assert.equal(currenURL(), 'other-route');
    });
});

module('something', function(hooks) {
    hooks.beforeEach(function() {
        console.log('outer beforeEach');
    });

    hooks.afterEach(function() {
        console.log('outer afterEach');
    });

    module('nested', function(hooks) {
        setupApplicationTest(hooks);

        hooks.beforeEach(function() {
            console.log('nested beforeEach');
        });

        hooks.afterEach(function() {
            console.log('nested afterEach');
        });

        test('foo', async function(assert) {
            assert.expect(2);
            await visit('my-route');
            assert.equal(currenURL(), 'my-route');
        });
    });
});

module('other thing', function(hooks) {
    hooks.beforeEach(function() {
        console.log('outer beforeEach');
    });

    hooks.afterEach(function() {
        console.log('outer afterEach');
    });

    module('nested', function(hooks) {
        setupApplicationTest(hooks);

        hooks.beforeEach(function() {
            console.log('nested beforeEach');
        });

        hooks.afterEach(function() {
            console.log('nested afterEach');
        });

        test('foo', async function(assert) {
            assert.expect(2);
            await visit('my-route');
            assert.equal(currenURL(), 'my-route');
        });
    });
});