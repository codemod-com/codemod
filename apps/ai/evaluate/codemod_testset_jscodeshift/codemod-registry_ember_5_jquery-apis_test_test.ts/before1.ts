import Component from '@ember/component';

export default Component.extend({
    waitForAnimation() {
        this.$('.animated').on('transitionend', () => this.doSomething());
    }
});