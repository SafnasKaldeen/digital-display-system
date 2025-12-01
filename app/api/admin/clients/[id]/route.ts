// app/api/admin/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type Params = {
  id: string;  // Changed from clientId to id
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params | Promise<Params> }
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

    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const clientId = resolvedParams.id;  // Changed from clientId to id

    console.log('Deleting client ID:', clientId);

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // First, check if the client exists and is actually a client (not admin)
    const { data: existingClient, error: fetchError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', clientId)
      .single();

    if (fetchError || !existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (existingClient.role !== 'client') {
      return NextResponse.json(
        { error: 'Cannot delete non-client users' },
        { status: 403 }
      );
    }

    // Delete the client
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', clientId)
      .eq('role', 'client');

    if (deleteError) {
      console.error('Error deleting client:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete client' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}