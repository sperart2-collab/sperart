import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
/** Refreshes the Supabase login session so admin actions keep working past the 1 hour token life. */
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        list.forEach((c) => req.cookies.set(c.name, c.value));
        res = NextResponse.next({ request: req });
        list.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      },
    },
  });
  await sb.auth.getUser();
  return res;
}
export const config = { matcher: ["/admin/:path*", "/account", "/login", "/join"] };
