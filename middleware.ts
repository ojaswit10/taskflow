import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

//applied this globally so runs at every route requested
const publicRoutes = [
  "/",
  "/signin",
  "/signup",
  "/api/auth/signup",
  "/api/auth/signin",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  //loop on the publicRoutes to check for routes we define 
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublic) return NextResponse.next();

  //gets the token from the req headers
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
}

//this would exclude on static files or else middleware will run on every route possible
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};