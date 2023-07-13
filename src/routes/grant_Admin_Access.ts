import express from "express";

import { authenticateToken } from "../middleware/authToken";
import {
 grantAdminAccess
} from "../controllers/grant-access-controller";
import { adminMiddleware } from "../middleware/isAdmin";

export const grantAdminAccessrouter = express.Router();


grantAdminAccessrouter
  .route("/admin-access/:userId")
  .post(authenticateToken,adminMiddleware, grantAdminAccess)

