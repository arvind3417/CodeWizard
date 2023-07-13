import { NextFunction, Request, Response } from "express";
import { jwtUtils } from "../helpers";
// import { authenticateToken } from "./authToken";
import * as CustomError from "../errors";
export const adminMiddleware = async (
    _req: Request,
    _res: Response,
    _next: NextFunction
  ) => {
    if ((<any>_req).user && (<any>_req).user.isAdmin === true) {
        _next();
      } else {
        _next(new CustomError.ForbiddenError("Unauthorized access"));
      }
  };


