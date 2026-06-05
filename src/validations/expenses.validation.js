import { z } from 'zod';

// Schema for creating a new Expense (POST /api/v1/user-expenses/create)
export const userExpenses = {
    body: z.object({
        title: z
            .string({ required_error: 'Title is required' })
            .min(2, { message: 'Title must be at least 2 characters long' })
            .max(50, { message: 'Title must not exceed 50 characters' }),
        amount: z
            .number({ required_error: 'Amount is required' })
            .min(1, "Amount must be greater than 0")
            .max(Number.MAX_SAFE_INTEGER, "Amount must be less than MAX_SAFE_INTEGER"),
        category: z.enum(['Food', 'Travel', "Shopping", "Bills", "Entertainment", "Medical", "Education", "Others"], { required_error: 'Category is required' }),
        description: z.string().optional(),
        paymentMethod: z.enum(['UPI', 'Debit Card', "Credit Card"]).optional(),
        expenseDate: z.coerce.date().optional(),
        receiptUrl: z.string().optional()
    }),
};

// Schema for fetching paginated expenses list (GET /api/v1/user-expenses/list)
export const getUserExpenses = {
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
