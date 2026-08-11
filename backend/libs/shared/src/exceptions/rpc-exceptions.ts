import { RpcException } from '@nestjs/microservices';

export class RpcUnauthorizedException extends RpcException {
  constructor(message: string = 'Unauthorized') {
    super({ statusCode: 401, message });
  }
}

export class RpcForbiddenException extends RpcException {
  constructor(message: string = 'Forbidden') {
    super({ statusCode: 403, message });
  }
}

export class RpcBadRequestException extends RpcException {
  constructor(message: string = 'Bad Request') {
    super({ statusCode: 400, message });
  }
}
