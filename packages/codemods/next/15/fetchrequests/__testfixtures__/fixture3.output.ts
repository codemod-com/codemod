export const fetchCache = 'default-cache';
export default async function fetchOrders() {
  const order1 = await fetch('https://orders.example.com');
  const order2 = await fetch('https://orders.example.com', {
    cache: 'reload',
  });

  // ...
}