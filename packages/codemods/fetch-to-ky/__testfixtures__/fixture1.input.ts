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