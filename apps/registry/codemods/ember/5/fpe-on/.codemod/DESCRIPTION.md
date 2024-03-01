# Fpe On

## Description

## Example

### Before:

```jsx
import EmberObject from '@ember/object';
import { sendEvent } from '@ember/object/events';

let Job = EmberObject.extend({
	logCompleted: function () {
		console.log('Job completed!');
	}.on('completed'),
});

let job = Job.create();

sendEvent(job, 'completed'); // Logs 'Job completed!'
```

### After:

```tsx
import EmberObject from '@ember/object';
import { on } from '@ember/object/evented';
import { sendEvent } from '@ember/object/events';

let Job = EmberObject.extend({
	logCompleted: on('completed', function () {
		console.log('Job completed!');
	}),
});

let job = Job.create();

sendEvent(job, 'completed'); // Logs 'Job completed!'
```
