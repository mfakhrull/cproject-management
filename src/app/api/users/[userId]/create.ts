// src/app/api/users/create.ts
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const data = await request.json();
        const newUser = new User(data);
        const result = await newUser.save();
        return new Response(JSON.stringify(result), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: "An unknown error occurred" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
