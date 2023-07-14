import * as validators from "../helpers/validators";
import {Question} from "../models/question";
import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import * as CustomError from "../errors";
import { httpResponse } from "../helpers";
import normalizeModel from "../helpers/normalizer";
import asyncWrapper from "../helpers/asyncWrapper";
import axios from "axios";
import { log } from "console";
import { User } from "../models/users";




  
  const getAggregation: any[] = [
    {
      $project: {
        __v: 0,
      },
    },
  ]
  
  const endpoint = "https://deb0f0cf.problems.sphere-engine.com/api/v4/submissions"; 
//    const accessToken = process.env.accessToken;
const accessToken = process.env.ACCESS_TOKEN;


  
  // Function to retrieve all problems
  async function getAllProblems(ids) {
    // const url = `${endpoint}/${id}/testcases?access_token=${accessToken}`;
    const url = `${endpoint}/ids=${ids}?access_token=${accessToken}`;

    const response = await axios.get(url);
    return response.data;
  }
  async function getProblemById(id) {
    // const url = `${endpoint}/${id}/testcases/${number}?access_token=${accessToken}`;
    const url = `${endpoint}/${id}?access_token=${accessToken}`;

    const response = await axios.get(url);
    return response.data;
  }
  
  // Function to create a new problem
  async function createProblem(problemData) {

    const url = `${endpoint}?access_token=${accessToken}`;
    const response = await axios.post(url, problemData);
    return response.data;
  }


  
  export const getsubmissions = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      try {
       
  
      const page = _req.query.PNO ? parseInt(_req.query.PNO as string) : 1;
      const skip = (page - 1) * 5;
     const getall =  await getAllProblems(_req.query.ids);
      const documents = await Question.aggregate([
        {
          $skip: skip,
        },
        {
          $limit: 5,
        },
        ...getAggregation,
      ]);
      if (!documents || !getall) {
        _next(
          new CustomError.NotFoundError(
            `No ${Question.modelName.toLowerCase()} found`
          )
        );
      } else {
        _res
          .status(StatusCodes.OK)
          .json(
            httpResponse(
              true,
              `${Question.modelName} retrieved successfully`,
              documents
            )
          );
      }
      }  catch (error: any) {
        _next(new CustomError.BadRequestError(error.message));
      }
   
    }
  );
  
  export const getsubmission = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      try {
        const question = await getProblemById(_req.params.id);

const updatedQuestion = await Question.findOneAndUpdate(
    { ID: question.problem.id, 'submissions.ID': _req.params.id },
    { $set: { 'submissions.$.problemStatus': question.result.status.name } },
    { new: true }
  );
//   console.log(result[0].submissions[0].problemStatus);
  
        if (!updatedQuestion || !question)
          return _next(
            new CustomError.NotFoundError(`${Question.modelName} not found`)
          );

  
     
  
        _res
          .status(StatusCodes.OK)
          .json(
            httpResponse(
              true,
              `${Question.modelName} retrieved successfully`,
              updatedQuestion
            )
          );
      } catch (error: any) {
        _next(new CustomError.BadRequestError(error.message));
      }
    }
  );
  
  
  export const postsubmission = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      try {
    
         const created =   await createProblem(_req.body);
         const user = await User.findByIdAndUpdate(
            (<any>_req).user.userId,
            { $push: { problems: _req.body.problemId } },
            { new: true }
          );
          console.log(user);
          
    
          if (!user) {
            _next(
              new CustomError.NotFoundError(`Could not find user with ID ${(<any>_req).user.userId}`)
            );}
          const result = await Question.findOneAndUpdate(
            { ID: _req.body.problemId },
            { $push: { submissions: {
                ID: created.id,
                problemStatus : "not solved"
            } } },
            { new: true }
          );
                
        if (!result ) {
          _next(
            new CustomError.NotFoundError(`Could not create ${Question.modelName}`)
          );
        } else {
          _res
            .status(StatusCodes.CREATED)
            .json(
              httpResponse(
                true,
                `${Question.modelName} created successfully`,
                result
              )
            );
        }
      } catch (error: any) {
        _next(new CustomError.BadRequestError(error.message));
      }
    }
  );
  
