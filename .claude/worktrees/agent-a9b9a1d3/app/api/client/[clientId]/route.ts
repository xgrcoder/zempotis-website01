import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface PublicClientConfig {
  id: string;
  name: string;
  botName: string;
  primaryColor: string;
  accentColor: string;
  greeting: string;
  quickReplies: { label: string; value: string }[];
}

function getClientConfig(clientId: string) {
  const filePath = join(process.cwd(), "data", "clients", `${clientId}.json`);
  if (!existsSync(filePath)) return null;
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;

  if (!/^[a-z0-9-]+$/.test(clientId)) {
    return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
  }

  const config = getClientConfig(clientId);
  if (!config) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const publicConfig: PublicClientConfig = {
    id: config.id,
    name: config.name,
    botName: config.botName || "AI Assistant",
    primaryColor: config.primaryColor || "#2563eb",
    accentColor: config.accentColor || "#0ea5e9",
    greeting: config.greeting,
    quickReplies: config.quickReplies || [],
  };

  return NextResponse.json(publicConfig, {
    headers: { ...CORS, "Cache-Control": "public, max-age=300" },
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;

  if (!/^[a-z0-9-]+$/.test(clientId)) {
    return NextResponse.json({ error: "Invalid client ID" }, { status: 400, headers: CORS });
  }

  const config = getClientConfig(clientId);
  if (!config) {
    return NextResponse.json({ error: "Client not found" }, { status: 404, headers: CORS });
  }

  let messages: { role: string; content: string }[] = [];
  try {
    const body = await req.json();
    messages = body.messages || [];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400, headers: CORS });
  }

  if (!messages.length) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400, headers: CORS });
  }

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/London",
  });

  const systemPrompt = `You are a helpful AI assistant for ${config.name}.
Today is ${today}.
Use ONLY the information below to answer questions. If the answer is not in the content, politely say you do not have that information and suggest they contact ${config.name} directly.
Keep answers concise, friendly, and helpful.

--- WEBSITE CONTENT ---
${config.content || "No content available."}
--- END CONTENT ---`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 512,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
        ],
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error("Groq error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 502, headers: CORS });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";

    return NextResponse.json({ reply }, { headers: CORS });
  } catch (err) {
    console.error("POST /api/client error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: CORS });
  }
}