import {
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { GenericThrow } from './errors/GenericThrow';
import { Prisma } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';

export class HttpExceptionFilter implements ExceptionFilter {
  handlerStatusCode(exception: HttpException) {
    let statusCode: HttpStatus;
    switch (true) {
      case exception instanceof ResourceNotFoundError:
        statusCode = HttpStatus.BAD_REQUEST;
        break;

      case exception instanceof GenericThrow:
        statusCode = HttpStatus.BAD_REQUEST;
        break;

      case exception instanceof Prisma.PrismaClientKnownRequestError:
      case exception instanceof Prisma.PrismaClientUnknownRequestError:
      case exception instanceof Prisma.PrismaClientValidationError:
      case exception instanceof Prisma.PrismaClientInitializationError:
        statusCode = HttpStatus.BAD_REQUEST;
        break;

      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        break;
    }

    return statusCode;
  }
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const httpStatus = this.handlerStatusCode(exception);

    switch (true) {
      case exception instanceof ResourceNotFoundError:
        response.status(httpStatus).json({
          message: exception.message,
          path: request.url,
        });
        break;

      case exception instanceof GenericThrow:
        response.status(httpStatus).json({
          message: exception.message,
          path: request.url,
        });
        break;

      case exception instanceof Prisma.PrismaClientKnownRequestError:
      case exception instanceof Prisma.PrismaClientUnknownRequestError:
      case exception instanceof Prisma.PrismaClientValidationError:
      case exception instanceof Prisma.PrismaClientInitializationError:
        response.status(httpStatus).json({
          message: exception.message,
        });
        break;

      default:
        response.status(httpStatus).json({
          message: exception.message,
        });
        break;
    }
  }
}
