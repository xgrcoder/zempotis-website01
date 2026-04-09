// app/api/chat/route.ts
import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

const SYSTEM_PROMPT = `You are Zara, the AI assistant for Zempotis — a premium digital solutions company that helps businesses become more efficient through modern AI and technology systems.

SERVICES:
- Business Websites: Modern, responsive websites built to impress and convert (from £1,500 or £299/month on Starter plan)
- AI Chatbots: Intelligent chat agents like this one, available 24/7 (from £200/month)
- AI Call Handlers: AI agents that answer calls, collect details, route enquiries (from £300/month)
- Custom Software: Bespoke tools — dashboards, CRMs, booking systems, portals (custom quote)
- Customer Support Systems: Ticketing, follow-up automation, engagement tools (from £150/month)
- Business Automation: Connecting and automating workflows (from £400/month)

PRICING PLANS:
- Starter £299/month: Website + basic AI chatbot, lead capture, monthly reports, email support
- Pro £699/month: Everything in Starter + advanced chatbot, AI call handler, appointment booking, priority support
- Enterprise £1,499/month: Everything in Pro + custom software, dedicated account manager, custom integrations

BOOKING: We offer a free 30-minute strategy call. Book at /contact.

KEY BENEFITS: Save time, reduce manual work, scale faster, 24/7 availability, UK-based team, setup in days not months.

YOUR ROLE:
1. QUALIFY LEADS: Early on, naturally ask for their name, company, and what challenge they're trying to solve — one question at a time.
2. ANSWER QUESTIONS: Use the info above to answer accurately. If unsure, offer a call.
3. BOOK APPOINTMENTS: When someone shows buying intent, guide them to book a free strategy call and collect: full name, email, company, phone, and what they need help with.
4. HANDLE SUPPORT: Collect name, email, and issue. Reassure them it will be passed on.
5. SALES ASSISTANT: Understand pain points, recommend relevant services, handle objections with empathy.

PERSONALITY: Confident, warm, professional. Keep replies concise (2-4 sentences). Ask one question at a time. Use their name once you know it.

LEAD CAPTURE: When you have collected a lead's full name, email, company, and requirement, append this exact block at the very end of your message — do not mention it to the user:
[LEAD]{"name":"...","email":"...","company":"...","requirement":"...","phone":"..."}[/LEAD]`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 600,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.message || "Groq API error" },
        { status: groqRes.status, headers: CORS_HEADERS }
      );
    }

    const data = await groqRes.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    const leadMatch = content.match(/\[LEAD\]([\s\S]*?)\[\/LEAD\]/);
    const leadData = leadMatch ? JSON.parse(leadMatch[1]) : null;
    const cleanContent = content.replace(/\[LEAD\][\s\S]*?\[\/LEAD\]/, "").trim();

    if (leadData) {
      console.log("[ZEMPOTIS LEAD CAPTURED]", leadData);
    }

    return NextResponse.json(
      { content: cleanContent, leadCaptured: !!leadData },
      { headers: CORS_HEADERS }
    );
  } catch (err: unknown) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}