import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
/**
 * Create a new user.
 * POST /api/v1/users
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Convert mongoose object to plane JS and delete password field (just in case)
  const createdUser = user.toObject();
  delete createdUser.password;

  res.status(201).json(new ApiResponse(201, createdUser, 'User registered successfully'));
});

/**
 * Get all users with filtering and pagination.
 * GET /api/v1/users
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { role, page, limit } = req.query;

  // Build query filter
  const filter = {};
  if (role) {
    filter.role = role;
  }

  const skip = (page - 1) * limit;

  // Fetch users and count total matching records
  const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

  const totalItems = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);

  const results = {
    users,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
    },
  };

  res.status(200).json(new ApiResponse(200, results, 'Users retrieved successfully'));
});

/**
 * Get user by unique ID.
 * GET /api/v1/users/:id
 */
export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, user, 'User retrieved successfully'));
});

/**
 * Update user fields.
 * PATCH /api/v1/users/:id
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check email conflict if user is updating email
  if (updates.email && updates.email !== user.email) {
    const emailConflict = await User.findOne({ email: updates.email });
    if (emailConflict) {
      throw new ApiError(409, 'Email address is already in use by another account');
    }
  }

  // Assign update fields dynamically
  Object.keys(updates).forEach((updateKey) => {
    user[updateKey] = updates[updateKey];
  });

  // Save triggers pre-save hooks (handles hashing of new password if modified)
  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.password;

  res.status(200).json(new ApiResponse(200, updatedUser, 'User updated successfully'));
});

/**
 * Delete a user.
 * DELETE /api/v1/users/:id
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
});


export const loginUsers = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email }).select('+password');
  if (!existingUser) {
    throw new ApiError(404, 'User Not Found');
  }

  const isPasswordValid = await existingUser.isPasswordMatch(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid Credentials');
  }

  //Generate JWT Token
  const token = jwt.sign(
    { _id: existingUser._id, email: existingUser.email }, 
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1d' }
  );

  // Convert mongoose object to plane JS and delete password field (just in case)
  const loggedInUser = existingUser.toObject();
  delete loggedInUser.password;

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(200)
    .cookie("accessToken", token, options)
    .json(new ApiResponse(200, { user: loggedInUser, token }, 'User logged in successfully'));
});
