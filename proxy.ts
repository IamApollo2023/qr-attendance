import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired and get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      // Not authenticated - redirect to login
      if (request.nextUrl.pathname !== "/admin/login") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } else {
      // Check if user has admin role
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        // Not an admin - redirect to login
        if (request.nextUrl.pathname !== "/admin/login") {
          return NextResponse.redirect(
            new URL("/admin/login?error=access_denied", request.url)
          );
        }
      } else {
        // Admin authenticated - redirect away from login page
        if (request.nextUrl.pathname === "/admin/login") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
    }
  }

  // Protect scanner routes
  if (request.nextUrl.pathname.startsWith("/scanner")) {
    if (!user) {
      // Not authenticated - redirect to login
      if (request.nextUrl.pathname !== "/scanner/login") {
        return NextResponse.redirect(new URL("/scanner/login", request.url));
      }
    } else {
      // Check if user has scanner role
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "scanner") {
        // Not a scanner - redirect to login
        if (request.nextUrl.pathname !== "/scanner/login") {
          return NextResponse.redirect(
            new URL("/scanner/login?error=access_denied", request.url)
          );
        }
      } else {
        // Scanner authenticated - redirect away from login page
        if (request.nextUrl.pathname === "/scanner/login") {
          return NextResponse.redirect(new URL("/scanner", request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
