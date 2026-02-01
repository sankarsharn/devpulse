import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Define which routes are public (unprotected)
const isPublicRoute = createRouteMatcher([
  '/api/webhooks/clerk(.*)', // Allow Clerk webhooks
  '/',                       // Allow homepage
  '/sign-in(.*)',            // Allow sign-in pages
  '/sign-up(.*)',            // Allow sign-up pages
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. If the route is NOT public, protect it
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};