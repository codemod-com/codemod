export const fetchCache = 'default-cache';
export default async function fetchTasks() {
  const task1 = await fetch('https://tasks.example.com');
  const task2 = await fetch('https://tasks.example.com', {
    cache: 'force-cache',
  });

  // ...
}