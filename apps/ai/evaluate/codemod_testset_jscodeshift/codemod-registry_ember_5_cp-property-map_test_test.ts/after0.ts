const Person = EmberObject.extend({
    friendNames: map('friends', ['nameKey'], function(friend) {
        return friend[this.get('nameKey')];
    })
});