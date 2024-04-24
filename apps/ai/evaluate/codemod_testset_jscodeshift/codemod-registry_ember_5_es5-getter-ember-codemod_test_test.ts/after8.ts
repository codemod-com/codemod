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