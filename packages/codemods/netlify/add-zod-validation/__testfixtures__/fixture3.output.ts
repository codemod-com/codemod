import { z } from 'zod';
  const querySchema = z.object({
   search: z.string(),
   page: z.string(), 
  })
const query = buildQuery(ownProps.location.search);
const parsedQuery = querySchema.parse(query);
const {search, page} = parsedQuery