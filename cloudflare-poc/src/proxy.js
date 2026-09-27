/**
 * Hardened Cloudflare Worker Reverse Proxy for EduMatrix
 * 
 * Proxies incoming client requests to the local Node.js Express backend (http://127.0.0.1:5000).
 * Enforces strict upstream URL validation, anchoring all requests to the configured origin.
 * Prevents scheme-relative open-proxy / SSRF attacks and credential leakage.
 * Preserves request method, path, query parameters, body, headers, and WebSocket upgrades.
 */

export default {
  async fetch(request, env, ctx) {
    let url;
    try {
      url = new URL(request.url);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Malformed request URL.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const originBase = env.ORIGIN_URL || "http://127.0.0.1:5000";
    let originUrl;
    try {
      originUrl = new URL(originBase);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "Invalid ORIGIN_URL configuration.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Strict path validation: reject scheme-relative, backslash-containing, or malformed paths
    if (!url.pathname.startsWith("/") || url.pathname.startsWith("//") || url.pathname.includes("\\")) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid request path: scheme-relative or malformed paths are not permitted.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify percent-decoded path to prevent encoded bypass attempts (e.g. /%2f, /%5c)
    try {
      const decodedPath = decodeURIComponent(url.pathname);
      if (decodedPath.startsWith("//") || decodedPath.includes("\\")) {
        return new Response(
          JSON.stringify({
            error: "Bad Request",
            message: "Invalid request path: encoded scheme-relative or malformed paths are not permitted.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid request path: malformed percent-encoding.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Safely construct target URL anchored to the configured origin
    const targetUrl = new URL(originUrl.href);
    const originPath = originUrl.pathname.replace(/\/$/, "");
    targetUrl.pathname = originPath + url.pathname;
    targetUrl.search = url.search;

    // Defense-in-depth: invariant verification that origin, host, and port never changed
    if (
      targetUrl.origin !== originUrl.origin ||
      targetUrl.host !== originUrl.host ||
      targetUrl.protocol !== originUrl.protocol ||
      targetUrl.port !== originUrl.port
    ) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Target destination origin mismatch.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Clone headers and preserve client headers
    const forwardHeaders = new Headers(request.headers);
    
    // Set standard proxy forwarding headers
    forwardHeaders.set("X-Forwarded-Host", url.host);
    forwardHeaders.set("X-Forwarded-Proto", url.protocol.replace(":", ""));
    const clientIp = request.headers.get("cf-connecting-ip") || "127.0.0.1";
    forwardHeaders.set("X-Forwarded-For", clientIp);

    // Build the proxied request
    const init = {
      method: request.method,
      headers: forwardHeaders,
      redirect: "manual",
    };

    // Forward body for non-GET/HEAD methods
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
      init.duplex = "half";
    }

    try {
      const originResponse = await fetch(targetUrl.toString(), init);

      // If origin upgraded to WebSocket (101 Switching Protocols), return the response directly
      if (originResponse.status === 101) {
        return originResponse;
      }

      // Clone response headers to send back to client
      const responseHeaders = new Headers(originResponse.headers);
      
      // Tag response with an edge header indicating it was handled by the proxy
      responseHeaders.set("X-Edge-Proxied-By", "EduMatrix-Cloudflare-Worker");

      return new Response(originResponse.body, {
        status: originResponse.status,
        statusText: originResponse.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Bad Gateway",
          message: "Could not connect to the upstream Node.js origin",
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};

