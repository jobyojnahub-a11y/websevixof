import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isClientArea = pathname.startsWith("/client");
  const isAdminArea = pathname.startsWith("/admin");

  if (!isClientArea && !isAdminArea) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = isAdminArea ? "/admin/auth" : "/client/auth";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = (token as any).role as string | undefined;
  if (isAdminArea && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/client/dashboard";
    return NextResponse.redirect(url);
  }
  if (isClientArea && role !== "client" && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/client/auth";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/client/:path*", "/admin/:path*"],
};

