import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token"); // assuming JWT stored in cookies

  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

  if (!token && !isAuthPage) {
    // Not logged in → go to /auth
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  if (token && isAuthPage) {
    // Logged in but trying to access /auth → go to /
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // protect all routes
  ],
};
