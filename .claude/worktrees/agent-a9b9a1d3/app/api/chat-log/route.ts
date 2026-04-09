// app/api/chat-log/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const { client_id, session_id, role, content, page_url } = await req.json()

    await supabase.from('chat_sessions').upsert(
      { client_id, session_id, page_url },
      { onConflict: 'session_id' }
    )

    const { error } = await supabase.from('chat_messages').insert({
      client_id, session_id, role, content
    })

    if (error) {
      return NextResponse.json(
        { error },
        { status: 500, headers: CORS_HEADERS }
      )
    }

    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS })
  } catch (err: unknown) {
    console.error("Chat log error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}