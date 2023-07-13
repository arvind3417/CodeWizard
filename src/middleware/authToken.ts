import { NextFunction, Request, Response } from "express";
import { jwtUtils } from "../helpers";

import * as CustomError from "../errors";

export const authenticateToken = async (
  _req: Request,
  _res: Response,
  _next: NextFunction
) => {
  const authHeader = _req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return _next(new CustomError.ForbiddenError("No token provided"));

  try {
    const decoded = jwtUtils.verifyAccessToken(token);
    (<any>_req).user = decoded;
    (<any>_req).access_token = token;
    _next();
  } catch (err: any) {
    _next(new CustomError.UnauthorizedError(err.message));
  }
};
