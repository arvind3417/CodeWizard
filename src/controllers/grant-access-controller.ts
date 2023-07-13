

import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import * as CustomErrors from "../errors";
import { httpResponse } from "../helpers";
import { User } from "../models/users";
import asyncWrapper from "../helpers/asyncWrapper";
// export const grantAdminAccess = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // const requestingUserId = (<any>req).user.id;
//     const { userId } = req.params; // Assuming the admin provides the user ID to grant admin access

//     // Check if the requesting user is an admin
//     // const requestingUser = await User.findById(requestingUserId);
//     // if (!requestingUser.isAdmin) {
//     //   return res.status(403).json({ error: "Only admins can grant admin access." });
//     // }

//     // Update the user's admin status
//     const userToUpdate = await User.findById(userId);
//     if (!userToUpdate) {
//     //   return res.status(404).json({ error: "User not found." });
    
//     }

//     userToUpdate.isAdmin = true;
//     await userToUpdate.save();

//     res.json({ message: "Admin access granted successfully." });
//   } catch (error) {
//     next(error);
//   }
// };



export const grantAdminAccess = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
        try {
          
            const { userId } = _req.params; // Assuming the admin provides the user ID to grant admin access
    
        
            // Update the user's admin status
            const userToUpdate = await User.findById(userId);
            console.log('====================================');
            console.log(userToUpdate);
            console.log('====================================');
            if (!userToUpdate) {
     return _next(new CustomErrors.BadRequestError("User not found"));
            }
            if(userToUpdate.isAdmin === true)  return _next(new CustomErrors.BadRequestError("User is already a admin"));
            userToUpdate.isAdmin = true;
            await userToUpdate.save();
        
            _res.json({ message: "Admin access granted successfully." });
          } catch (error:any) {
      return _next(new CustomErrors.InternalServerError(error.message));
          }
    }
  );
  