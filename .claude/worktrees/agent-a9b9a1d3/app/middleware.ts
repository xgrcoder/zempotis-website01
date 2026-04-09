import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/portal") && !request.nextUrl.pathname.startsWith("/portal/login")) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }

  if (user && request.nextUrl.pathname === "/portal/login") {
    const role = user.user_metadata?.role
    if (role === "admin") {
      return NextResponse.redirect(new URL("/portal/admin/clients", request.url));
    }
    return NextResponse.redirect(new URL("/portal/dashboard/transcripts", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/portal/:path*"],
};