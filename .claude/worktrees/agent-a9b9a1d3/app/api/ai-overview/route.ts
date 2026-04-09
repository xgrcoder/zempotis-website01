// app/api/ai-overview/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "No prompt" }, { status: 400 });

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.error?.message || "Groq error" }, { status: res.status });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "Unable to generate summary.";
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
