import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { genAccessToken, genRefreshToken } from "../helpers/jwt";
import { hashPassword, hashCompare } from "../helpers/hashPassword";

import { User } from "../models/users";
import * as CustomErrors from "../errors";
import asyncWrapper from "../helpers/asyncWrapper";
import { httpResponse } from "../helpers";

export const loginController = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    const { email, password } = _req.body;
    if (!email || !password)
      return _next(
        new CustomErrors.BadRequestError("Please provide email and password")
      );

    const user = await User.findOne({ email: email });
    if (!user)
      return _next(
        new CustomErrors.NotFoundError("Invalid email or user does not exist")
      );

    if (!user.password)
      return _next(
        new CustomErrors.InternalServerError(
          "User password not found in the database"
        )
      );

    // passwords match, return access token and refresh token
    if (hashCompare(password, user.password)) {
      const accessToken = genAccessToken(user);
      const refreshToken = genRefreshToken(user);
      _res.status(StatusCodes.OK).json(
        httpResponse(true, "User logged in successfully", {
          accessToken,
          refreshToken,
        })
      );
    } else {
      // passwords do not match
      return _next(new CustomErrors.UnauthorizedError("Invalid password"));
    }
  }
);

export const registerController = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    if (
    //   !_req.body.firstname ||
      !_req.body.name ||
      !_req.body.email ||
      !_req.body.password
    )
      return _next(
        new CustomErrors.BadRequestError("Please provide all required fields")
      );

    let user = await User.findOne({
      email: _req.body.email,
    });
    if (user)
      return _next(new CustomErrors.BadRequestError("User already exists"));
    else {
      try {
        const hashedPassword = hashPassword(_req.body.password);
        user = await User.create({ ..._req.body, password: hashedPassword });
      } catch (err: any) {
        return _next(
          new CustomErrors.BadRequestError("Invalid user data " + err.message)
        );
      }
      const accessToken = genAccessToken(user);
      const refreshToken = genRefreshToken(user);
      _res.status(StatusCodes.CREATED).json(
        httpResponse(true, "User created successfully", {
          accessToken,
          refreshToken,
        })
      );
    }
  }
);
