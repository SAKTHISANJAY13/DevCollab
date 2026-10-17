import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are DevBot, an AI assistant inside DevCollab — a real-time project collaboration platform for student developers. Help users with DevCollab features, coding questions, DSA, React, Node.js, MongoDB, and general dev topics. Be concise and developer-focused.`;

const CANDIDATE_MODELS = [
  process.env.GROQ_MODEL,
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "llama-3.3-70b-versatile",
].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(messages)
        ? messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          }))
        : []),
    ];

    let response: Response | null = null;
    let lastError = "";

    for (const model of CANDIDATE_MODELS) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            stream: true,
            messages: formattedMessages,
          }),
        });

        if (res.ok) {
          response = res;
          break;
        } else {
          lastError = await res.text();
          // If model not found or forbidden, try next candidate
          if (res.status === 404 || lastError.includes("model_not_found")) {
            continue;
          }
          break;
        }
      } catch (err: any) {
        lastError = err?.message || "Network error connecting to Groq";
      }
    }

    if (!response || !response.ok) {
      return new Response(JSON.stringify({ error: lastError || "Failed to reach AI service" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response!.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data: ")) continue;
              const data = trimmed.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const text = parsed.choices?.[0]?.delta?.content;
                if (text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                  );
                }
              } catch {}
            }
          }
        } catch (streamErr) {
          console.error("Stream reading error:", streamErr);
        } finally {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
