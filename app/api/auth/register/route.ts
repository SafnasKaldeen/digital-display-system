import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, businessName, businessType } = await request.json()

    if (!email || !password || !businessName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // TODO: Implement actual database registration
    // This is a placeholder for the actual implementation
    return NextResponse.json(
      {
        message: "User registered successfully. Awaiting admin approval.",
        status: "pending",
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
