This codemod is designed to help you migrate your existing codebase from using the native `fetch` API to the more concise and convenient `ky` HTTP client library. By running this codemod, you can automatically update your code to leverage `ky`'s features, such as simpler syntax for common use cases like JSON requests and responses.

## Detailed Description

The codemod performs the following transformations:

- Replaces `fetch` calls with `ky` methods (`ky.get`, `ky.post`, `ky.put`, `ky.delete`).
- Simplifies request setup by using `ky`'s built-in methods for JSON handling (`.json()`).
- Removes manual error checking (`!resp.ok`), as `ky` automatically throws errors for non-2xx responses.
- Streamlines the code by reducing boilerplate and improving readability.

## Example

### Before

```ts
export async function getTodos() {
  const resp = await fetch(`/todos`);
  if (!resp.ok) throw resp;
  return resp.json();
}

export async function addTodo(todo) {
  const resp = await fetch(`/todo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ todo }),
  });
  if (!resp.ok) throw resp;
  return resp.json();
}

export async function updateTodo(todo) {
  const resp = await fetch(`/todo/${todo.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ todo }),
  });
  if (!resp.ok) throw resp;
}

export async function deleteTodo(todoId) {
  const resp = await fetch(`/todo/${todoId}`, {
    method: 'DELETE',
  });
  if (!resp.ok) throw resp;
}
```

### After

```ts
import ky from 'ky';
export async function getTodos() {
    const resp = await ky.get(`/todos`);
    return resp.json();
}

export async function addTodo(todo) {
    const resp = await ky.post(`/todo`, {
        json: { todo },
    });
    return resp.json();
}

export async function updateTodo(todo) {
    const resp = await ky.put(`/todo/${todo.id}`, {
        json: { todo },
    });
}

export async function deleteTodo(todoId) {
    const resp = await ky.delete(`/todo/${todoId}`);
}

```

This  codemod streamlines your existing fetch functions by converting them to use `ky`, eliminating unnecessary code, and making your HTTP requests more readable and maintainable.