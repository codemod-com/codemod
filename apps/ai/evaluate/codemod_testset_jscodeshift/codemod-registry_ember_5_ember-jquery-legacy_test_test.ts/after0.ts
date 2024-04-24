import { normalizeEvent } from "ember-jquery-legacy";
export default Component.extend({
    click(event) {
        let nativeEvent = normalizeEvent(event);
    }
});