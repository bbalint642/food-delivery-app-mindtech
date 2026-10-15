import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../../generated/prisma/client';

/**
 * Translates known Prisma errors into meaningful HTTP responses, so
 * database constraint violations never leak as generic 500 errors.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter<Prisma.PrismaClientKnownRequestError>
{
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    super.catch(this.toHttpException(exception), host);
  }

  private toHttpException(
    exception: Prisma.PrismaClientKnownRequestError,
  ): HttpException {
    switch (exception.code) {
      // Unique constraint failed
      case 'P2002':
        return new ConflictException('Resource already exists');
      // Record required for the operation was not found
      case 'P2025':
        return new NotFoundException('Resource not found');
      default:
        this.logger.error(
          `Unhandled Prisma error ${exception.code}`,
          exception.stack,
        );
        return new InternalServerErrorException();
    }
  }
}
