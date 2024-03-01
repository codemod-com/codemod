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

## Applicability Criteria

Ember.js version higher or equal to 3.11.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~5 minutes per occurrence

### Owner

[Rajasegar Chandran](https://github.com/rajasegar)

### Links for more info

-   https://github.com/ember-codemods/ember-3x-codemods/blob/master/transforms/fpe-on
