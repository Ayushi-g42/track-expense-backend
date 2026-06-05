import express from 'express';

import validate from '../middleware/validate.middleware.js';
import authMiddleware from '../middleware/auth.middleware.js';

import { userExpenses, getUserExpenses } from '../validations/expenses.validation.js';
import { createUserExpense, deleteUserExpense, getUserExpense, updateUserExpense } from '../controllers/expenses.controller.js';

const router = express.Router();


router
    .route('/create')
    .post(validate(userExpenses), authMiddleware, createUserExpense);

router
    .route('/list')
    .get(validate(getUserExpenses), authMiddleware, getUserExpense);

router
    .route('/update/:id')
    .patch(validate(userExpenses), authMiddleware, updateUserExpense);

router
    .route('/delete/:id')
    .delete(authMiddleware, deleteUserExpense);

export default router;
