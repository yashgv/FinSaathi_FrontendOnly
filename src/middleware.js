import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
// import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

const isProtectedRoute = createRouteMatcher(['/dashboard'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
    
    // User sync logic
    const { userId } = auth();
    
    if (userId) {
      try {
        await dbConnect();
        
        // Check if user exists
        const existingUser = await User.findOne({ clerkId: userId });
        
        if (!existingUser) {
          // Fetch user from Clerk
          const clerkUser = await auth.user();
          
          // Create user in MongoDB
          await User.create({
            clerkId: userId,
            email: clerkUser.emailAddresses[0].emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            profileImageUrl: clerkUser.profileImageUrl
          });
        }
      } catch (error) {
        console.error('User sync error:', error);
      }
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}