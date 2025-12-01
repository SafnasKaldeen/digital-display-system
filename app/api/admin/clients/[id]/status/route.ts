// app/api/admin/clients/[clientId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface RouteContext {
  params: Promise<{
    clientId: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
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

    // Extract clientId from URL as fallback
    const { clientId } = await params;
    const urlClientId = request.nextUrl.pathname.split('/')[4]; // Extract from URL path
    
    const finalClientId = clientId || urlClientId;

    console.log('Params clientId:', clientId);
    console.log('URL clientId:', urlClientId);
    console.log('Final clientId:', finalClientId);

    if (!finalClientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be approved, pending, or rejected' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', finalClientId)
      .eq('role', 'client');

    if (error) {
      console.error('Error updating client status:', error);
      return NextResponse.json(
        { error: 'Failed to update client status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Client status updated to ${status}`,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}