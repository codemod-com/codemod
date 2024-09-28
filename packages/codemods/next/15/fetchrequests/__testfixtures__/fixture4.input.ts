export default async function fetchProducts() {
  const product1 = await fetch('https://products.example.com');
  const product2 = await fetch('https://products.example.com', {
    cache: 'force-cache',
  });

  // ...
}