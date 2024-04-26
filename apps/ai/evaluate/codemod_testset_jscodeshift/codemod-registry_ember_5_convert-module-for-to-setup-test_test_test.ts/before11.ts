import { moduleForModel, test } from 'ember-qunit';

moduleForModel('foo', 'Unit | Model | foo');

test('It transforms the subject', function(assert) {
    const model = this.subject();
});

moduleForModel('foo', 'Unit | Model | Foo', {
    needs: ['serializer:foo']
});

test('uses store method', function(assert) {
    let store = this.store();
});