// app/api/seed/route.ts
import { NextResponse } from 'next/server';
import seed from '@/lib/seed';

// export async function POST() {
//   try {
//     await seed();
//     return NextResponse.json({ message: 'Database seeded successfully' });
//   } catch (error) {
//     console.error('Seeding error:', error);
//     return NextResponse.json(
//       { error: 'Failed to seed database' },
//       { status: 500 }
//     );
//   }
// }


export async function GET() {
  try {
    await seed();
    return NextResponse.json({ message: "Database seeded successfully!" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error seeding database: ${error.message}` },
      { status: 500 }
    );
  }
}