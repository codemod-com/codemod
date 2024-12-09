export default async function fetchComments() {
  const comment1 = await fetch('https://comments.example.com');
  const comment2 = await fetch('https://comments.example.com', {
    cache: 'no-store',
  });

  // ...
}