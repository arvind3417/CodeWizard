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

const FIELDS = [
  { name: "name", validator: validators.isString, required: true },
  { name: "body", validator: validators.isString, required: true },
  // {name:"id", validator: validators.isNumber}

];

const getAggregation: any[] = [
  {
    $project: {
      __v: 0,
    },
  },
]

const endpoint = "https://deb0f0cf.problems.sphere-engine.com/api/v4/problems";
const accessToken = "6e966f12397860808004472c2a74bf55";

// Function to retrieve all problems
async function getAllProblems() {
  const url = `${endpoint}?access_token=${accessToken}`;
  const response = await axios.get(url);
  return response.data;
}
async function getProblemById(id) {
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

// Function to update a problem by ID
async function updateProblem(Id, problemData) {
  const id = parseInt(Id, 10);

  const url = `${endpoint}/${id}?access_token=${accessToken}`;
  const response = await axios.put(url, problemData);
  return response.data;
}

// Function to delete a problem by ID
async function deleteProblem(Id) {
  const id = parseInt(Id, 10);
  console.log('====================================');
  console.log("deleting");
  console.log('====================================');

  const url = `${endpoint}/${id}?access_token=${accessToken}`;
  const response = await axios.delete(url);
  return "Deleted";
}

export const getQuestions = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    try {
     

    const page = _req.query.PNO ? parseInt(_req.query.PNO as string) : 1;
    const skip = (page - 1) * 5;
   const getall =  await getAllProblems();
    const documents = await Question.aggregate([
      // {
      //   $skip: skip,
      // },
      // {
      //   $limit: 5,
      // },
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

export const getQuestion = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
 try {


 const question =  await getProblemById(_req.params.id);
const documents = await Question.aggregate([
  {
    $match: {
      ID:(_req.params.id),
    },
  },
  ...getAggregation,
]);

if (!documents || !question)
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

export const postQuestion = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    try {
  
       const created =   await createProblem(_req.body);
       const questionData = {
        name: _req.body.name,
        body: _req.body.name,
        ID: created.id, // Store the generated ID in the ID field
      };
      const documents = await Question.create(questionData);
      if (!documents || !created) {
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

export const patchQuestion = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    let updatedDocument: any;
    try {
     
      // updatedDocument = normalizeModel(_req.body, FIELDS, true);
      const updated = await updateProblem(_req.params.id,_req.body);

      const documents = await Question.findOneAndUpdate(
        {
          ID:(_req.params.id),
        },
        [
          {
            $set: _req.body,
          },
          {
            $project: {
              __v: 0,
            },
          },
        ],
        {
          new: true,
        }
      );
      if (!documents ) {
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

export const deleteQuestion = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    try {
      const deleted =  await deleteProblem(_req.params.id);
  
      const document = await Question.findOneAndDelete({
        ID: (_req.params.id),
      });
      if (!document ) {
        _next(new CustomError.NotFoundError(`${Question.modelName} not found`));
      } else {
        _res
          .status(StatusCodes.NO_CONTENT)
          .json(
            httpResponse(
              true,
              `${Question.modelName} deleted successfully`,
              deleted
            )
          );
      }
    } catch (error:any) {
      return _next(new CustomError.BadRequestError(error.message));
      
    }
 
  }
);