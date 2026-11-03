import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { status as grpcStatus } from '@grpc/grpc-js';
import { GlobalExceptionFilter } from './global-exception.filter';

/**
 * Covers GlobalExceptionFilter — the one place every error in the system,
 * from every endpoint, gets turned into an HTTP response. Three real error
 * shapes converge here: Nest's own HttpExceptions (thrown directly in
 * gateway code, e.g. AuthProxyController.refresh()), a TCP microservice's
 * RpcException surfacing as a rejected ClientProxy call (identity, which
 * wraps its error in a nested `.response`), and a gRPC ServiceError (polls/
 * blockchain's ClientGrpc, which exposes a numeric `.code` + `.details`
 * instead of statusCode/message).
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access --
 * jest.Mock's `.mock.calls` is typed `any[][]`, so indexing into it to
 * inspect the exact response body is inherently `any` here — not a
 * production typing issue to fix.
 */
describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let res: { status: jest.Mock; json: jest.Mock };
  let host: ArgumentsHost;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    filter = new GlobalExceptionFilter();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const req = { url: '/api/polls/42', method: 'GET' };

    host = {
      switchToHttp: () => ({
        getResponse: () => res,
        getRequest: () => req,
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('passes a raw-string HttpException through buildBody, filling in timestamp/path/method', () => {
    filter.catch(
      new HttpException('Something went wrong', HttpStatus.BAD_REQUEST),
      host,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Something went wrong',
        error: 'HttpException',
        path: '/api/polls/42',
        method: 'GET',
      }),
    );
  });

  // Nest's own shorthand exceptions (BadRequestException, NotFoundException,
  // ...) already produce a {statusCode, message} body, which trips
  // isUpstreamError's check — meant for a genuinely proxied upstream error
  // that's already a complete ErrorResponse — and gets passed straight
  // through unchanged. The ErrorResponse type says timestamp/path/method are
  // required, but this path never adds them for a LOCALLY-thrown exception
  // like this one. Documenting the actual current behavior, not asserting
  // it's desired — see the session summary for this flagged as a finding.
  it("passes a local NotFoundException's own {statusCode, message, error} body through unchanged, without timestamp/path/method", () => {
    filter.catch(new NotFoundException('Poll not found'), host);

    expect(res.status).toHaveBeenCalledWith(404);
    const body = res.json.mock.calls[0][0];
    expect(body).toEqual({
      message: 'Poll not found',
      error: 'Not Found',
      statusCode: 404,
    });
    expect(body.timestamp).toBeUndefined();
    expect(body.path).toBeUndefined();
  });

  it("builds a full ErrorResponse from a validation failure's array message", () => {
    filter.catch(new BadRequestException(['email must be an email']), host);

    const body = res.json.mock.calls[0][0] as {
      statusCode: number;
      message: unknown;
    };
    expect(body.statusCode).toBe(400);
    // This one happens to also hit the pass-through path (statusCode+message
    // both present) rather than buildBody — same characterization as above.
    expect(body.message).toEqual(['email must be an email']);
  });

  it('builds a full ErrorResponse from an HttpException whose response object lacks statusCode/message (so it misses isUpstreamError)', () => {
    filter.catch(
      new HttpException({ error: 'Teapot', detail: 'oops' }, 418),
      host,
    );

    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 418,
        error: 'Teapot',
        path: '/api/polls/42',
        method: 'GET',
      }),
    );
  });

  it('maps a TCP microservice RpcException (nested in .response) to its own status and fills in timestamp/path/method', () => {
    filter.catch(
      { response: { statusCode: 401, message: 'Invalid credentials' } },
      host,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'MicroserviceError',
        path: '/api/polls/42',
        method: 'GET',
      }),
    );
  });

  it("maps a gRPC ServiceError's numeric code to the matching HTTP status", () => {
    filter.catch(
      {
        code: grpcStatus.ALREADY_EXISTS,
        details: 'Already joined poll with a different identity commitment',
        message: '6 ALREADY_EXISTS: ...',
      },
      host,
    );

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: 'Already joined poll with a different identity commitment',
      }),
    );
  });

  it('falls back to 500 for an unrecognized gRPC code', () => {
    filter.catch({ code: 9999, message: 'mystery grpc error' }, host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  // A plain Error is still an object with a `.message`, so it's caught by
  // the raw-object branch above (and labeled "MicroserviceError") before it
  // would ever reach the final catch-all — the message/status still end up
  // right, just via a different path than "exception instanceof Error"
  // might suggest.
  it('still resolves a plain Error to 500 with its own message, via the raw-object branch', () => {
    filter.catch(new Error('something exploded'), host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something exploded',
      }),
    );
  });

  // The true final-fallback path only fires for a non-object throw (or an
  // object with no `.message` at all) — e.g. `throw 'plain string'`.
  it('falls back to a generic 500 for a non-object, non-Error throw', () => {
    filter.catch('plain string throw', host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'InternalServerError',
      }),
    );
  });
});
