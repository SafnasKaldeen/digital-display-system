import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr'; // Updated import
import { cookies } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the device ID
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Device ID is required' },
        { status: 400 }
      );
    }

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
              // The `setAll` method was called from a Server Component
              // This can be ignored if you have middleware refreshing user sessions
            }
          },
        },
      }
    );

    // Parse the request body
    const body = await request.json();
    const { status } = body;

    // Validate the status
    if (!status || !['approved', 'denied'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Valid status is required (approved or denied)' },
        { status: 400 }
      );
    }

    // Update the device in the database
    const { error } = await supabase
      .from('devices')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Device status updated to '${status}' successfully`
    });

  } catch (error: any) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the device ID
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Device ID is required' },
        { status: 400 }
      );
    }

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

    // Delete the device from the database
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Device deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting device:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}