This codemod replaces spanStatusfromHttpCode with getSpanStatusFromHttpCode in Sentry 8.x. It transforms instances of spanStatusfromHttpCode to use the new getSpanStatusFromHttpCode function.


## Example

### Before

```ts
const spanStatus = spanStatusfromHttpCode(200);
```

### After

```ts
const spanStatus = getSpanStatusFromHttpCode(200);
```
,
### Before

```ts
const status1 = spanStatusfromHttpCode(404);
const status2 = spanStatusfromHttpCode(500);
```

### After

```ts
const status1 = getSpanStatusFromHttpCode(404);
const status2 = getSpanStatusFromHttpCode(500);
```
,
### Before

```ts
let currentStatus = spanStatusfromHttpCode(302);
```

### After

```ts
let currentStatus = getSpanStatusFromHttpCode(302);
```
,
### Before

```ts
logSpanStatus(spanStatusfromHttpCode(201));
```

### After

```ts
logSpanStatus(getSpanStatusFromHttpCode(201));
```

