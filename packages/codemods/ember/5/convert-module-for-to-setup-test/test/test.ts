import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

/**
 * These test fixtures are based on public tests, which is subject to the original license terms.
 * Original tests: https://github.com/ember-codemods/ember-qunit-codemod/tree/master/transforms/convert-module-for-to-setup-test/__testfixtures__
 *
 * License: 
 	MIT License

	Copyright (c) 2019 ember-codemods

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
 * License URL: https://github.com/ember-codemods/ember-no-implicit-this-codemod/blob/master/LICENSE
 */

describe("ember 5 convert-module-for-to-setup-test", () => {
  it("basic-typescript-support", () => {
    const INPUT = `
        import { moduleFor, test } from 'ember-qunit';

        moduleFor('service:flash', 'Unit | Service | Flash', {
          unit: true
        });
        
        test('should allow messages to be queued', function (assert) {
          let subject = this.subject();
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        module('Unit | Service | Flash', function(hooks) {
          setupTest(hooks);
        
          test('should allow messages to be queued', function (assert) {
            let subject = this.owner.lookup('service:flash');
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.ts",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("ts"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("custom-functions-in-options", () => {
    const INPUT = `
        import { moduleFor, test } from 'ember-qunit';

        moduleFor('stuff:here', {
          customFunction() {
            return stuff();
          }
        });
        
        test('users customFunction', function(assert) {
          let custom = this.customFunction();
        });
        
        moduleFor('stuff:here', {
          customFunction() {
            return stuff();
          },
        
          otherThing(basedOn) {
            return this.blah(basedOn);
          }
        });
        
        test('can have two', function(assert) {
          let custom = this.customFunction();
          let other = this.otherThing();
        });
        
        moduleFor('foo:bar', {
          m3: true,
        });
        
        test('can access', function(assert) {
          let usesM3 = this.m3;
        });
        
        moduleFor('foo:bar', {
          m3: true,
        
          beforeEach() {
            doStuff();
          },
        });
        
        test('separate \`hooks.beforeEach\` than lifecycle hooks', function(assert) {
          let usesM3 = this.m3;
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        module('stuff:here', function(hooks) {
          setupTest(hooks);
        
          hooks.beforeEach(function() {
            this.customFunction = function() {
              return stuff();
            };
          });
        
          test('users customFunction', function(assert) {
            let custom = this.customFunction();
          });
        });
        
        module('stuff:here', function(hooks) {
          setupTest(hooks);
        
          hooks.beforeEach(function() {
            this.customFunction = function() {
              return stuff();
            };
        
            this.otherThing = function(basedOn) {
              return this.blah(basedOn);
            };
          });
        
          test('can have two', function(assert) {
            let custom = this.customFunction();
            let other = this.otherThing();
          });
        });
        
        module('foo:bar', function(hooks) {
          setupTest(hooks);
        
          hooks.beforeEach(function() {
            this.m3 = true;
          });
        
          test('can access', function(assert) {
            let usesM3 = this.m3;
          });
        });
        
        module('foo:bar', function(hooks) {
          setupTest(hooks);
        
          hooks.beforeEach(function() {
            this.m3 = true;
          });
        
          hooks.beforeEach(function() {
            doStuff();
          });
        
          test('separate \`hooks.beforeEach\` than lifecycle hooks', function(assert) {
            let usesM3 = this.m3;
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("custom-module-for-implementation", () => {
    const INPUT = `
        import moduleForComponent from '../helpers/module-for-component';
        import { test } from 'ember-qunit';
        
        moduleForOtherComponent('foo-bar', 'Integration | Component | FooBar', {
          integration: true
        });
        
        test('it does not get changed', function() {
          this.render(hbs\`derp\`);
        });
		`;

    const OUTPUT = `
        import moduleForComponent from '../helpers/module-for-component';
        import { test } from 'qunit';
        
        moduleForOtherComponent('foo-bar', 'Integration | Component | FooBar', {
          integration: true
        });
        
        test('it does not get changed', function() {
          this.render(hbs\`derp\`);
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("get-owner-this", () => {
    const INPUT = `
        import Service from '@ember/service';
        import { moduleFor, test } from 'ember-qunit';
        
        moduleFor('service:flash', 'Unit | Service | Flash', {
          unit: true
        });
        
        test('can fix getOwner(this) usage in a test', function (assert) {
          let owner = getOwner(this);
        });
        
        moduleFor('service:flash', 'Unit | Service | Flash', {
          unit: true,
          beforeEach() {
            let owner = getOwner(this);
          }
        });
        
        test('can use getOwner(this) in beforeEach', function (assert) {
          // stuff
        });
        
        moduleFor('service:flash', 'Unit | Service | Flash', {
          unit: true
        });
        
        test('can use Ember.getOwner(this) also', function (assert) {
          let owner = Ember.getOwner(this);
        });
        
        test('objects registered can continue to use \`getOwner(this)\`', function(assert) {
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
        
        test('can use getOwner(this) in beforeEach for each context', function (assert) {
          // stuff
        });
		`;

    const OUTPUT = `
        import Service from '@ember/service';
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        module('Unit | Service | Flash', function(hooks) {
          setupTest(hooks);
        
          test('can fix getOwner(this) usage in a test', function (assert) {
            let owner = this.owner;
          });
        });
        
        module('Unit | Service | Flash', function(hooks) {
          setupTest(hooks);
        
          hooks.beforeEach(function() {
            let owner = this.owner;
          });
        
          test('can use getOwner(this) in beforeEach', function (assert) {
            // stuff
          });
        });
        
        module('Unit | Service | Flash', function(hooks) {
          setupTest(hooks);
        
          test('can use Ember.getOwner(this) also', function (assert) {
            let owner = this.owner;
          });
        
          test('objects registered can continue to use \`getOwner(this)\`', function(assert) {
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
        
          test('can use getOwner(this) in beforeEach for each context', function (assert) {
            // stuff
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("global-wait", () => {
    const INPUT = `
        import { test } from 'qunit';
        import moduleForAcceptance from '../helpers/module-for-acceptance';
        
        moduleForAcceptance('something');
        
        test('uses global helpers', function(assert) {
          visit('/something');
        
          wait().then(() => assert.ok(true));
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupApplicationTest } from 'ember-qunit';
        
        module('something', function(hooks) {
          setupApplicationTest(hooks);
        
          test('uses global helpers', async function(assert) {
            await visit('/something');
        
            wait().then(() => assert.ok(true));
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("inject", () => {
    const INPUT = `
        import { moduleFor, test } from 'ember-qunit';
 
        moduleFor('service:foo-bar', 'Unit | Service | FooBar', {
        });
        
        test('it exists', function(assert) {
          this.inject.service('foo');
          this.inject.service('foo', { as: 'bar' });
        }); 
        
        test('it works for controllers', function(assert) {
          this.inject.controller('foo');
          this.inject.controller('foo', { as: 'bar' });
        });
        
        test('handles dasherized names', function(assert) {
          this.inject.service('foo-bar');
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        module('Unit | Service | FooBar', function(hooks) {
          setupTest(hooks);
        
          test('it exists', function(assert) {
            this.foo = this.owner.lookup('service:foo');
            this.bar = this.owner.lookup('service:foo');
          });
        
          test('it works for controllers', function(assert) {
            this.foo = this.owner.lookup('controller:foo');
            this.bar = this.owner.lookup('controller:foo');
          });
        
          test('handles dasherized names', function(assert) {
            this['foo-bar'] = this.owner.lookup('service:foo-bar');
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("lookup", () => {
    const INPUT = `
        import { moduleFor, test } from 'ember-qunit';

        moduleFor('service:foo', 'Unit | Service | Foo', {
          beforeEach() {
            let service = this.container.lookup('service:thingy');
          }
        });
        
        test('it happens', function() {
          this.container.lookup('service:thingy').doSomething();
        });
        
        moduleFor('service:bar', 'Unit | Service | Bar');
        
        test('it happens again?', function() {
          this.container.lookup('service:thingy').doSomething();
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        module('Unit | Service | Foo', function(hooks) {
          setupTest(hooks);
        
          hooks.beforeEach(function() {
            let service = this.owner.lookup('service:thingy');
          });
        
          test('it happens', function() {
            this.owner.lookup('service:thingy').doSomething();
          });
        });
        
        module('Unit | Service | Bar', function(hooks) {
          setupTest(hooks);
        
          test('it happens again?', function() {
            this.owner.lookup('service:thingy').doSomething();
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("merge-qunit-imports", () => {
    const INPUT = `
        import { skip } from 'qunit';
        import { moduleFor, test } from 'ember-qunit';
		`;

    const OUTPUT = `
        import { module, skip, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("module-for-acceptance", () => {
    const INPUT = `
    import { test } from 'qunit';
    import moduleForAcceptance from '../helpers/module-for-acceptance';
    import { setupTestHelper } from 'setup-test-helper';
    
    moduleForAcceptance('Acceptance | MyRoute', {
      beforeEach() {
        // my comment
        setupTestHelper();
      },
    });
    
    test('it happens', function() {
      visit('my-route');
      andThen(() => {
        assert.equal(currentURL(), 'wat');
      });
    });
    
    moduleForAcceptance('Acceptance | ES5 MyRoute', {
      beforeEach: function() {
        setupTestHelper();
      },
    });
    
    test('it happens with es5 function', function() {
      visit('my-route');
      andThen(() => {
        // visit me
        assert.equal(currentURL(), 'wat');
        assert.equal(currentURL(), 'wat');
        assert.equal(currentRouteName(), 'wat');
      });
    });
    
    moduleForAcceptance('Acceptance | OtherRoute', {
      beforeEach() {},
    });
    
    test('it happens with find', function() {
      visit('my-route');
      blur('#my-input');
      click('#my-block');
      find('#my-block');
      fillIn('#my-input', 'codemod');
      focus('#my-input');
      tap('#my-input');
      triggerEvent('#my-input', 'focusin');
      triggerKeyEvent('#my-input', 'keyup', 13);
    });
    
    moduleForAcceptance('Acceptance | AndThenRoute');
    
    test('it works with andThen', function() {
      visit('my-route');
      andThen(() => {
        assert.ok(true);
        assert.ok(false);
      });
      find('#my-block');
    });
    
    test('it works with es5 andThen', function() {
      visit('my-route');
      andThen(function() {
        assert.ok(true);
        assert.ok(false);
      });
      find('#my-block');
    });
    
    test('it works with nested', function() {
      visit('my-route');
      andThen(function() {
        assert.equal(currenURL(), 'my-route');
        visit('other-route');
      });
      andThen(function() {
        assert.equal(currenURL(), 'other-route');
      });
    });
    
    test('it works with nested andThens', function() {
      visit('my-route');
      andThen(function() {
        assert.equal(currenURL(), 'my-route');
        visit('other-route');
        andThen(function() {
          assert.equal(currenURL(), 'other-route');
        });
      });
    });
    
    test('it works with assert.expect', function() {
      assert.expect(2);
      visit('my-route');
      andThen(function() {
        assert.equal(currenURL(), 'my-route');
        visit('other-route');
      });
      andThen(function() {
        assert.equal(currenURL(), 'other-route');
      });
    });
    
    module(
      'something',
      {
        beforeEach() {
          console.log('outer beforeEach');
        },
        afterEach() {
          console.log('outer afterEach');
        },
      },
      function() {
        moduleForAcceptance('nested', {
          beforeEach() {
            console.log('nested beforeEach');
          },
          afterEach() {
            console.log('nested afterEach');
          },
        });
    
        test('foo', function(assert) {
          assert.expect(2);
          visit('my-route');
          andThen(function() {
            assert.equal(currenURL(), 'my-route');
          });
        });
      }
    );
    
    module('other thing', function(hooks) {
      hooks.beforeEach(function() {
        console.log('outer beforeEach');
      });
    
      hooks.afterEach(function() {
        console.log('outer afterEach');
      });
    
      moduleForAcceptance('nested', {
        beforeEach() {
          console.log('nested beforeEach');
        },
        afterEach() {
          console.log('nested afterEach');
        },
      });
    
      test('foo', function(assert) {
        assert.expect(2);
        visit('my-route');
        andThen(function() {
          assert.equal(currenURL(), 'my-route');
        });
      });
    });
		`;

    const OUTPUT = `
    import { module, test } from 'qunit';
    import { setupApplicationTest } from 'ember-qunit';
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
      hooks.beforeEach(function() {});
    
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
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("module-for-arg-combos", () => {
    const INPUT = `
        import { moduleFor, test } from 'ember-qunit';

        moduleFor('service:foo', 'Unit | Service | Foo');
        
        test('it happens', function() {
        
        });
        
        moduleFor('service:foo');
        
        test('it happens', function() {
        
        });
        
        moduleFor('service:foo', { integration: true });
        
        test('it happens', function() {
        
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        module('Unit | Service | Foo', function(hooks) {
          setupTest(hooks);
        
          test('it happens', function() {
        
          });
        });
        
        module('service:foo', function(hooks) {
          setupTest(hooks);
        
          test('it happens', function() {
        
          });
        });
        
        module('service:foo', function(hooks) {
          setupTest(hooks);
        
          test('it happens', function() {
        
          });
        });        
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("module-for-component", () => {
    const INPUT = `
        import { moduleForComponent, test } from 'ember-qunit';
        import wait from 'ember-test-helpers/wait';
        import hbs from 'htmlbars-inline-precompile';
        
        moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
          integration: true
        });
        
        test('it happens', function() {
          this.render(hbs\`derp\`);
        });
        
        test('it happens with comments', function(assert) {
          // comments above this.render are preserved
          this.render(hbs\`derp\`);
        
          assert.equal(this._element.textContent, 'derp');
        });
        
        test('multiple renders', function() {
          this.render(hbs\`lololol\`);
        
          assert.ok(this.$().text(), 'lololol');
        
          this.clearRender();
          this.render(hbs\`other stuff\`);
        
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
            this.render(hbs\`derp\`);
          },
        });
        
        test('can make assertion', function (assert) {
          assert.equal(this._element.textContent, 'derp');
        });
        
        moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
          integration: true,
        
          foo() {
            this.render(hbs\`derp\`);
          },
        });
        
        test('can use render in custom method', function (assert) {
          return wait().then(() => {
            assert.equal(this._element.textContent, 'derp');
          });
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupRenderingTest, setupTest } from 'ember-qunit';
        import { clearRender, render, settled } from '@ember/test-helpers';
        import hbs from 'htmlbars-inline-precompile';
        
        module('Integration | Component | FooBar', function(hooks) {
          setupRenderingTest(hooks);
        
          test('it happens', async function() {
            await render(hbs\`derp\`);
          });
        
          test('it happens with comments', async function(assert) {
            // comments above this.render are preserved
            await render(hbs\`derp\`);
        
            assert.equal(this.element.textContent, 'derp');
          });
        
          test('multiple renders', async function() {
            await render(hbs\`lololol\`);
        
            assert.ok(this.$().text(), 'lololol');
        
            await clearRender();
            await render(hbs\`other stuff\`);
        
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
            await render(hbs\`derp\`);
          });
        
          test('can make assertion', function (assert) {
            assert.equal(this.element.textContent, 'derp');
          });
        });
        
        module('Integration | Component | FooBar', function(hooks) {
          setupRenderingTest(hooks);
        
          hooks.beforeEach(function() {
            this.foo = async function() {
              await render(hbs\`derp\`);
            };
          });
        
          test('can use render in custom method', function (assert) {
            return settled().then(() => {
              assert.equal(this.element.textContent, 'derp');
            });
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("module-for-model", () => {
    const INPUT = `
        import {moduleForModel, test} from 'ember-qunit';

        moduleForModel('foo', 'Unit | Model | foo');
        
        test('It transforms the subject', function(assert) {
          const model = this.subject();
        });
        
        moduleForModel('foo', 'Unit | Model | Foo', {
          needs: ['serializer:foo']
        });
        
        test('uses store method', function (assert) {
          let store = this.store();
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        import { run } from '@ember/runloop';
        
        module('Unit | Model | foo', function(hooks) {
          setupTest(hooks);
        
          test('It transforms the subject', function(assert) {
            const model = run(() => this.owner.lookup('service:store').createRecord('foo'));
          });
        });
        
        module('Unit | Model | Foo', function(hooks) {
          setupTest(hooks);
        
          test('uses store method', function (assert) {
            let store = this.owner.lookup('service:store');
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("module-for-with-lifecycle-callbacks", () => {
    const INPUT = `
        import { moduleFor, test } from 'ember-qunit';

        moduleFor('service:foo', 'Unit | Service | Foo', {
          beforeEach() {
            doStuff();
          }
        });
        
        test('it happens', function() {
        
        });
        
        moduleFor('service:foo', 'Unit | Service | Foo', {
          after() {
            afterStuff();
          }
        });
        
        test('it happens', function() {
        
        });
        
        moduleFor('service:foo', 'Unit | Service | Foo', {
          // Comments are preserved
          before: function derpy() {
            let foo = 'bar';
          },
        
          beforeEach(assert) {
            assert.ok(true, 'lol');
          },
        
          afterEach() {
            herk = derp;
          },
        
          after() {
            afterStuff();
          }
        });
        
        test('it happens', function() {
        
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        module('Unit | Service | Foo', function(hooks) {
          setupTest(hooks);
        
          hooks.beforeEach(function() {
            doStuff();
          });
        
          test('it happens', function() {
        
          });
        });
        
        module('Unit | Service | Foo', function(hooks) {
          setupTest(hooks);
        
          hooks.after(function() {
            afterStuff();
          });
        
          test('it happens', function() {
        
          });
        });
        
        module('Unit | Service | Foo', function(hooks) {
          setupTest(hooks);
        
          // Comments are preserved
          hooks.before(function derpy() {
            let foo = 'bar';
          });
        
          hooks.beforeEach(function(assert) {
            assert.ok(true, 'lol');
          });
        
          hooks.afterEach(function() {
            herk = derp;
          });
        
          hooks.after(function() {
            afterStuff();
          });
        
          test('it happens', function() {
        
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("module-with-long-name", () => {
    const INPUT = `
        import { moduleFor, test } from 'ember-qunit';

        moduleFor('service:foo', 'Unit | Service | Foo with a very long name that would cause line breaks');
        
        test('it happens', function() {
        
        });        
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        module('Unit | Service | Foo with a very long name that would cause line breaks', function(hooks) {
          setupTest(hooks);
        
          test('it happens', function() {
        
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("multi-module-for", () => {
    const INPUT = `
        import { moduleFor, test } from 'ember-qunit';

        moduleFor('service:foo', 'Unit | Service | Foo');
        
        test('it happens', function() {
        
        });
        
        moduleFor('service:foo', 'Unit | Service | Foo');
        
        test('it happens again?', function() {
        
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        module('Unit | Service | Foo', function(hooks) {
          setupTest(hooks);
        
          test('it happens', function() {
        
          });
        });
        
        module('Unit | Service | Foo', function(hooks) {
          setupTest(hooks);
        
          test('it happens again?', function() {
        
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("native-qunit-to-nested", () => {
    const INPUT = `
        import { abs } from 'dummy/helpers/abs';
        import { module, test } from 'qunit';
        
        module('Unit | Helper | abs');
        
        test('absolute value works', function(assert) {
          let result;
          result = abs([-1]);
          assert.equal(result, 1);
          result = abs([1]);
          assert.equal(result, 1);
        });
		`;

    const OUTPUT = `
        import { abs } from 'dummy/helpers/abs';
        import { module, test } from 'qunit';
        
        module('Unit | Helper | abs', function() {
          test('absolute value works', function(assert) {
            let result;
            result = abs([-1]);
            assert.equal(result, 1);
            result = abs([1]);
            assert.equal(result, 1);
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("nested-module-with-arrow", () => {
    const INPUT = `
        import { module, test } from 'qunit';
        import { setupRenderingTest, setupTest } from 'ember-qunit';
        import { clearRender, render, settled } from '@ember/test-helpers';
        import hbs from 'htmlbars-inline-precompile';
        
        module('Integration | Component | FooBar', hooks => {
          setupRenderingTest(hooks);
        
          test('it happens', async function() {
            await render(hbs\`derp\`);
          });
        
          test('it happens with comments', async function(assert) {
            // comments above this.render are preserved
            await render(hbs\`derp\`);
        
            assert.equal(this.element.textContent, 'derp');
          });
        
          test('multiple renders', async function() {
            await render(hbs\`lololol\`);
        
            assert.ok(this.$().text(), 'lololol');
        
            await clearRender();
            await render(hbs\`other stuff\`);
        
            assert.ok(this.$().text(), 'other stuff');
          });
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupRenderingTest, setupTest } from 'ember-qunit';
        import { clearRender, render, settled } from '@ember/test-helpers';
        import hbs from 'htmlbars-inline-precompile';
        
        module('Integration | Component | FooBar', hooks => {
          setupRenderingTest(hooks);
        
          test('it happens', async function() {
            await render(hbs\`derp\`);
          });
        
          test('it happens with comments', async function(assert) {
            // comments above this.render are preserved
            await render(hbs\`derp\`);
        
            assert.equal(this.element.textContent, 'derp');
          });
        
          test('multiple renders', async function() {
            await render(hbs\`lololol\`);
        
            assert.ok(this.$().text(), 'lololol');
        
            await clearRender();
            await render(hbs\`other stuff\`);
        
            assert.ok(this.$().text(), 'other stuff');
          });
        });
        
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("non-module-ember-qunit-imports", () => {
    const INPUT = `
        import resolver from './helpers/resolver';
        import {
          setResolver
        } from 'ember-qunit';
        import { start } from 'ember-cli-qunit';
        
        setResolver(resolver);
        start();
		`;

    const OUTPUT = `
        import resolver from './helpers/resolver';
        import {
          setResolver
        } from 'ember-qunit';
        import { start } from 'ember-cli-qunit';
        
        setResolver(resolver);
        start();
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("non-module-render-usage", () => {
    const INPUT = `
        import someOtherThing from '../foo-bar/';

        // this example doesn't use this.render inside of a test block, so it should not be transformed
        // and there should be no new imports added
        someOtherThing(function() {
          this.render('derp');
        });
		`;

    const OUTPUT = `
        import someOtherThing from '../foo-bar/';

        // this example doesn't use this.render inside of a test block, so it should not be transformed
        // and there should be no new imports added
        someOtherThing(function() {
          this.render('derp');
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("on", () => {
    const INPUT = `
        import { moduleForComponent, test } from 'ember-qunit';
        import hbs from 'htmlbars-inline-precompile';
        
        moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
          integration: true
        });
        
        test('it happens', function(assert) {
          assert.expect(1);
        
          this.on('test', () => assert.ok(true));
          this.render(hbs\`{{test-component test="test"}}\`);
        });
        
        test('it happens non-dotable identifier e.g. [test-foo]', function(assert) {
          assert.expect(1);
        
          this.on('test-foo', () => assert.ok(true));
          this.render(hbs\`{{test-component test="test"}}\`);
        });
        
        moduleForComponent('foo-bar', 'Integration | Component | FooBar', {
          integration: true,
          beforeEach(assert) {
            this.on('test', () => assert.ok(true));
          }
        });
        
        test('it happens', function(assert) {
          assert.expect(1);
        
          this.render(hbs\`{{test-component test="test"}}\`);
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupRenderingTest } from 'ember-qunit';
        import { render } from '@ember/test-helpers';
        import hbs from 'htmlbars-inline-precompile';
        
        module('Integration | Component | FooBar', function(hooks) {
          setupRenderingTest(hooks);
        
          hooks.beforeEach(function() {
            this.actions = {};
            this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
          });
        
          test('it happens', async function(assert) {
            assert.expect(1);
        
            this.actions.test = () => assert.ok(true);
            await render(hbs\`{{test-component test="test"}}\`);
          });
        
          test('it happens non-dotable identifier e.g. [test-foo]', async function(assert) {
            assert.expect(1);
        
            this.actions['test-foo'] = () => assert.ok(true);
            await render(hbs\`{{test-component test="test"}}\`);
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
        
            await render(hbs\`{{test-component test="test"}}\`);
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("register", () => {
    const INPUT = `
        import { moduleFor, test } from 'ember-qunit';

        moduleFor('service:foo', 'Unit | Service | Foo', {
          beforeEach() {
            this.register('service:thingy', thingy);
            this.registry.register('service:thingy', thingy);
          }
        });
        
        test('it happens', function() {
          this.register('service:thingy', thingy);
          this.registry.register('service:thingy', thingy);
        });
        
        moduleFor('service:bar', 'Unit | Service | Bar');
        
        test('it happens again?', function() {
          this.register('service:thingy', thingy);
          this.registry.register('service:thingy', thingy);
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        module('Unit | Service | Foo', function(hooks) {
          setupTest(hooks);
        
          hooks.beforeEach(function() {
            this.owner.register('service:thingy', thingy);
            this.owner.register('service:thingy', thingy);
          });
        
          test('it happens', function() {
            this.owner.register('service:thingy', thingy);
            this.owner.register('service:thingy', thingy);
          });
        });
        
        module('Unit | Service | Bar', function(hooks) {
          setupTest(hooks);
        
          test('it happens again?', function() {
            this.owner.register('service:thingy', thingy);
            this.owner.register('service:thingy', thingy);
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("remove-empty-import", () => {
    const INPUT = `
        import { module, test } from 'ember-qunit';
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("resolver", () => {
    const INPUT = `
        import { module } from 'qunit';
        import { moduleFor, moduleForComponent, test } from 'ember-qunit';
        import hbs from 'htmlbars-inline-precompile';
        import engineResolverFor from 'ember-engines/test-support/engine-resolver-for';
        
        const resolver = engineResolverFor('appointments-manager');
        
        moduleForComponent('date-picker', 'Integration | Component | Date picker', {
          integration: true,
          resolver
        });
        
        test('renders text', function(assert) {
          this.render(hbs\`{{date-picker}}\`);
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
        
        test('custom resolver property means nothing, and ends up in \`beforeEach\`', function(assert) {
          assert.ok(this.container.lookup('service:foo'));
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest, setupRenderingTest } from 'ember-qunit';
        import { render } from '@ember/test-helpers';
        import hbs from 'htmlbars-inline-precompile';
        import engineResolverFor from 'ember-engines/test-support/engine-resolver-for';
        
        const resolver = engineResolverFor('appointments-manager');
        
        module('Integration | Component | Date picker', function(hooks) {
          setupRenderingTest(hooks, {
            resolver
          });
        
          test('renders text', async function(assert) {
            await render(hbs\`{{date-picker}}\`);
            assert.equal(this.$().text().trim(), 'una fecha');
          });
        });
        
        module('service:foo', function(hooks) {
          setupTest(hooks, {
            resolver
          });
        
          test('can resolve from custom resolver', function(assert) {
            assert.ok(this.owner.lookup('service:foo'));
          });
        });
        
        module('non-ember-qunit module', function(hooks) {
          hooks.beforeEach(function() {
            this.resolver = resolver;
          });
        
          test('custom resolver property means nothing, and ends up in \`beforeEach\`', function(assert) {
            assert.ok(this.owner.lookup('service:foo'));
          });
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("rewrite-imports", () => {
    const INPUT = `
        import { moduleFor, moduleForComponent, moduleForModel } from 'ember-qunit';
		`;

    const OUTPUT = `
        import { module } from 'qunit';
        import { setupTest } from 'ember-qunit';
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("simple-module-for", () => {
    const INPUT = `
        import { moduleFor, test } from 'ember-qunit';

        moduleFor('service:foo', 'Unit | Service | Foo');
        
        test('it happens', function() {
        
        });
        
        test('it happens again', function() {
        
        });
        
        // this one has comments
        test('it happens and again', function() {
        
        });
        
        skip('this is included');
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        module('Unit | Service | Foo', function(hooks) {
          setupTest(hooks);
        
          test('it happens', function() {
        
          });
        
          test('it happens again', function() {
        
          });
        
          // this one has comments
          test('it happens and again', function() {
        
          });
        
          skip('this is included');
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("subject", () => {
    const INPUT = `
        import { moduleFor, test } from 'ember-qunit';

        moduleFor('service:flash', 'Unit | Service | Flash', {
          unit: true
        });
        
        test('should allow messages to be queued', function (assert) {
          let subject = this.subject();
        });
        
        moduleFor('service:non-singleton-service', 'Unit | Service | NonSingletonService', {
          unit: true
        });
        
        test('does something', function (assert) {
          let subject = this.subject({ name: 'James' });
        });
        
        moduleFor('model:foo', 'Unit | Model | Foo', {
          unit: true
        });
        
        test('has some thing', function (assert) {
          let subject = this.subject();
        });
        
        test('has another thing', function (assert) {
          let subject = this.subject({ size: 'big' });
        });
        
        moduleForModel('foo', 'Integration | Model | Foo', {
          integration: true
        });
        
        test('has some thing', function (assert) {
          let subject = this.subject();
        });
        
        moduleForModel('foo', 'Unit | Model | Foo', {
          needs: ['serializer:foo']
        });
        
        test('has some thing', function (assert) {
          let subject = this.subject();
        });
        
        moduleForComponent('foo-bar', 'Unit | Component | FooBar', {
          unit: true,
        });
        
        test('has some thing', function (assert) {
          let subject = this.subject();
        });
        
        test('has another thing', function (assert) {
          let subject = this.subject({ size: 'big' });
        });
        
        moduleFor('service:foo', {
          subject() {
            return derp();
          }
        });
        
        test('can use custom subject', function(assert) {
          let subject = this.subject();
        });
        
        moduleFor('service:foo', 'Unit | Service | Foo', {
          unit: true,
        
          beforeEach() {
            this.service = this.subject();
          }
        });
        
        test('can use service', function (assert) {
          this.service.something();
        });
        
        moduleFor('service:foo');
        
        test('does not require more than one argument', function(assert) {
          let subject = this.subject();
        });
        
        moduleFor('service:foo', {
          integration: true
        });
        
        test('can use subject in moduleFor + integration: true', function(assert) {
          let subject = this.subject();
        });
		`;

    const OUTPUT = `
        import { module, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        
        import { run } from '@ember/runloop';
        
        module('Unit | Service | Flash', function(hooks) {
          setupTest(hooks);
        
          test('should allow messages to be queued', function (assert) {
            let subject = this.owner.lookup('service:flash');
          });
        });
        
        module('Unit | Service | NonSingletonService', function(hooks) {
          setupTest(hooks);
        
          test('does something', function (assert) {
            let subject = this.owner.factoryFor('service:non-singleton-service').create({ name: 'James' });
          });
        });
        
        module('Unit | Model | Foo', function(hooks) {
          setupTest(hooks);
        
          test('has some thing', function (assert) {
            let subject = run(() => this.owner.lookup('service:store').createRecord('foo'));
          });
        
          test('has another thing', function (assert) {
            let subject = run(() => this.owner.lookup('service:store').createRecord('foo', { size: 'big' }));
          });
        });
        
        module('Integration | Model | Foo', function(hooks) {
          setupTest(hooks);
        
          test('has some thing', function (assert) {
            let subject = run(() => this.owner.lookup('service:store').createRecord('foo'));
          });
        });
        
        module('Unit | Model | Foo', function(hooks) {
          setupTest(hooks);
        
          test('has some thing', function (assert) {
            let subject = run(() => this.owner.lookup('service:store').createRecord('foo'));
          });
        });
        
        module('Unit | Component | FooBar', function(hooks) {
          setupTest(hooks);
        
          test('has some thing', function (assert) {
            let subject = this.owner.factoryFor('component:foo-bar').create();
          });
        
          test('has another thing', function (assert) {
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
        
          test('can use service', function (assert) {
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
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("test-skip-imports", () => {
    const INPUT = `
        import { moduleFor, test, skip } from 'ember-qunit';
		`;

    const OUTPUT = `
        import { module, skip, test } from 'qunit';
        import { setupTest } from 'ember-qunit';
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("wait", () => {
    const INPUT = `
        import wait from 'ember-test-helpers/wait';

        function stuff() {
          wait().then(() => {
            otherStuff();
          });
        }
		`;

    const OUTPUT = `
        import { settled } from '@ember/test-helpers';

        function stuff() {
          settled().then(() => {
            otherStuff();
          });
        }
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
