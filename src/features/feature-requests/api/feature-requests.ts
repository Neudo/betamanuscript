import {
  featureRequestSchema,
  type FeatureRequestInput,
} from "@/features/feature-requests/schemas/feature-request.schema";

function isFeatureRequestResponse(value: unknown): value is { error?: string; ok?: boolean } {
  return Boolean(value) && typeof value === "object";
}

export async function createFeatureRequest({
  manuscriptId,
  message,
}: FeatureRequestInput & {
  manuscriptId: string;
}) {
  const request = featureRequestSchema.parse({ message });
  const response = await fetch("/api/feature-requests", {
    body: JSON.stringify({ manuscriptId, message: request.message }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const responseBody: unknown = await response.json().catch(() => null);

  if (
    !response.ok
    || !isFeatureRequestResponse(responseBody)
    || responseBody.ok !== true
  ) {
    const error = isFeatureRequestResponse(responseBody) && typeof responseBody.error === "string"
      ? responseBody.error
      : "Your feature request could not be sent.";

    throw new Error(error);
  }
}
