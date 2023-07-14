import express from "express";

import { authenticateToken } from "../middleware/authToken";
import {
    getsubmission,getsubmissions,postsubmission
} from "../controllers/submissionController";
import { adminMiddleware } from "../middleware/isAdmin";

export const submissionRouter = express.Router();



submissionRouter.route("/submission").get(authenticateToken,getsubmissions).post(authenticateToken,postsubmission);
submissionRouter.route("/submission/:id").get(authenticateToken,getsubmission);

