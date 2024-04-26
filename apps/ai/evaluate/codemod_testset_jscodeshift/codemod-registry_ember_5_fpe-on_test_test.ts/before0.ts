import EmberObject from '@ember/object';
import { sendEvent } from '@ember/object/events';

let Job = EmberObject.extend({
    logCompleted: function() {
        console.log('Job completed!');
    }.on('completed')
});

let job = Job.create();

sendEvent(job, 'completed'); // Logs 'Job completed!'