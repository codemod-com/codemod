let query = buildQuery(props.location?.search ?? '');
import { z } from 'zod';
let querySchema = z.object({ 'some-param': z.string() });
let parsedQuery = querySchema.parse(query);
let someParam = parsedQuery['some-param'] === 'true';
