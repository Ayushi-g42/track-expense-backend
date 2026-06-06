import { z } from 'zod';

export const userIncomes = {
    body: z.object({
        title: z
            .string({ required_error: 'Title is required' })
            .min(2, { message: 'Title must be at least 2 characters long' })
            .max(50, { message: 'Title must not exceed 50 characters' }),
        amount: z
            .number({ required_error: 'Amount is required' })
            .min(1, "Amount must be greater than 0")
            .max(Number.MAX_SAFE_INTEGER, "Amount must be less than MAX_SAFE_INTEGER"),
        source: z.enum(['Salary', 'Freelance', "Investment", "Gifts", "Others"], { required_error: 'Source is required' }),
        description: z.string().optional(),
        incomeDate: z.coerce.date().optional(),
    }),
};

export const getUserIncomesList = {
    query: z.object({
        page: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1))
            .pipe(z.number().int().positive().default(1)),
        limit: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 10))
            .pipe(z.number().int().positive().default(10)),
    }),
};
