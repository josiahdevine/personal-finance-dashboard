import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export type ValidateRequestMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>;

export const validateRequest = (schema: AnyZodObject): ValidateRequestMiddleware => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors
                });
            } else {
                next(error);
            }
        }
    };
}; 