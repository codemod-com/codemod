export const fetchCache = 'default-cache';
export default async function fetchSettings() {
  const setting1 = await fetch('https://settings.example.com');
  const setting2 = await fetch('https://settings.example.com', {
    cache: 'reload',
  });

  // ...
}