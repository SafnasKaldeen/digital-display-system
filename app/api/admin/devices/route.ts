import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr'; // Updated import
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client for the server
    const cookieStore = await cookies(); // Important: await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // Ignore error in Server Component context
            }
          },
        },
      }
    );

    // Fetch devices with display info
    const { data: devices, error } = await supabase
      .from('devices')
      .select(`
        *,
        displays:display_id (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: devices || []
    });

  } catch (error: any) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}