export default async function fetchInvoices() {
  const invoice1 = await fetch('https://invoices.example.com');
  const invoice2 = await fetch('https://invoices.example.com', {
    cache: 'only-if-cached',
  });

  // ...
}