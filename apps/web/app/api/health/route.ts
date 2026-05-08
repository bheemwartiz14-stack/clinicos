export function GET() {
  return Response.json({
    ok: true,
    service: "mediclinicpro-web",
    timestamp: new Date().toISOString(),
  });
}
