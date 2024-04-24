import { get, set } from '@ember/object'
import Ember from 'ember';

let foo1 = get(this, 'foo');
let foo2 = get(this, 'foo.bar');
let foo3 = get(this, 'foo-bar');
let foo4 = get(this, 42);

let foo5 = Ember.get(this, 'foo');
let foo6 = Ember.get(this, 'foo.bar');
let foo7 = Ember.get(this, 'foo-bar');
let foo8 = Ember.get(this, `\${'foo'}.bar`);

let obj = { bar: 'baz' };
let bar = get(obj, 'bar');