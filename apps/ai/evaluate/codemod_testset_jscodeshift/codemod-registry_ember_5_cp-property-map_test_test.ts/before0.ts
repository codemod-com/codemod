const Person = EmberObject.extend({
    friendNames: map('friends', function(friend) {
        return friend[this.get('nameKey')];
    }).property('nameKey')
});