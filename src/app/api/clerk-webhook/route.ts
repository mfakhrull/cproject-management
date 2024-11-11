import { Webhook, WebhookVerificationError } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error('WEBHOOK_SECRET not set');
    throw new Error('WEBHOOK_SECRET must be defined');
  }

  // Retrieve and verify headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing required Svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const webhook = new Webhook(WEBHOOK_SECRET);

  let event: WebhookEvent;
  try {
    event = webhook.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      console.error('Webhook verification failed:', err.message);
    }
    return new Response('Webhook verification failed', { status: 401 });
  }

  if (event.type === 'user.created') {
    const { id, username, image_url } = event.data;
    await dbConnect();
    try {
      const newUser = new User({
        username: username || `user_${id}`,
        profilePictureUrl: image_url ,
        team: null, // Default to no team, adjust as necessary
      });
      await newUser.save();
      console.log(`User created with ID: ${newUser._id}`);
    } catch (error) {
      console.error('Error saving user:', error);
      return new Response('Error saving user data', { status: 500 });
    }
  }

  console.log(`Handled event type: ${event.type}`);
  return new Response('Webhook processed successfully', { status: 200 });
}
