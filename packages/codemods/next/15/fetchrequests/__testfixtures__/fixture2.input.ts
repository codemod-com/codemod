export default async function fetchUserData() {
  const user1 = await fetch('https://user.example.com');
  const user2 = await fetch('https://user.example.com', {
    cache: 'no-store',
  });

  // ...
}