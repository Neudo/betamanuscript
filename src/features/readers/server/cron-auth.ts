import { timingSafeEqual } from "node:crypto";

export function isCronRequestAuthorized(request: Request, secret: string | undefined) {
  const authorization = request.headers.get("authorization");

  if (!secret || !authorization) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(authorization);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
