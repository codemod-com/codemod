Node.js now supports requiring code coverage to meet a specific threshold before the process exits successfully. To use this feature, you need to enable the --experimental-test-coverage flag.


### Before

```ts
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
  },
  "dependencies": {
    "express": "^4.17.1"
  },
  "devDependencies": {
    "jest": "^27.0.6"
  }
}
```

### After

```ts
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "start": "node --experimental-test-coverage server.js",
  },
  "dependencies": {
    "express": "^4.17.1"
  },
  "devDependencies": {
    "jest": "^27.0.6"
  }
}
```

