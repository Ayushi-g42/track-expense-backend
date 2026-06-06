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

    // Aggregate expense trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const expenseTrendRaw = await Expenses.aggregate([
        { 
            $match: { 
                userId,
                expenseDate: { $gte: sixMonthsAgo } 
            } 
        },
        {
            $group: {
                _id: { 
                    month: { $month: "$expenseDate" }, 
                    year: { $year: "$expenseDate" } 
                },
                total: { $sum: "$amount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Map month numbers to month names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const expenseTrend = expenseTrendRaw.map(item => ({
        month: `${monthNames[item._id.month - 1]}`,
        year: item._id.year,
        total: item.total
    }));

    // Aggregate category wise expenses (grouped by category, month, and year)
    const categoryWiseExpenseRaw = await Expenses.aggregate([
        { $match: { userId } },
        {
            $group: {
                _id: {
                    category: "$category",
                    month: { $month: "$expenseDate" },
                    year: { $year: "$expenseDate" }
                },
                total: { $sum: "$amount" }
            }
        },
        { $sort: { total: -1 } }
    ]);
    
    const categoryWiseExpense = categoryWiseExpenseRaw.map(item => ({
        category: item._id.category,
        month: item._id.month,
        year: item._id.year,
        total: item.total
    }));

    const results = {
        totalIncome,
        totalExpense,
        totalBalance,
        savings,
        expenseTrend,
        categoryWiseExpense
    };

    res.status(200).json(new ApiResponse(200, results, 'Dashboard summary retrieved successfully'));
});
