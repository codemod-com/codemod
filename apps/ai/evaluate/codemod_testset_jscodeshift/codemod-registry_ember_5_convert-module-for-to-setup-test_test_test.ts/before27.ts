import wait from 'ember-test-helpers/wait';

function stuff() {
    wait().then(() => {
        otherStuff();
    });
}