const query = buildQuery(props.location?.search ?? '');
const someParam = query?.['some-param'] === 'true';
