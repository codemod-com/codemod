export default async function fetchReports() {
  const report1 = await fetch('https://reports.example.com');
  const report2 = await fetch('https://reports.example.com', {
    cache: 'no-store',
  });

  // ...
}