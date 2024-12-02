// pages/api/webhook/user.js
import { Webhook } from 'svix';
import { buffer } from 'micro';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  const payload = await buffer(req);
  const headers = req.headers;

  const wh = new Svix.Webhook(webhookSecret);
  let evt;

  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  await dbConnect();

  switch (evt.type) {
    case 'user.created':
    case 'user.updated':
      const { id, email_addresses, first_name, last_name, profile_image_url, ...metadata } = evt.data;

      try {
        await User.findOneAndUpdate(
          { clerkId: id },
          {
            clerkId: id,
            email: email_addresses[0].email_address,
            firstName: first_name,
            lastName: last_name,
            profileImageUrl: profile_image_url,
            metadata: metadata
          },
          { upsert: true, new: true }
        );

        res.status(200).json({ message: 'User synced successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to sync user' });
      }
      break;

    case 'user.deleted':
      try {
        await User.findOneAndDelete({ clerkId: evt.data.id });
        res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
      }
      break;

    default:
      res.status(400).json({ error: 'Unhandled event type' });
  }
}