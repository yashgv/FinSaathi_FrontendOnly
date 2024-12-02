// src/app/api/webhook/route.js
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  // Verify webhook
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  try {
    const wh = new Webhook(webhookSecret);
    const evt = wh.verify(payload, headers);

    await dbConnect();

    switch (evt.type) {
      case 'user.created':
      case 'user.updated':
        const { id, email_addresses, first_name, last_name, profile_image_url } = evt.data;

        await User.findOneAndUpdate(
          { clerkId: id },
          {
            clerkId: id,
            email: email_addresses[0].email_address,
            firstName: first_name,
            lastName: last_name,
            profileImageUrl: profile_image_url,
          },
          { upsert: true, new: true }
        );
        break;

      case 'user.deleted':
        await User.findOneAndDelete({ clerkId: evt.data.id });
        break;
    }

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}