import express from 'express';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUsers,
} from '../controllers/user.controller.js';
import validate from '../middleware/validate.middleware.js';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  createUser as createUserSchema,
  getUsers as getUsersSchema,
  getUser as getUserSchema,
  updateUser as updateUserSchema,
  deleteUser as deleteUserSchema,
  loginUser as loginUserSchema,
} from '../validations/user.validation.js';

const router = express.Router();

// Routes for resource by ID (e.g. /api/v1/users/:id)
router
  .route('/:id')
  .get(validate(getUserSchema), getUser)
  .patch(validate(updateUserSchema), updateUser)
  .delete(validate(deleteUserSchema), deleteUser);


// Routes for base path (e.g. /api/v1/users)
router
  .route('/register')
  .post(validate(createUserSchema), createUser);

router
  .route('/')
  .get(validate(getUsersSchema), authMiddleware, getUsers);

router
  .route('/login')
  .post(validate(loginUserSchema), loginUsers);

export default router;
