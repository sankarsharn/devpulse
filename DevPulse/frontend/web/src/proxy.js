import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect everything EXCEPT webhook
    '/((?!api/webhooks/clerk|_next|.*\\..*).*)',
  ],
};
