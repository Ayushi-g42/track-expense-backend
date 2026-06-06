import Incomes from '../models/income.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createUserIncome = asyncHandler(async (req, res) => {
    const {
        title,
        amount,
        source,
        description,
        incomeDate,
    } = req.body;

    // Get the user ID from the authMiddleware
    const userId = req.user._id;

    // Create income
    const income = await Incomes.create({
        userId,
        title,
        amount,
        source,
        description,
        incomeDate,
    });

    const createdIncome = income.toObject();

    res.status(201).json(new ApiResponse(201, createdIncome, 'User Income Saved Successfully'));
});


export const getUserIncomes = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };

    // Fetch incomes and count total matching records
    const incomes = await Incomes.find(filter).sort({ incomeDate: -1 }).skip(skip).limit(parseInt(limit));

    const totalItems = await Incomes.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const results = {
        incomes,
        pagination: {
            totalItems,
            totalPages,
            currentPage: parseInt(page),
            limit: parseInt(limit),
        },
    };

    res.status(200).json(new ApiResponse(200, results, 'Incomes retrieved successfully'));
});

export const updateUserIncome = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const income = await Incomes.findOneAndUpdate(
        { _id: id, userId }, // Security Check: Must belong to user
        { ...req.body },
        { new: true, runValidators: true }
    );

    if (!income) {
        throw new ApiError(404, 'Income not found or you are not authorized to update it');
    }

    const updatedIncome = income.toObject();

    res.status(200).json(new ApiResponse(200, updatedIncome, 'Income updated successfully'));
});

export const deleteUserIncome = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    // findOneAndDelete removes the document and returns it so we know it existed
    const deletedIncome = await Incomes.findOneAndDelete({ _id: id, userId });

    if (!deletedIncome) {
        throw new ApiError(404, 'Income not found or you are not authorized to delete it');
    }

    res.status(200).json(new ApiResponse(200, null, 'Income deleted successfully'));
});
