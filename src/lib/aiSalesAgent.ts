/**
 * AI Sales Agent & Lead Qualification Engine for Traymbhkam Tour and Travels
 * Uses OpenRouter AI (Gemini 2.5 Flash / DeepSeek) with natural conversational Hinglish.
 * Qualifies pilgrims, answers inquiries naturally, and hands off to sales only when ready.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

const SYSTEM_PROMPT = `You are Gagandeep, the founder and chief pilgrimage expert at 'Traymbhkam Tour and Travels' (Haridwar, Uttarakhand).
Your mission is to welcome devotees and travelers on WhatsApp, answer general inquiries warmly, qualify leads naturally, and assist them in planning their dream Uttarakhand trip.

CRITICAL CONVERSATIONAL RULES:
1. LISTEN TO THE CUSTOMER'S REQUEST PRECISELY:
   - If a customer says "Sirf Kedarnath", "Chardham nahi chahiye", or mentions a specific dham, DO NOT push Char Dham or other packages on them!
   - Acknowledge immediately: "Ji bilkul! Sirf Kedarnath Yatra ka complete package ho jayega."
   - Stay 100% focused ONLY on what the customer requested.
2. LANGUAGE & TONE:
   - Reply in clean, natural, respectful Hinglish (Hindi in Roman alphabets with common English travel words).
   - NEVER use heavy, formal Shuddh Hindi (no 'अनाधिकृत', 'श्रीमान', 'सात्विक', 'पंजीकरण', 'सुविधाजनक'). Keep it conversational, friendly, and respectful (use 'Aap', 'Ji').
   - Keep messages SHORT & CRISP (2 to 4 sentences maximum). It must feel like a fast real human WhatsApp message.
3. LEAD QUALIFICATION:
   - Do NOT dump phone numbers in every message.
   - Gently ask 1 or 2 qualification questions:
     * "Aap total kitne log travel karenge?" (Family / group size)
     * "Kaun se month ya dates ka plan hai?" (May-June ya Sept-Oct)
     * "Aap Haridwar, Dehradun ya Delhi kahan se start karenge?"
4. SALES HANDOFF:
   - Share contact details ONLY when the customer asks: "Call me", "Booking karni hai", "Advance kaise bheju", "Direct baat karni hai".
   - Coordinator: Mr. Gagandeep (+91 82660 16066), Opp. Railway Station Gate No. 2, Haridwar.

OFFICIAL PACKAGES & PRICING (TRAYMBHKAM TOUR AND TRAVELS):
- KEDARNATH ONLY (3 Nights / 4 Days ex-Haridwar/Rishikesh):
  * Route: Haridwar/Rishikesh -> Guptkashi/Sonprayag -> Kedarnath Dham Darshan -> Haridwar
  * Group/Sharing rate: approx ₹9,500 - ₹12,500 per person
  * Private Deluxe (Dedicated Cab + Hotel/Resort Stay + MAP Breakfast & Dinner + Yatra Registration): approx ₹13,500 - ₹17,500 per person (based on 2-4 pax).
- CHAR DHAM YATRA (9N/10D):
  * Group/Sharing: approx ₹24,000 - ₹28,000/person | Private Deluxe: approx ₹28,000 - ₹34,000/person.
- DO DHAM (Kedarnath & Badrinath - 5N/6D): approx ₹16,500 - ₹21,500/person.
- DO DHAM (Yamunotri & Gangotri - 4N/5D): approx ₹13,500 - ₹17,500/person.
- BADRINATH ONLY (2N/3D): approx ₹8,500 - ₹11,500/person.
- HELICOPTER:
  * Kedarnath shuttle tickets must be booked via IRCTC (heliyatra.irctc.co.in) to avoid scams. We provide complete ground VIP stays, darshan pass, and cab package.
  * Char Dham 5N/6D VIP Helicopter (with Hyatt Regency stay): ~₹1,95,000 - ₹2,10,000/person.
  * Do Dham Same Day Helicopter: ~₹95,000 - ₹1,15,000/person.
- TAXI RENTALS (Haridwar / Dehradun):
  * Dzire ₹3,800/day | Ertiga ₹4,800/day | Innova ₹5,500/day | Crysta ₹6,500/day | Tempo 12s ₹8,000/day.

Never say you are an AI or bot. You are Gagandeep from Traymbhkam Tour and Travels.`;

export async function generateSmartAgentReply(
  userMessage: string,
  customerPhone?: string,
  chatContext?: string
): Promise<string> {
  const cleanInput = (userMessage || "").trim();
  if (!cleanInput) {
    return "Namaste ji! Traymbhkam Tour and Travels mein aapka swagat hai. Main Gagandeep hoon. Aap kaun si yatra plan kar rahe hain? 😊";
  }

  // Attempt 1: Call OpenRouter with Gemini 2.5 Flash & DeepSeek
  const models = ["google/gemini-2.5-flash", "deepseek/deepseek-chat"];

  for (const model of models) {
    try {
      const messages: any[] = [{ role: "system", content: SYSTEM_PROMPT }];

      if (chatContext) {
        messages.push({
          role: "system",
          content: `Recent conversation history with this client:\n${chatContext.slice(-800)}`
        });
      }

      messages.push({ role: "user", content: cleanInput });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for reliable AI response

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://traymbhkam.com",
          "X-Title": "Traymbhkam Tour and Travels Assistant"
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 250,
          temperature: 0.6
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) {
          return reply;
        }
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying fallback:`, err);
    }
  }

  // Fallback: Smart conversational Hinglish rules tailored to what the client actually asked!
  const lower = cleanInput.toLowerCase();

  // If customer asked only for Kedarnath
  if (lower.includes("kedarnath") && (lower.includes("sirf") || lower.includes("only") || !lower.includes("char") || lower.includes("nhi"))) {
    return "Namaste ji! Bilkul, hum aapko sirf Kedarnath Yatra (3 Nights / 4 Days ex-Haridwar/Rishikesh) ka complete package provide karenge. Isme hotel stay, transport aur yatra assistance included rahega. Aap total kitne members hain aur kis month mein jane ka plan hai? 😊";
  }

  if (lower.includes("heli") || lower.includes("chopper") || lower.includes("flight") || lower.includes("udan")) {
    return "Namaste ji! Kedarnath helicopter shuttle tickets direct IRCTC ki official website (heliyatra.irctc.co.in) se book hoti hain, taaki aap market ke fake scams se safe rahein. Hum aapka complete VIP ground package (resort stay, cab, darshan pass support) arrange kar denge. Aap kitne log hain aur kab ka plan hai?";
  }

  if (lower.includes("taxi") || lower.includes("cab") || lower.includes("car") || lower.includes("driver")) {
    return "Namaste! Traymbhkam Tour and Travels mein hum Haridwar aur Dehradun se reliable yatra cabs provide karte hain (Dzire ₹3,800/day, Ertiga ₹4,800/day, Innova ₹5,500/day). Aapko kis date ko aur kahan ke liye cab chahiye?";
  }

  if (lower.includes("price") || lower.includes("rate") || lower.includes("cost") || lower.includes("package") || lower.includes("kitna") || lower.includes("budget")) {
    if (lower.includes("kedarnath")) {
      return "Namaste ji! Kedarnath Yatra (3N/4D) package approx ₹9,500 se ₹13,500 per person se start hota hai (hotel stay, cab, breakfast & dinner included). Aap kitne members hain aur travel date kya hai? Main exact discounted rate bata deta hoon. 😊";
    }
    return "Namaste ji! Char Dham Yatra (9N/10D) approx ₹24,000 se ₹28,000 per person aur Kedarnath-Badrinath Do Dham approx ₹16,500 se shuru hota hai. Aap kaun si yatra plan kar rahe hain aur kitne members hain?";
  }

  if (lower.includes("call") || lower.includes("baat") || lower.includes("contact") || lower.includes("number") || lower.includes("book")) {
    return "Ji bilkul! Hamare senior tour coordinator Mr. Gagandeep (+91 82660 16066) aapse direct connect kar lenge aur complete customized itinerary share kar denge. Aapka plan kis date se start karne ka hai?";
  }

  return "Namaste ji! Traymbhkam Tour and Travels mein aapka swagat hai, main Gagandeep hoon. 🙏 Aapka Haridwar se Kedarnath Yatra ka plan hai ya Char Dham? Aap kitne log travel karenge?";
}

/**
 * Transcribes voice note audio buffer to text using Gemini 2.5 Flash multimodal on OpenRouter
 */
export async function transcribeAudioVoiceNote(base64Audio: string, mimeType: string = "audio/ogg"): Promise<string> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 150,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please transcribe this customer voice note verbatim. The customer is speaking in Hindi, Hinglish, or English asking about an Uttarakhand trip or pilgrimage. Output ONLY the transcribed spoken text. Do not add explanations, quotes, or notes."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Audio}`
                }
              }
            ]
          }
        ]
      })
    });

    if (res.ok) {
      const data = await res.json();
      const transcription = data.choices?.[0]?.message?.content?.trim();
      if (transcription && transcription.length > 2) {
        return transcription;
      }
    }
  } catch (err) {
    console.error("Audio transcription error:", err);
  }
  return "";
}
