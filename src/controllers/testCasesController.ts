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
  
  const endpoint = "https://deb0f0cf.problems.sphere-engine.com/api/v4/problems";
  const accessToken = process.env.accessToken;

  
  // Function to retrieve all problems
  async function getAllProblems(id) {
    const url = `${endpoint}/${id}/testcases?access_token=${accessToken}`;
    const response = await axios.get(url);
    return response.data;
  }
  async function getProblemById(id,number) {
    const url = `${endpoint}/${id}/testcases/${number}?access_token=${accessToken}`;
    const response = await axios.get(url);
    return response.data;
  }
  
  // Function to create a new problem
  async function createProblem(Id,problemData) {
    const id = parseInt(Id, 10);

    const url = `${endpoint}/${id}/testcases?access_token=${accessToken}`;
    const response = await axios.post(url, problemData);
    return response.data;
  }
  
  // Function to update a problem by ID
  async function updateProblem(Id, problemData,number) {
    const id = parseInt(Id, 10);
  
    const url = `${endpoint}/${id}/testcases/${number}?access_token=${accessToken}`;
    const response = await axios.put(url, problemData);
    return response.data;
  }
  
  
  export const gettestcases = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      try {
       
  
      const page = _req.query.PNO ? parseInt(_req.query.PNO as string) : 1;
      const skip = (page - 1) * 5;
     const getall =  await getAllProblems(_req.params.id);
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
  
  export const gettestcase = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
   try {
  
  
   const question =  await getProblemById(_req.params.id,_req.params.number);
   const pipeline = [
    { $match: { ID: (_req.params.id) } },
    {
      $project: {
        testCases: {
          $filter: {
            input: '$testCases',
            as: 'testCase',
            cond: {
              $eq: ['$$testCase._id', (_req.params.number)],
            },
          },
        },
      },
    },
  ];
  const result = await Question.aggregate(pipeline);

  
  if (!result || !question)
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
  
  export const posttestcase = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      try {
    
         const created =   await createProblem(_req.params.id,_req.body);
        const newTestCase = {
            number: created.number,
            input: _req.body.input,
            expectedOutput: _req.body.output,
          };
          const result = await Question.findOneAndUpdate(
            { ID: _req.params.id },
            { $push: { testCases: newTestCase } },
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
  
  export const patchtestcase = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      let updatedDocument: any;
      try {
       
        const updated = await updateProblem(_req.params.id,_req.body,_req.params.number);
   
          
 
        const updatedTestCase = {
            input: _req.body.input,
            expectedOutput: _req.body.output,
          };
        const result = await Question.findOneAndUpdate(
            { ID: _req.params.id, 'testCases.number': _req.params.number },
            { $set: { 'testCases.$': updatedTestCase } },
            { new: true }
          );
        if (!result ) {
          _next(new CustomError.NotFoundError(`${Question.modelName} not found`));
        } else {
          _res
            .status(StatusCodes.OK)
            .json(
              httpResponse(
                true,
                `${Question.modelName} updated successfully`,
                result
              )
            );
        }
      } catch (error: any) {
        return _next(new CustomError.BadRequestError(error.message));
      }
  
    }
  );
  
