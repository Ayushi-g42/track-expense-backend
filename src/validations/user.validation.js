import { z } from 'zod';

// Helper validator for MongoDB Object IDs
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid MongoDB Object ID' });

// Schema for creating a new User (POST /api/v1/users)
export const createUser = {
  body: z.object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(50, { message: 'Name must not exceed 50 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    role: z.enum(['user', 'admin']).optional(),
  }),
};

// Schema for fetching paginated users list (GET /api/v1/users)
export const getUsers = {
  query: z.object({
    role: z.enum(['user', 'admin']).optional(),
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

// Schema for fetching a specific User (GET /api/v1/users/:id)
export const getUser = {
  params: z.object({
    id: objectId,
  }),
};

// Schema for updating a User (PATCH /api/v1/users/:id)
export const updateUser = {
  params: z.object({
    id: objectId,
  }),
  body: z
    .object({
      name: z
        .string()
        .min(2, { message: 'Name must be at least 2 characters long' })
        .max(50, { message: 'Name must not exceed 50 characters' })
        .optional(),
      email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
      password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters long' })
        .optional(),
      role: z.enum(['user', 'admin']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
};

// Schema for deleting a User (DELETE /api/v1/users/:id)
export const deleteUser = {
  params: z.object({
    id: objectId,
  }),
};

export const loginUser = {
  body: z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  }),
};