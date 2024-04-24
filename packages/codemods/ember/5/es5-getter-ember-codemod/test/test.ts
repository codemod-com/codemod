import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("ember 5 es5-getter-ember-codemod", () => {
  it("does-not-transform-full-path-ts", () => {
    const INPUT = `
        class Thing {
            doesNotTransform() {
              this.get('foo.bar.baz');
          
              let model = Object.create({ foo: { bar: 'baz' } });
          
              model.get('foo.bar');
            }
          }
		`;

    const OUTPUT = `
        class Thing {
            doesNotTransform() {
              this.get('foo.bar.baz');
          
              let model = Object.create({ foo: { bar: 'baz' } });
          
              model.get('foo.bar');
            }
          }
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

  it("does-not-transform-full-path", () => {
    const INPUT = `
        this.get('foo.bar.baz');

        let model = Object.create({foo: { bar: 'baz' }});
        
        model.get('foo.bar');
		`;

    const OUTPUT = `
        this.get('foo.bar.baz');

        let model = Object.create({foo: { bar: 'baz' }});
        
        model.get('foo.bar');
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

  it("does-not-transform-http-stubs", () => {
    const INPUT = `
        this.get('foo/:id', (schema, { params }) => {
        });
        
        this.get('/some/url', function(req) {
          return req;
        });
		`;

    const OUTPUT = `
        this.get('foo/:id', (schema, { params }) => {
        });
        
        this.get('/some/url', function(req) {
          return req;
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

  it("get-on-ember-object-ts", () => {
    const INPUT = `
        class Things {
            objectLookup() {
              let chancancode = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
          
              chancancode.get('fullName');
            }
          
            modelLookup() {
              let model = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
          
              model.get('fullName');
            }
          
            routeLookup() {
              let route = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
          
              route.get('fullName');
            }
          
            controllerLookup() {
              let controller = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
          
              controller.get('fullName');
              controller.get('foo.bar');
              controller.get('foo-bar');
            }
          }
		`;

    const OUTPUT = `
        class Things {
            objectLookup() {
              let chancancode = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
          
              chancancode.get('fullName');
            }
          
            modelLookup() {
              let model = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
          
              model.get('fullName');
            }
          
            routeLookup() {
              let route = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
          
              route.fullName;
            }
          
            controllerLookup() {
              let controller = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
          
              controller.fullName;
              controller.get('foo.bar');
              controller['foo-bar'];
            }
          }
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

  it("get-on-ember-object", () => {
    const INPUT = `
        let chancancode = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

        chancancode.get('fullName');
        
        let model = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
        
        model.get('fullName');
        
        let route = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
        
        route.get('fullName');
        
        let controller = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
        
        controller.get('fullName');
        controller.get('foo.bar');
        controller.get('foo-bar');
		`;

    const OUTPUT = `
        let chancancode = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

        chancancode.get('fullName');
        
        let model = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
        
        model.get('fullName');
        
        let route = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
        
        route.fullName;
        
        let controller = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });
        
        controller.fullName;
        controller.get('foo.bar');
        controller['foo-bar'];
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

  it("get-on-this-expression-ts", () => {
    const INPUT = `
        import Object from '@ember/object';
        import { computed } from '@ember-decorators/object';
        
        class Person extends Object {
          @computed('firstName', 'lastName')
          get fullName() {
            return \`\${this.get('firstName')} \${this.get('lastName')}\`;
          }
        
          invalidIdentifier() {
            return this.get('foo-bar');
          }
        
          numericKey() {
            return this.get(42);
          }
        
          templatedKey() {
            return this.get(\`\${'foo'}\`);
          }
        }
		`;

    const OUTPUT = `
        import Object from '@ember/object';
        import { computed } from '@ember-decorators/object';
        
        class Person extends Object {
          @computed('firstName', 'lastName')
          get fullName() {
            return \`\${this.firstName} \${this.lastName}\`;
          }
        
          invalidIdentifier() {
            return this['foo-bar'];
          }
        
          numericKey() {
            return this.get(42);
          }
        
          templatedKey() {
            return this.get(\`\${'foo'}\`);
          }
        }
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

  it("get-on-this-expression", () => {
    const INPUT = `
        import Object from '@ember/object';
        import { computed } from '@ember-decorators/object';
        
        class Person extends Object {
          @computed('firstName', 'lastName')
          get fullName() {
            return \`\${this.get('firstName')} \${this.get('lastName')}\`;
          }
        
          invalidIdentifier() {
            return this.get('foo-bar');
          }
        
          numericKey() {
            return this.get(42);
          }
        
          templatedKey() {
            return this.get(\`\${'foo'}\`);
          }
        }
		`;

    const OUTPUT = `
        import Object from '@ember/object';
        import { computed } from '@ember-decorators/object';
        
        class Person extends Object {
          @computed('firstName', 'lastName')
          get fullName() {
            return \`\${this.firstName} \${this.lastName}\`;
          }
        
          invalidIdentifier() {
            return this['foo-bar'];
          }
        
          numericKey() {
            return this.get(42);
          }
        
          templatedKey() {
            return this.get(\`\${'foo'}\`);
          }
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

  it("getProperties-on-ember-object-ts", () => {
    const INPUT = `
        class Thing {
            getPropertiesMethod(chancancode) {
              let { firstName, lastName, fullName } = chancancode.getProperties(
                'firstName',
                'lastName',
                'fullName'
              );
          
              Object.assign({}, this.getProperties('firstName', 'lastName', 'fullName'), {
                firstName: 'bob'
              });
            }
          
            thisGetPropertiesMethod() {
              let { firstName, lastName, fullName } = this.getProperties(
                'firstName',
                'lastName',
                'fullName'
              );
          
              Object.assign({}, this.getProperties('firstName', 'lastName', 'fullName'), {
                firstName: 'bob'
              });
            }
          }
		`;

    const OUTPUT = `
        class Thing {
            getPropertiesMethod(chancancode) {
              let { firstName, lastName, fullName } = chancancode;
          
              Object.assign({}, this.getProperties('firstName', 'lastName', 'fullName'), {
                firstName: 'bob'
              });
            }
          
            thisGetPropertiesMethod() {
              let { firstName, lastName, fullName } = this;
          
              Object.assign({}, this.getProperties('firstName', 'lastName', 'fullName'), {
                firstName: 'bob'
              });
            }
          }
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

  it("getProperties-on-ember-object", () => {
    const INPUT = `
        class Thing {
            getPropertiesMethod(chancancode) {
              let { firstName, lastName, fullName } = chancancode.getProperties(
                'firstName',
                'lastName',
                'fullName'
              );
          
              Object.assign({}, this.getProperties('firstName', 'lastName', 'fullName'), {
                firstName: 'bob'
              });
            }
          
            thisGetPropertiesMethod() {
              let { firstName, lastName, fullName } = this.getProperties(
                'firstName',
                'lastName',
                'fullName'
              );
          
              Object.assign({}, this.getProperties('firstName', 'lastName', 'fullName'), {
                firstName: 'bob'
              });
            }
          }
		`;

    const OUTPUT = `
        class Thing {
            getPropertiesMethod(chancancode) {
              let { firstName, lastName, fullName } = chancancode;
          
              Object.assign({}, this.getProperties('firstName', 'lastName', 'fullName'), {
                firstName: 'bob'
              });
            }
          
            thisGetPropertiesMethod() {
              let { firstName, lastName, fullName } = this;
          
              Object.assign({}, this.getProperties('firstName', 'lastName', 'fullName'), {
                firstName: 'bob'
              });
            }
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

  it("standalone-ember-get-ts", () => {
    const INPUT = `
        import Ember from 'ember';
        import { set, get } from '@ember/object'
        
        let foo1 = get(this, 'foo');
        let foo2 = get(this, 'foo.bar');
        let foo3 = get(this, 'foo-bar');
        let foo4 = get(this, 42);
        
        let foo5 = Ember.get(this, 'foo');
        let foo6 = Ember.get(this, 'foo.bar');
        let foo7 = Ember.get(this, 'foo-bar');
        let foo8 = Ember.get(this, \`\${'foo'}.bar\`);
        
        let obj = { bar: 'baz' };
        let bar = get(obj, 'bar');
		`;

    const OUTPUT = `
        import Ember from 'ember';
        import { set, get } from '@ember/object'
        
        let foo1 = this.foo;
        let foo2 = get(this, 'foo.bar');
        let foo3 = this['foo-bar'];
        let foo4 = get(this, 42);
        
        let foo5 = this.foo;
        let foo6 = Ember.get(this, 'foo.bar');
        let foo7 = this['foo-bar'];
        let foo8 = Ember.get(this, \`\${'foo'}.bar\`);
        
        let obj = { bar: 'baz' };
        let bar = get(obj, 'bar');
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

  it("standalone-ember-get", () => {
    const INPUT = `
        import Ember from 'ember';
        import { set, get } from '@ember/object'
        
        let foo1 = get(this, 'foo');
        let foo2 = get(this, 'foo.bar');
        let foo3 = get(this, 'foo-bar');
        let foo4 = get(this, 42);
        
        let foo5 = Ember.get(this, 'foo');
        let foo6 = Ember.get(this, 'foo.bar');
        let foo7 = Ember.get(this, 'foo-bar');
        let foo8 = Ember.get(this, \`\${'foo'}.bar\`);
        
        let obj = { bar: 'baz' };
        let bar = get(obj, 'bar');
		`;

    const OUTPUT = `
        import Ember from 'ember';
        import { set, get } from '@ember/object'
        
        let foo1 = this.foo;
        let foo2 = get(this, 'foo.bar');
        let foo3 = this['foo-bar'];
        let foo4 = get(this, 42);
        
        let foo5 = this.foo;
        let foo6 = Ember.get(this, 'foo.bar');
        let foo7 = this['foo-bar'];
        let foo8 = Ember.get(this, \`\${'foo'}.bar\`);
        
        let obj = { bar: 'baz' };
        let bar = get(obj, 'bar');
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

  it("this-dot-getProperties-ts", () => {
    const INPUT = `
        class Thing {
            thisDotGetPropertiesMethod() {
              let { foo, bar, baz } = this.getProperties('foo', 'bar', 'baz');
            }
          
            nestedGetPropertiesMethod() {
              let { foo, bar, baz } = this.nested.object.getProperties(
                'foo',
                'bar',
                'baz'
              );
            }
          
            thisDotGetPropertiesMethod2() {
              let { foo, barBaz } = this.getProperties('foo', 'bar.baz');
            }
          
            thisDotGetPropertiesMethod3() {
              let foo = this.getProperties('bar', 'baz');
            }
          }
		`;

    const OUTPUT = `
        class Thing {
            thisDotGetPropertiesMethod() {
              let { foo, bar, baz } = this;
            }
          
            nestedGetPropertiesMethod() {
              let { foo, bar, baz } = this.nested.object;
            }
          
            thisDotGetPropertiesMethod2() {
              let { foo, barBaz } = this.getProperties('foo', 'bar.baz');
            }
          
            thisDotGetPropertiesMethod3() {
              let foo = this.getProperties('bar', 'baz');
            }
          }
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

  it("this-dot-getProperties", () => {
    const INPUT = `
        class Thing {
            thisDotGetPropertiesMethod() {
              let { foo, bar, baz } = this.getProperties('foo', 'bar', 'baz');
            }
          
            nestedGetPropertiesMethod() {
              let { foo, bar, baz } = this.nested.object.getProperties(
                'foo',
                'bar',
                'baz'
              );
            }
          
            thisDotGetPropertiesMethod2() {
              let { foo, barBaz } = this.getProperties('foo', 'bar.baz');
            }
          
            thisDotGetPropertiesMethod3() {
              let foo = this.getProperties('bar', 'baz');
            }
          }
		`;

    const OUTPUT = `
        class Thing {
            thisDotGetPropertiesMethod() {
              let { foo, bar, baz } = this;
            }
          
            nestedGetPropertiesMethod() {
              let { foo, bar, baz } = this.nested.object;
            }
          
            thisDotGetPropertiesMethod2() {
              let { foo, barBaz } = this.getProperties('foo', 'bar.baz');
            }
          
            thisDotGetPropertiesMethod3() {
              let foo = this.getProperties('bar', 'baz');
            }
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
