This codemod transforms an asynchronous Python code into synchronous code by removing or modifying specific `async` and `await` patterns.

This codemod eliminates `import asyncio` statements, removes `await` expressions, unwraps `asyncio.run()` calls, and converts `async def` function definitions to synchronous `def` function definitions. This can be useful in environments where `async` functionality is not supported or not required.

## Examples
### Before
```python
import asyncio

async def main():
    somecall(1, 5)

asyncio.run(main())
```

### After
```python
def main():
    somecall(1, 5)

main()
```
### Before
```python
def main():
    await someothercall()
```
### After
```python
def main():
    someothercall()
```