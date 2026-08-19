import "server-only";

import { NextResponse } from "next/server";

import { AuthError } from "./auth/current-user";

export function json<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Parses a JSON body defensively — a malformed body is a 400, never a 500. */
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/**
 * Wraps a route handler so thrown AuthErrors become the right status code and
 * unexpected errors never leak a stack trace to the client.
 */
export function handler<C = unknown>(fn: (request: Request, context: C) => Promise<NextResponse>) {
  return async (request: Request, context: C): Promise<NextResponse> => {
    try {
      return await fn(request, context);
    } catch (error) {
      if (error instanceof AuthError) return fail(error.message, error.status);
      console.error("[femi][api]", error);
      return fail("Something went wrong. Please try again.", 500);
    }
  };
}
