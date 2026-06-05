import Expenses from '../models/expense.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createUserExpense = asyncHandler(async (req, res) => {
    const {
        title,
        amount,
        category,
        description,
        paymentMethod,
        expenseDate,
        receiptUrl,
    } = req.body;

    // Get the user ID from the authMiddleware
    const userId = req.user._id;

    // Create expense
    const expense = await Expenses.create({
        userId,
        title,
        amount,
        category,
        description,
        paymentMethod,
        expenseDate,
        receiptUrl,
    });

    const createdExpense = expense.toObject();

    res.status(201).json(new ApiResponse(201, createdExpense, 'User Expenses Saved Successfully'));
});


export const getUserExpense = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;

    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };

    // Fetch expenses and count total matching records
    const expenses = await Expenses.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    const totalItems = await Expenses.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const results = {
        expenses,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
        },
    };

    res.status(200).json(new ApiResponse(200, results, 'Expenses retrieved successfully'));
});

export const updateUserExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const expense = await Expenses.findOneAndUpdate(
        { _id: id, userId }, // Security Check: Must belong to user
        { ...req.body },
        { new: true, runValidators: true }
    );

    if (!expense) {
        throw new ApiError(404, 'Expense not found or you are not authorized to update it');
    }

    const updatedExpense = expense.toObject();

    res.status(200).json(new ApiResponse(200, updatedExpense, 'Expense updated successfully'));
});

export const deleteUserExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    // findOneAndDelete removes the document and returns it so we know it existed
    const deletedExpense = await Expenses.findOneAndDelete({ _id: id, userId });

    if (!deletedExpense) {
        throw new ApiError(404, 'Expense not found or you are not authorized to delete it');
    }

    res.status(200).json(new ApiResponse(200, null, 'Expense deleted successfully'));
});

