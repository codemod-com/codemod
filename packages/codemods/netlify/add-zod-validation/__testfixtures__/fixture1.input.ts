const query = buildQuery(props.location?.search ?? '');
const openCustomizeSiteName = query?.['customize-site-name'] === 'true';
