import ky from "ky";
export async function getTodos() {
  const resp = await ky.get(`/todos`);
  return resp.json();
}

export async function addTodo(todo) {
  const resp = await ky.post(`/todo`, {
    json: { todo }
  });
  return resp.json();
}

export async function updateTodo(todo) {
  const resp = await ky.put(`/todo/${todo.id}`, {
    json: { todo }
  });
}

export async function deleteTodo(todoId) {
  const resp = await ky.delete(`/todo/${todoId}`);
}