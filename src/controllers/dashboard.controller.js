import Expenses from '../models/expense.model.js';
import Incomes from '../models/income.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboardSummary = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Aggregate total expenses
    const expenseAggregation = await Expenses.aggregate([
        { $match: { userId } },
        { $group: { _id: null, totalExpense: { $sum: "$amount" } } }
    ]);
    const totalExpense = expenseAggregation.length > 0 ? expenseAggregation[0].totalExpense : 0;

    // Aggregate total incomes
    const incomeAggregation = await Incomes.aggregate([
        { $match: { userId } },
        { $group: { _id: null, totalIncome: { $sum: "$amount" } } }
    ]);
    const totalIncome = incomeAggregation.length > 0 ? incomeAggregation[0].totalIncome : 0;

    const totalBalance = totalIncome - totalExpense;
    const savings = totalIncome - totalExpense; // Currently treating savings as remaining balance

    const results = {
        totalIncome,
        totalExpense,
        totalBalance,
        savings
    };

    res.status(200).json(new ApiResponse(200, results, 'Dashboard summary retrieved successfully'));
});
