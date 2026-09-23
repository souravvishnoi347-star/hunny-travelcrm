import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateSmartAgentReply, transcribeAudioVoiceNote } from "@/lib/aiSalesAgent";

// Webhook Verification (GET request from Meta when configuring Webhook URL)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_WA_WEBHOOK_VERIFY_TOKEN || "traymbhkam_wa_webhook_token_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("META WEBHOOK VERIFIED SUCCESSFULLY!");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden: Invalid verification token", { status: 403 });
}

// Incoming Message Webhook Event (POST request from Meta)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify it is a WhatsApp business account notification
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        const senderPhone = message.from; // e.g. "919410560099"
        const messageType = message.type;
        let messageText = messageType === "text" ? (message.text?.body || "") : "";

        const phoneNumberId = "1291621467367556";
        const accessToken = "EAAT7x0bHdhABShqV9ZAc3gsn4ABlXvNXHwzcm2xi9x9hiILpwEaU2cb2r3h7dY7atZAgyKP88bLGgNwxSZAFCYtnJQiXmykP4TvsiugubZCf4YGqqG1lNH9g8oj4ZBmpfB9NfTISzbxAujSZBZBN9Wan1O0QXiQ0nyZBrt1dUtYFxXZB6JEHhZB7yb0FpS63ZCklgZDZD";

        // Voice Note (Audio) handling
        if (messageType === "audio" && message.audio?.id) {
          try {
            console.log(`Processing voice note ${message.audio.id} from ${senderPhone}...`);
            const mediaRes = await fetch(`https://graph.facebook.com/v22.0/${message.audio.id}`, {
              headers: { "Authorization": `Bearer ${accessToken}` }
            });
            const mediaData = await mediaRes.json();
            if (mediaData.url) {
              const audioRes = await fetch(mediaData.url, {
                headers: { "Authorization": `Bearer ${accessToken}`, "User-Agent": "curl/7.64.1" }
              });
              const arrayBuf = await audioRes.arrayBuffer();
              const base64Audio = Buffer.from(arrayBuf).toString("base64");
              const mime = mediaData.mime_type || message.audio.mime_type || "audio/ogg";
              const transcription = await transcribeAudioVoiceNote(base64Audio, mime);
              if (transcription) {
                messageText = `[Voice Note]: ${transcription}`;
                console.log(`Transcribed voice note: "${transcription}"`);
              } else {
                messageText = "[Voice Note received - inaudible]";
              }
            }
          } catch (audioErr) {
            console.error("Failed to process voice note:", audioErr);
            messageText = "[Voice Note received]";
          }
        }

        console.log(`INCOMING WA MESSAGE from ${senderPhone}: ${messageText}`);

        // Fetch existing lead & full chat history from Supabase
        let existingLeadId: string | null = null;
        let chatHistory: any[] = [];
        let humanTakeover = false;
        let previousDestination = "";

        try {
          const { data: existingLead } = await supabase
            .from("leads")
            .select("id, name, destination, notes")
            .eq("phone", senderPhone)
            .limit(1)
            .maybeSingle();

          if (existingLead) {
            existingLeadId = existingLead.id;
            previousDestination = existingLead.destination || "";
            if (existingLead.notes) {
              try {
                const parsed = JSON.parse(existingLead.notes);
                if (Array.isArray(parsed.chatHistory)) {
                  chatHistory = parsed.chatHistory;
                }
                if (parsed.humanTakeover !== undefined) {
                  humanTakeover = parsed.humanTakeover;
                }
              } catch {
                // If old plain text format, convert into first history entry
                chatHistory = [
                  {
                    id: "msg-prev",
                    sender: "customer",
                    text: existingLead.notes,
                    timestamp: "Earlier"
                  }
                ];
              }
            }
          }
        } catch (ctxErr) {
          console.warn("Context fetch error:", ctxErr);
        }

        // Add incoming customer message to history
        const customerMsgObj = {
          id: message.id || `msg-${Date.now()}`,
          sender: "customer",
          text: messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "read"
        };
        chatHistory.push(customerMsgObj);

        // Intelligent Destination Tagging
        const lowerMsg = (messageText || "").toLowerCase();
        let destinationTag = previousDestination || "Char Dham Yatra 2026";
        if (lowerMsg.includes("kedarnath") && (lowerMsg.includes("sirf") || !lowerMsg.includes("char") || lowerMsg.includes("nhi"))) {
          destinationTag = "Kedarnath Yatra (Solo/Single Dham)";
        } else if (lowerMsg.includes("heli") || lowerMsg.includes("chopper")) {
          destinationTag = "Kedarnath Helicopter Inquiry";
        } else if (lowerMsg.includes("do dham") || (lowerMsg.includes("kedarnath") && lowerMsg.includes("badrinath"))) {
          destinationTag = "Do Dham (Kedarnath - Badrinath)";
        } else if (lowerMsg.includes("teen dham")) {
          destinationTag = "Teen Dham Yatra";
        } else if (lowerMsg.includes("char dham") || lowerMsg.includes("chardham")) {
          destinationTag = "Char Dham Yatra 2026";
        }

        let agentReply = "";

        // If Human Takeover is active, AI bot stays silent and leaves it to the human
        if (!humanTakeover) {
          // Build rich multi-turn conversation context
          const conversationContext = chatHistory
            .slice(-8)
            .map(m => `${m.sender === "customer" ? "Customer" : "Gagandeep"}: ${m.text}`)
            .join("\n");

          agentReply = await generateSmartAgentReply(messageText, senderPhone, conversationContext);
          console.log(`AI AGENT REPLY to ${senderPhone}: ${agentReply}`);

          if (phoneNumberId && accessToken && senderPhone && agentReply) {
            const metaApiUrl = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
            try {
              const metaRes = await fetch(metaApiUrl, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  messaging_product: "whatsapp",
                  recipient_type: "individual",
                  to: senderPhone,
                  type: "text",
                  text: {
                    preview_url: false,
                    body: agentReply
                  }
                })
              });
              const metaData = await metaRes.json();
              console.log(`Reply sent to ${senderPhone}:`, metaData);
            } catch (metaErr) {
              console.error("Failed to send WhatsApp message via Meta API:", metaErr);
            }

            // Append bot reply to chat history
            chatHistory.push({
              id: `reply-${Date.now()}`,
              sender: "bot",
              text: agentReply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: "delivered"
            });
          }
        }

        // Save updated chat thread and lead in Supabase
        try {
          const notesPayload = JSON.stringify({
            humanTakeover,
            chatHistory: chatHistory.slice(-30), // keep last 30 messages
            lastMsg: messageText,
            lastReply: agentReply
          });

          if (!existingLeadId) {
            await supabase.from("leads").insert([
              {
                name: `WhatsApp Lead (+${senderPhone.slice(-4)})`,
                phone: senderPhone,
                destination: destinationTag,
                notes: notesPayload,
                status: "inquiry"
              }
            ]);
          } else {
            await supabase.from("leads").update({
              notes: notesPayload,
              destination: destinationTag
            }).eq("id", existingLeadId);
          }
        } catch (leadErr) {
          console.warn("Auto-lead sync error:", leadErr);
        }
      }
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ status: "ERROR", error: error.message }, { status: 200 });
  }
}
