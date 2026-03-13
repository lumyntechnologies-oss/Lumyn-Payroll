import { NextResponse } from "next/server";

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function notFoundResponse(resource = "Resource") {
  return errorResponse(`${resource} not found`, 404);
}

export function paginate(page: number, limit: number) {
  const take = Math.min(Math.max(1, limit), 100);
  const skip = (Math.max(1, page) - 1) * take;
  return { take, skip };
}
