export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function corsJson(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export function corsError(message: string, status = 500): Response {
  console.error(`[api] ${status}:`, message);
  return corsJson({ error: message }, status);
}

export function corsOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
