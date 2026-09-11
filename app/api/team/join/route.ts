import { NextResponse } from "next/server";
import { validateInviteToken, joinManagerWithInvite } from "@/app/api/workers/teamWorker";
import { getSafeErrorMessage } from "@/app/lib/utils/errorHandler";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false, error: "Invite token is required." }, { status: 400 });
    }

    const validation = await validateInviteToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      companyName: validation.companyName,
      expiresAt: validation.invite?.expiresAt,
    });
  } catch (error) {
    console.error("Team Join Token Validation Error:", error);
    const safeError = getSafeErrorMessage(error, "Failed to validate invite token.");
    return NextResponse.json(
      { valid: false, error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, name, email, phone, password } = body;

    if (!token || !name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Missing required fields: token, name, email, phone, and password are required." },
        { status: 400 }
      );
    }

    const manager = await joinManagerWithInvite({
      token,
      name,
      email,
      phone,
      password,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully joined ${manager.companyName} as a Store Manager.`,
        manager: {
          id: manager.id,
          companyName: manager.companyName,
          email: manager.email,
          role: manager.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Team Join POST Error:", error);
    const safeError = getSafeErrorMessage(error, "Failed to complete manager registration.");
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.statusCode }
    );
  }
}
