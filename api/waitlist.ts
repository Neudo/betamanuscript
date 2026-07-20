import type { IncomingMessage, ServerResponse } from "node:http";
import { handleWaitlistSignup } from "../src/features/waitlist/server";
import type { WaitlistPayload } from "../src/features/waitlist/types";

type ApiRequest = IncomingMessage & {
  body?: unknown;
  method?: string;
};

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>,
) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
}

async function readPayload(request: ApiRequest): Promise<WaitlistPayload> {
  if (request.body && typeof request.body === "object") {
    return request.body as WaitlistPayload;
  }

  if (typeof request.body === "string") {
    return JSON.parse(request.body) as WaitlistPayload;
  }

  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as WaitlistPayload;
}

export default async function handler(
  request: ApiRequest,
  response: ServerResponse,
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  let payload: WaitlistPayload;

  try {
    payload = await readPayload(request);
  } catch {
    sendJson(response, 400, { ok: false, error: "Invalid JSON payload" });
    return;
  }

  const result = await handleWaitlistSignup(payload);

  sendJson(response, result.status, result.body);
}
