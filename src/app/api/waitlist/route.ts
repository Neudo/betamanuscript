import { handleWaitlistSignup } from "../../../server/waitlist";
import type { WaitlistPayload } from "../../../features/waitlist/types";

export async function POST(request: Request) {
  let payload: WaitlistPayload;

  try {
    payload = (await request.json()) as WaitlistPayload;
  } catch {
    return Response.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const result = await handleWaitlistSignup(payload);

  return Response.json(result.body, { status: result.status });
}

export function GET() {
  return Response.json(
    { ok: false, error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } },
  );
}
