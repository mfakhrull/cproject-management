// src/app/api/users/update.ts
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { userId, update } = await request.json();
        const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true });
        return new Response(JSON.stringify(updatedUser), { headers: { 'Content-Type': 'application/json' } });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: "An unknown error occurred" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
