// app/api/admin/displays/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function DELETE(
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

    console.log('DELETE - Display ID:', displayId); // Debug log

    if (!displayId) {
      return NextResponse.json(
        { error: 'Display ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check if display exists
    const { data: existingDisplay, error: fetchError } = await supabase
      .from('displays')
      .select('id')
      .eq('id', displayId)
      .single();

    if (fetchError || !existingDisplay) {
      console.error('Display not found:', fetchError);
      return NextResponse.json(
        { error: 'Display not found' },
        { status: 404 }
      );
    }

    // Delete the display
    const { error: deleteError } = await supabase
      .from('displays')
      .delete()
      .eq('id', displayId);

    if (deleteError) {
      console.error('Error deleting display:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete display' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Display deleted successfully',
    });
  } catch (error) {
    console.error('Delete display error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}