import { z } from 'zod';

export const booleanQuery = z.preprocess((value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
}, z.boolean());

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
});
