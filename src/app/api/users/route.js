// pages/api/user.js
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs';

export default async function handler(req, res) {
  const user = await currentUser();

  // Create a new user if not already in the database
  let dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.email,
        name: user.fullName,
        imageUrl: user.profileImageUrl,
      },
    });
  }
  res.status(200).json(dbUser);
}
