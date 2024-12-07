export default async function fetchMessages() {
  const message1 = await fetch('https://messages.example.com');
  const message2 = await fetch('https://messages.example.com', {
    cache: 'reload',
  });

  // ...
}