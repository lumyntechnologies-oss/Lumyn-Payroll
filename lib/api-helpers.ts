import { NextResponse, NextRequest } from "next/server";

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 500, details?: unknown) {
  const response: any = {
    success: false,
    error: message,
  };
  if (process.env.NODE_ENV === "development" && details) {
    response.details = details;
  }
  return NextResponse.json(response, { status });
}

export function notFoundResponse(resource = "Resource") {
  return errorResponse(`${resource} not found`, 404);
}

export function validationError(message: string, field?: string) {
  return errorResponse(
    message,
    400,
    field ? { field } : undefined
  );
}

export function paginate(page: number, limit: number) {
  const take = Math.min(Math.max(1, limit), 100);
  const skip = (Math.max(1, page) - 1) * take;
  return { take, skip };
}

export function getPaginationParams(request: NextRequest) {
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") || "1"));
  const limit = Math.max(1, parseInt(request.nextUrl.searchParams.get("limit") || "10"));
  return paginate(page, limit);
}

export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorMessage = "Operation failed"
): Promise<{ success: true; data: T } | { success: false; error: string; details?: unknown }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    console.error(errorMessage, error);
    return {
      success: false,
      error: errorMessage,
      details:
        error instanceof Error
          ? { message: error.message, stack: process.env.NODE_ENV === "development" ? error.stack : undefined }
          : error,
    };
  }
}
