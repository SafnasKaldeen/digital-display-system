// app/api/admin/displays/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Properly resolve params
    const params = await Promise.resolve(context.params);
    const displayId = params.id;

    console.log('PATCH - Display ID:', displayId); // Debug log

    if (!displayId) {
      return NextResponse.json(
        { error: 'Display ID is required' },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    console.log('PATCH - Status:', status); // Debug log

    if (!status || !['active', 'disabled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active or disabled' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from('displays')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', displayId);

    if (error) {
      console.error('Error updating display status:', error);
      return NextResponse.json(
        { error: 'Failed to update display status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Display ${status}`,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}