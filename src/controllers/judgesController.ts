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




  
  const getAggregation: any[] = [
    {
      $project: {
        __v: 0,
      },
    },
  ]
  
  const endpoint = "https://deb0f0cf.problems.sphere-engine.com/api/v4/judges";
  const accessToken = process.env.ACCESS_TOKEN;
  
  // Function to retrieve all problems
  async function getAllProblems() {
    // const url = `${endpoint}/${id}/testcases?access_token=${accessToken}`;
    const url = `${endpoint}?access_token=${accessToken}`;

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
const url = 'https://deb0f0cf.problems.sphere-engine.com/api/v4/judges?access_token=6e966f12397860808004472c2a74bf55&'
    // const url = `${endpoint}?access_token=${accessToken}`;
    const response = await axios.post(url, problemData);
    return response.data;
  }
  
  // Function to update a problem by ID
  async function updateProblem(Id, problemData) {
    const id = parseInt(Id, 10);
    const url = `${endpoint}/${id}?access_token=${accessToken}`;
  
    // const url = `${endpoint}/${id}/testcases/${number}?access_token=${accessToken}`;
    const response = await axios.put(url, problemData);
    return response.data;
  }
  
  
  export const getjudges = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      try {
       
  
 
     const getall =  await getAllProblems();
  
      if (!getall) {
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
              getall
            )
          );
      }
      }  catch (error: any) {
        _next(new CustomError.BadRequestError(error.message));
      }
   
    }
  );
  
  export const getjudge = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
   try {
  
  
   const question =  await getProblemById(_req.params.id);
  //  const pipeline = [
  //   { $match: { ID: (_req.params.id) } },
  //   {
  //     $project: {
  //       testCases: {
  //         $filter: {
  //           input: '$testCases',
  //           as: 'testCase',
  //           cond: {
  //             $eq: ['$$testCase._id', (_req.params.number)],
  //           },
  //         },
  //       },
  //     },
  //   },
  // ];
  // const result = await Question.aggregate(pipeline);

  
  if ( !question)
    return _next(
      new CustomError.NotFoundError(`${Question.modelName} not found`)
    );
  _res
    .status(StatusCodes.OK)
    .json(
      httpResponse(
        true,
        `${Question.modelName} retrieved successfully`,
        question
      )
    );
   }  catch (error: any) {
    _next(new CustomError.BadRequestError(error.message));
  }
    }
  );
  
  export const postjudge = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      try {
    
         const created =   await createProblem(_req.body);
    
        if (!created ) {
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
                created
              )
            );
        }
      } catch (error: any) {
        _next(new CustomError.BadRequestError(error.message));
      }
    }
  );
  
  export const patchjudge = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      let updatedDocument: any;
      try {
       
        const updated = await updateProblem(_req.params.id,_req.body);
   
          
 
        // const updatedTestCase = {
        //     input: _req.body.input,
        //     expectedOutput: _req.body.output,
        //   };
        // const result = await Question.findOneAndUpdate(
        //     { ID: _req.params.id, 'testCases.number': _req.params.number },
        //     { $set: { 'testCases.$': updatedTestCase } },
        //     { new: true }
        //   );
        if (!updated ) {
          _next(new CustomError.NotFoundError(`${Question.modelName} not found`));
        } else {
          _res
            .status(StatusCodes.OK)
            .json(
              httpResponse(
                true,
                `${Question.modelName} updated successfully`,
                updated
              )
            );
        }
      } catch (error: any) {
        return _next(new CustomError.BadRequestError(error.message));
      }
  
    }
  );
  
