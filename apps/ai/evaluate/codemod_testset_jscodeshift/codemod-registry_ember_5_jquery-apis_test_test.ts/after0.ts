import Component from '@ember/component';

export default Component.extend({
    waitForAnimation() {
        this.element.addEventListener('transitionend', () => this.doSomething());
    }
});