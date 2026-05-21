import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Guest checkout is allowed, so booking + checkout are NOT protected.
// Only protect routes that require a known user (account, booking history, admin).
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/my-trips(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Run the auth check before the route matcher
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on every request except Next.js internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/(.*)",
    "/(api|trpc)(.*)",
  ],
};
