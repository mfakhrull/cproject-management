// src/app/api/users/delete.ts
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { userId } = await request.json();
        await User.findByIdAndDelete(userId);
        return new Response('User deleted successfully', { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: "An unknown error occurred" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
