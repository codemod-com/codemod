import Component from '@ember/component';

export default Component.extend({
    waitForAnimation() {
        this.element.querySelectorAll('.animated').forEach(el => el.addEventListener('transitionend', () => this.doSomething()));
    }
});