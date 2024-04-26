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