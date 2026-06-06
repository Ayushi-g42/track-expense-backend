import express from 'express';

import validate from '../middleware/validate.middleware.js';
import authMiddleware from '../middleware/auth.middleware.js';

import { userIncomes, getUserIncomesList } from '../validations/incomes.validation.js';
import { createUserIncome, deleteUserIncome, getUserIncomes, updateUserIncome } from '../controllers/incomes.controller.js';

const router = express.Router();

router
    .route('/create')
    .post(validate(userIncomes), authMiddleware, createUserIncome);

router
    .route('/list')
    .get(validate(getUserIncomesList), authMiddleware, getUserIncomes);

router
    .route('/update/:id')
    .patch(validate(userIncomes), authMiddleware, updateUserIncome);

router
    .route('/delete/:id')
    .delete(authMiddleware, deleteUserIncome);

export default router;
