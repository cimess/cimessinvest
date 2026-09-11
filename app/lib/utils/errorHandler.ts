export class PaymentGatewayError extends Error {
  public isOperational = true;
  constructor(message: string = "Payment processing error") {
    super(message);
    this.name = "PaymentGatewayError";
  }
}

export class AppValidationError extends Error {
  public isOperational = true;
  constructor(message: string = "Validation error") {
    super(message);
    this.name = "AppValidationError";
  }
}

/**
 * Checks whether an error originated from Prisma Client / Database engine
 */
export function isPrismaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { name?: string; code?: string };
  return (
    (typeof err.name === "string" && (err.name.startsWith("PrismaClient") || err.name.includes("Prisma"))) ||
    (typeof err.code === "string" && err.code.startsWith("P"))
  );
}

/**
 * Formats error responses securely:
 * - Operational / User validation errors are shown to the client.
 * - Database (Prisma) errors are NEVER leaked in production.
 * - In development, full error messages are preserved for debugging.
 */
export function getSafeErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected server error occurred."
): { message: string; statusCode: number } {
  if (error instanceof PaymentGatewayError || error instanceof AppValidationError) {
    return { message: error.message, statusCode: 400 };
  }

  if (isPrismaError(error)) {
    return {
      message:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : "A server error occurred. Please try again later.",
      statusCode: 500,
    };
  }

  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    return { message: error.message, statusCode: 500 };
  }

  return { message: fallbackMessage, statusCode: 500 };
}
