import { z } from 'zod';
const querySchema = z.object({
  'customize-site-name': z.string(),

  
});
const query = buildQuery(props.location?.search ?? '');
const parsedQuery = querySchema.parse(query);
const openCustomizeSiteName = parsedQuery['customize-site-name'] === 'true';
