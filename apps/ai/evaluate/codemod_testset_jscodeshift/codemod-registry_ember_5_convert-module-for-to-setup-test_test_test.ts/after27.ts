import { settled } from '@ember/test-helpers';

function stuff() {
    settled().then(() => {
        otherStuff();
    });
}