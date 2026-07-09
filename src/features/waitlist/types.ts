export type WaitlistPayload = {
  email?: unknown;
  source?: unknown;
  submittedAt?: unknown;
  formStartedAt?: unknown;
  website?: unknown;
};

export type WaitlistResponseBody = {
  ok: boolean;
  error?: string;
  detail?: {
    name?: string;
    statusCode?: number;
    message: string;
  };
};
