export const fetchCache = 'default-cache';
export default async function fetchNotifications() {
  const notification1 = await fetch('https://notifications.example.com');
  const notification2 = await fetch('https://notifications.example.com', {
    cache: 'no-cache',
  });

  // ...
}