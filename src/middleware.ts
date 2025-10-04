import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return req.cookies.get(name)?.value;
      },
      set(name, value, options) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name, _options) {
        res.cookies.delete(name);
      },
    },
  });

  if (req.nextUrl.pathname.startsWith("/pro")) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_to", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/"],
};
