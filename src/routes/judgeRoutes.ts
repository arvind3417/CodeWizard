import express from "express";

import { authenticateToken } from "../middleware/authToken";
import {
    getjudge,getjudges,patchjudge,postjudge
//  deleteQuestion,getQuestion,getQuestions, patchQuestion,postQuestion
} from "../controllers/judgesController";
import { adminMiddleware } from "../middleware/isAdmin";

export const judgeRouter = express.Router();



judgeRouter.route("/judge").get(authenticateToken,adminMiddleware,getjudges).post(authenticateToken,adminMiddleware,postjudge);
judgeRouter.route("/judge/:id").get(authenticateToken,adminMiddleware,getjudge).patch(authenticateToken,adminMiddleware,patchjudge);

