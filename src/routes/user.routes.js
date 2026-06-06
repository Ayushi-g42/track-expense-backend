import express from 'express';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUsers,
  updateUserProfile,
  uploadProfileImage,
} from '../controllers/user.controller.js';
import validate from '../middleware/validate.middleware.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';
import {
  createUser as createUserSchema,
  getUsers as getUsersSchema,
  getUser as getUserSchema,
  updateUser as updateUserSchema,
  deleteUser as deleteUserSchema,
  loginUser as loginUserSchema,
  updateUserProfileSchema,
} from '../validations/user.validation.js';

const router = express.Router();


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

router
  .route('/profile')
  .patch(validate(updateUserProfileSchema), authMiddleware, updateUserProfile);

router
  .route('/upload')
  .post(authMiddleware, upload.single('image'), uploadProfileImage);


export default router;
