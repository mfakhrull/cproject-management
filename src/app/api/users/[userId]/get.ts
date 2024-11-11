// src/app/api/users/get.ts
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { userId } = await request.json();
        const user = await User.findById(userId);
        if (!user) {
            return new Response('User not found', { status: 404 });
        }
        return new Response(JSON.stringify(user), { headers: { 'Content-Type': 'application/json' } });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: "An unknown error occurred" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
