export const fetchCache = 'default-cache';
export default async function fetchProfiles() {
  const profile1 = await fetch('https://profiles.example.com');
  const profile2 = await fetch('https://profiles.example.com', {
    cache: 'no-cache',
  });

  // ...
}