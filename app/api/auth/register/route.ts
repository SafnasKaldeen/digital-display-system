// ============================================================
// app/api/auth/register/route.ts
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Public registration is disabled. Please contact an administrator to create your account.',
      disabled: true
    },
    { status: 403 }
  );
}