import express from "express";

import { authenticateToken } from "../middleware/authToken";
import {
  getUserInfo,
  patchUser,
  deleteUser,
  resetPassword
} from "../controllers/userController";

export const userRouter = express.Router();


userRouter
  .route("/personInfo")
  .get(authenticateToken, getUserInfo)
  .patch(authenticateToken, patchUser)
  .delete(authenticateToken, deleteUser);
userRouter.route("/reset_password").patch(authenticateToken, resetPassword);
