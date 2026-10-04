import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM = "https://amfinder.web.id/api/find";

function validTikTokUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      /(^|\.)tiktok\.com$/i.test(url.hostname) ||
      /(^|\.)vt\.tiktok\.com$/i.test(url.hostname)
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("url")?.trim();

  if (!input) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "TikTok link is required."
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  if (!validTikTokUrl(input)) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Please enter a valid TikTok link."
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  const upstreamUrl = new URL(UPSTREAM);
  upstreamUrl.searchParams.set("url", input);

  const bat = request.nextUrl.searchParams.get("bat");
  const chg = request.nextUrl.searchParams.get("chg");

  if (bat) upstreamUrl.searchParams.set("bat", bat);
  if (chg) upstreamUrl.searchParams.set("chg", chg);

  try {
    const response = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "text/event-stream"
      },
      cache: "no-store"
    });

    if (!response.ok || !response.body) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Finder service returned HTTP ${response.status}.`
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
      }
    });
  } catch {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Unable to connect to the finder service."
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
