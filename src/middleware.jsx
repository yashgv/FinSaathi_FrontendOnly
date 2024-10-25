import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { userOperations } from '@/lib/operations';

const protectedRoutes = createRouteMatcher([
  "/dashboard",
  "/api/((?!webhook).*)" // Protect all API routes except webhooks
]);

export default clerkMiddleware(async (auth, req) => {
  if (protectedRoutes(req)) {
    const session = await auth().protect();
    
    // Get user data from Clerk
    const user = session.user;
    
    // Sync user data with our database
    if (user) {
      await userOperations.upsertUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl
      });
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};