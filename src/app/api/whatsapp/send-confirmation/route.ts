import { NextRequest, NextResponse } from "next/server";

interface SendWhatsAppRequest {
  phone: string;
  customerName: string;
  yatraName: string;
  bookingId?: string;
  travelDates?: string;
  paxCount?: string;
  totalAmount?: number | string;
  advancePaid?: number | string;
  balanceDue?: number | string;
  customMessage?: string;
  templateName?: string;
  // Optional direct API credentials override from client settings
  phoneNumberId?: string;
  accessToken?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SendWhatsAppRequest = await req.json();
    const {
      phone,
      customerName,
      yatraName,
      bookingId,
      travelDates,
      paxCount,
      totalAmount,
      advancePaid,
      balanceDue,
      customMessage,
      phoneNumberId,
      accessToken,
      templateName,
    } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number is required." }, { status: 400 });
    }

    // Clean phone number: remove all non-digits, ensure country code 91 for India if 10 digits
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    } else if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
      cleanPhone = `91${cleanPhone.slice(1)}`;
    }

    // Retrieve Meta Cloud API Credentials from env or request override
    const metaPhoneNumberId = phoneNumberId?.trim() || process.env.META_WA_PHONE_NUMBER_ID || process.env.NEXT_PUBLIC_META_WA_PHONE_NUMBER_ID || "1291621467367556";
    const metaAccessToken = accessToken?.trim() || process.env.META_WA_ACCESS_TOKEN || process.env.NEXT_PUBLIC_META_WA_ACCESS_TOKEN || "EAAT7x0bHdhABShqV9ZAc3gsn4ABlXvNXHwzcm2xi9x9hiILpwEaU2cb2r3h7dY7atZAgyKP88bLGgNwxSZAFCYtnJQiXmykP4TvsiugubZCf4YGqqG1lNH9g8oj4ZBmpfB9NfTISzbxAujSZBZBN9Wan1O0QXiQ0nyZBrt1dUtYFxXZB6JEHhZB7yb0FpS63ZCklgZDZD";

    if (!metaPhoneNumberId || !metaAccessToken) {
      return NextResponse.json({
        success: false,
        error: "Meta WhatsApp Cloud API credentials (Phone Number ID & Access Token) are not configured. Please configure them in CRM Settings.",
        needsConfiguration: true
      }, { status: 400 });
    }

    // Default formatted spiritual booking confirmation message
    const formattedText = customMessage || (
      `🙏 *ॐ नमः शिवाय | जय बद्री विशाल* 🙏\n\n` +
      `*DEV BHOOMI YATRA BOOKING CONFIRMATION*\n` +
      `*Traymbhkam Tour and Travels*\n\n` +
      `Dear *${customerName || "Devotee / Valued Guest"}*,\n` +
      `Warm greetings from Traymbhkam Tour and Travels! Your sacred pilgrimage booking has been successfully confirmed. 🚩\n\n` +
      `📋 *Booking Details:*\n` +
      `• *Yatra Package:* ${yatraName || "Chardham Yatra 2026"}\n` +
      (bookingId ? `• *Booking ID / File:* ${bookingId}\n` : "") +
      (travelDates ? `• *Travel Dates:* ${travelDates}\n` : "") +
      (paxCount ? `• *Pilgrims (Pax):* ${paxCount}\n` : "") +
      (totalAmount ? `• *Total Package Cost:* ₹${Number(totalAmount).toLocaleString("en-IN")}\n` : "") +
      (advancePaid ? `• *Advance Received:* ₹${Number(advancePaid).toLocaleString("en-IN")}\n` : "") +
      (balanceDue ? `• *Balance Due:* ₹${Number(balanceDue).toLocaleString("en-IN")}\n` : "") +
      `\n` +
      `✨ *Pilgrimage Guidelines:*\n` +
      `• Please keep your Char Dham Biometric / Yatra Registration Pass handy.\n` +
      `• Carry original Aadhaar/Government ID and warm woolens.\n` +
      `• Your driver and hotel vouchers will be sent 24 hours prior to travel.\n\n` +
      `📞 *24x7 Yatra Helpline:* +91 82660 16066 (Mr. Gagandeep)\n` +
      `📍 *Office:* Opp. Railway Station Gate No. 2, Haridwar, Uttarakhand\n\n` +
      `May Baba Kedar and Badri Vishal bless your sacred pilgrimage with peace, health and divinity! 🌸🛕`
    );

    // Call Meta Graph API v22.0
    const metaApiUrl = `https://graph.facebook.com/v22.0/${metaPhoneNumberId}/messages`;

    // Support hello_world or custom template
    const isTemplate = templateName === "hello_world";
    const payload = isTemplate
      ? {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "template",
          template: {
            name: "hello_world",
            language: { code: "en_US" }
          }
        }
      : {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: {
            preview_url: true,
            body: formattedText
          }
        };

    const metaRes = await fetch(metaApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${metaAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resJson = await metaRes.json();

    if (!metaRes.ok) {
      const code = resJson?.error?.code;
      const errorMsg = resJson?.error?.message || "Failed to send message via Meta Cloud API";
      let userFriendlyError = errorMsg;

      if (code === 131047 || errorMsg.includes("24 hours") || errorMsg.includes("re-engage")) {
        userFriendlyError = "⚠️ 24-Hour Window Rule: Recipient ne pichle 24 ghante me WhatsApp par reply nahi kiya hai. Meta policy ke mutabiq pehle '👋 Send Hello World' dabayein ya customer se +1 (555) 192-0464 par 'Hi' karwayein.";
      } else if (code === 131030 || errorMsg.includes("allowed list") || errorMsg.includes("not in allowed")) {
        userFriendlyError = `⚠️ Recipient Not Allowed: Meta Test Account se message sirf unhi numbers par jata hai jo Meta Developer Portal me 'To' (Recipient list) me added hain. Please Meta portal me jakar ${cleanPhone} add karein.`;
      } else if (code === 190 || errorMsg.includes("expired") || errorMsg.includes("OAuthException")) {
        userFriendlyError = "⚠️ Meta Access Token Expired: Meta Developer Portal se naya token lekar Settings ya Meta API Keys me save karein.";
      }

      return NextResponse.json({
        success: false,
        error: userFriendlyError,
        metaError: resJson?.error
      }, { status: metaRes.status });
    }

    return NextResponse.json({
      success: true,
      messageId: resJson?.messages?.[0]?.id,
      cleanPhone,
      textSent: isTemplate ? "[Template: hello_world]" : formattedText
    });
  } catch (err: any) {
    console.error("WhatsApp Cloud API error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Internal server error while sending WhatsApp message."
    }, { status: 500 });
  }
}
