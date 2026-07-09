import { ZodError } from 'zod';
import { ERROR_CODES } from './error_codes.js';

export const validateSchema = (schema, payload) => {
    try {
        return { data: schema.parse(payload) };
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                error: {
                    code: ERROR_CODES.VALIDATION_FAILED,
                    details: error.issues.map((entry) => ({
                        path: entry.path.join('.'),
                        message: entry.message
                    }))
                }
            };
        }

        return { error: { code: ERROR_CODES.VALIDATION_FAILED } };
    }
};
