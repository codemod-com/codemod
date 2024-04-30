this.get('foo.bar.baz');

let model = Object.create({ foo: { bar: 'baz' } });

model.get('foo.bar');