import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [50, 'Title cannot exceed 50 characters'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [1, 'Amount cannot be less than 1'],
            max: [Number.MAX_SAFE_INTEGER, 'Amount cannot be greater than MAX_SAFE_INTEGER'],
        },
        source: {
            type: String,
            enum: {
                values: ['Salary', 'Freelance', "Investment", "Gifts", "Others"],
                message: '{VALUE} is not a supported source',
            },
            required: [true, 'Source is required'],
        },
        description: {
            type: String,
        },
        incomeDate: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true, // Automatically manages createdAt and updatedAt
    }
);

const Incomes = mongoose.model('Income', incomeSchema);

export default Incomes;
