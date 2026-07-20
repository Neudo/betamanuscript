function errorStatus(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  if ("statusCode" in error && typeof error.statusCode === "number") {
    return error.statusCode;
  }

  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }

  return undefined;
}

function errorMessage(error: unknown) {
  if (typeof error !== "object" || error === null || !("message" in error)) {
    return "";
  }

  return String(error.message);
}

function errorName(error: unknown) {
  if (typeof error !== "object" || error === null || !("name" in error)) {
    return undefined;
  }

  return String(error.name);
}

function resendErrorDetail(error: unknown) {
  if (process.env.NODE_ENV === "production") {
    return {};
  }

  return {
    detail: {
      name: errorName(error),
      statusCode: errorStatus(error),
      message: errorMessage(error) || "Unknown Resend error",
    },
  };
}

function isDuplicateContactError(error: unknown) {
  const status = errorStatus(error);
  const message = errorMessage(error);

  return status === 409 || /already exists|duplicate|exists/i.test(message);
}

export { isDuplicateContactError, resendErrorDetail };
