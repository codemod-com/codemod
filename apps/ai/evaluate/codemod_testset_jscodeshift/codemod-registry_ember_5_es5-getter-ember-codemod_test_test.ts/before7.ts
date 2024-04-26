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