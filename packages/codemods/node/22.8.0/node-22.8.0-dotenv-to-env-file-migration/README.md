Loads environment variables from a file relative to the current directory, making them available to applications on process.env. The environment variables which configure Node.js, such as NODE_OPTIONS, are parsed and applied. If the same variable is defined in the environment and in the file, the value from the environment takes precedence.

### Before

```ts
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "dotenv": "^16.4.3"
  },
  "scripts": {
    "start": "node -r dotenv/config index.js"
  }
}
```

### After

```ts
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "start": "node --env-file=.env index.js"
  }
}
```

