import Component from '@ember/component';

export default Component.extend({
    waitForAnimation() {
        this.$().on('transitionend', () => this.doSomething());
    }
});