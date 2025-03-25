import { getReasonPhrase, StatusCodes } from 'http-status-codes';

export function status(code: number) {
  return new Response(null, { status: code, statusText: getReasonPhrase(code) });
}

export { StatusCodes };
