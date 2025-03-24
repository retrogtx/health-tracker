import { auth } from "./app/auth";

export default auth;

export const config = {
  // Match all routes except for:
  // - API routes
  // - Static files
  // - Next.js files
  // - Favicon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}; 