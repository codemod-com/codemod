const query = buildQuery(props.location?.search ?? '');
import { z } from 'zod';const querySchema = z.object({  'some-param': z.string(),});const parsedQuery = querySchema.parse(query);const someParam = parsedQuery['some-param'] === 'true';
