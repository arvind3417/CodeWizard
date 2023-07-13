import express from "express";

import { authenticateToken } from "../middleware/authToken";
import {
 deleteQuestion,getQuestion,getQuestions, patchQuestion,postQuestion
} from "../controllers/questionController";
import { adminMiddleware } from "../middleware/isAdmin";

export const quesRouter = express.Router();



quesRouter.route("/Question").get(getQuestions).post(authenticateToken,adminMiddleware,postQuestion);
quesRouter.route("/Question/:id").get(authenticateToken,getQuestion).patch(authenticateToken,adminMiddleware,patchQuestion).delete(authenticateToken,adminMiddleware,deleteQuestion);

