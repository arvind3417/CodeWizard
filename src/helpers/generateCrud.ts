import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import * as CustomError from "../errors";
import { httpResponse } from "../helpers";
import normalizeModel, { FieldType } from "../helpers/normalizer";
import asyncWrapper from "../helpers/asyncWrapper";

const generateCrud = (
  model: mongoose.Model<any>,
  FIELDS: FieldType[],
  getAggregation: any[] = [
    {
      $project: {
        __v: 0,
      },
    },
  ],
  perPage: number = 5
) => {
  const getAllMethod = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      if (_req.query.PNO && !/^\d+$/.test(_req.query.PNO as string))
        return _next(
          new CustomError.BadRequestError(
            "Invalid page number. Page number must be a valid integer"
          )
        );

      const page = _req.query.PNO ? parseInt(_req.query.PNO as string) : 1;
      const skip = (page - 1) * perPage;

      const documents = await model.aggregate([
        {
          $skip: skip,
        },
        {
          $limit: perPage,
        },
        ...getAggregation,
      ]);
      if (!documents || documents.length === 0) {
        _next(
          new CustomError.NotFoundError(
            `No ${model.modelName.toLowerCase()} found`
          )
        );
      } else {
        _res
          .status(StatusCodes.OK)
          .json(
            httpResponse(
              true,
              `${model.modelName} retrieved successfully`,
              documents
            )
          );
      }
    }
  );

  const getByIdMethod = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      if (!mongoose.Types.ObjectId.isValid(_req.params.id))
        return _next(
          new CustomError.BadRequestError(
            `Invalid ${model.modelName.toLowerCase()} id`
          )
        );
      const documents = await model.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(_req.params.id),
          },
        },
        ...getAggregation,
      ]);

      if (!documents || documents.length === 0)
        return _next(
          new CustomError.NotFoundError(`${model.modelName} not found`)
        );
      _res
        .status(StatusCodes.OK)
        .json(
          httpResponse(
            true,
            `${model.modelName} retrieved successfully`,
            documents[0]
          )
        );
    }
  );

  const postMethod = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      try {
        const documents = await model.create(normalizeModel(_req.body, FIELDS));
        if (!documents) {
          _next(
            new CustomError.NotFoundError(`Could not create ${model.modelName}`)
          );
        } else {
          _res
            .status(StatusCodes.CREATED)
            .json(
              httpResponse(
                true,
                `${model.modelName} created successfully`,
                documents
              )
            );
        }
      } catch (error: any) {
        _next(new CustomError.BadRequestError(error.message));
      }
    }
  );

  const patchMethod = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      let updatedDocument: any;
      try {
        updatedDocument = normalizeModel(_req.body, FIELDS, true);
      } catch (error: any) {
        return _next(new CustomError.BadRequestError(error.message));
      }
      const documents = await model.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(_req.params.id),
        },
        [
          {
            $set: updatedDocument,
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
      if (!documents) {
        _next(new CustomError.NotFoundError(`${model.modelName} not found`));
      } else {
        _res
          .status(StatusCodes.OK)
          .json(
            httpResponse(
              true,
              `${model.modelName} updated successfully`,
              documents
            )
          );
      }
    }
  );

  const deleteMethod = asyncWrapper(
    async (_req: Request, _res: Response, _next: NextFunction) => {
      if (!mongoose.Types.ObjectId.isValid(_req.params.id))
        return _next(
          new CustomError.BadRequestError(
            `Invalid ${model.modelName.toLowerCase()} id`
          )
        );
      const document = await model.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(_req.params.id),
      });
      if (!document) {
        _next(new CustomError.NotFoundError(`${model.modelName} not found`));
      } else {
        _res
          .status(StatusCodes.NO_CONTENT)
          .json(
            httpResponse(
              true,
              `${model.modelName} deleted successfully`,
              document
            )
          );
      }
    }
  );

  return {
    getAllMethod,
    getByIdMethod,
    postMethod,
    patchMethod,
    deleteMethod,
  };
};

export default generateCrud;

