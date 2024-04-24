import someOtherThing from '../foo-bar/';

// this example doesn't use this.render inside of a test block, so it should not be transformed
// and there should be no new imports added
someOtherThing(function() {
    this.render('derp');
});