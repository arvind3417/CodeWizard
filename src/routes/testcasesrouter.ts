import express from "express";

import { authenticateToken } from "../middleware/authToken";
import {
 gettestcase,gettestcases,patchtestcase, posttestcase,
} from "../controllers/testCasesController";
import { adminMiddleware } from "../middleware/isAdmin";

export const testcasesRouter = express.Router();



testcasesRouter.route("/Question/:id/testcase").get(gettestcases).post(authenticateToken,adminMiddleware,posttestcase);
testcasesRouter.route("/Question/:id/testcase/:number").get(authenticateToken,gettestcase).patch(authenticateToken,adminMiddleware,patchtestcase);

