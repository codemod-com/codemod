export default async function fetchPayments() {
  const payment1 = await fetch('https://payments.example.com');
  const payment2 = await fetch('https://payments.example.com', {
    cache: 'no-cache',
  });

  // ...
}