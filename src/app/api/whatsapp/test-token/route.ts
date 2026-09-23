import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumberId, accessToken } = await req.json();

    const pId = phoneNumberId?.trim() || process.env.META_WA_PHONE_NUMBER_ID || process.env.NEXT_PUBLIC_META_WA_PHONE_NUMBER_ID;
    const token = accessToken?.trim() || process.env.META_WA_ACCESS_TOKEN || process.env.NEXT_PUBLIC_META_WA_ACCESS_TOKEN;

    if (!pId || !token) {
      return NextResponse.json({
        valid: false,
        error: "Phone Number ID and Access Token are required."
      }, { status: 400 });
    }

    const testUrl = `https://graph.facebook.com/v22.0/${pId}?access_token=${token}`;
    const res = await fetch(testUrl);
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        valid: false,
        error: data?.error?.message || "Invalid or expired token",
        details: data?.error
      }, { status: res.status });
    }

    return NextResponse.json({
      valid: true,
      data: {
        id: data.id,
        display_phone_number: data.display_phone_number,
        verified_name: data.verified_name,
        quality_rating: data.quality_rating
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      valid: false,
      error: err.message || "Failed to verify token with Meta Graph API"
    }, { status: 500 });
  }
}
