import { runScout } from "@/lib/scout/run";
import { ScoutEvent, ScoutRunOptions } from "@/lib/scout/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  let options: ScoutRunOptions = {};
  try {
    const body = await request.json();
    if (body && typeof body === "object") options = body as ScoutRunOptions;
  } catch {
    /* empty body is fine */
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ScoutEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      try {
        await runScout(send, options);
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Scout run failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
