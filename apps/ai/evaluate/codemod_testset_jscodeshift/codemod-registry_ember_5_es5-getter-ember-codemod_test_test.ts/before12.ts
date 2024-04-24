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