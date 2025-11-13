import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("middleware")

  // Protect only the /admin route
  if (pathname.startsWith("/admin")) {
    const pin = req.cookies.get("admin_pin")?.value;

    if (pin !== process.env.ADMIN_PIN) {
      const url = new URL("/admin-login", req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};