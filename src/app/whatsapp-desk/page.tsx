"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  UserCheck, 
  Phone, 
  Search, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Calendar, 
  IndianRupee, 
  MapPin, 
  Loader2, 
  ExternalLink,
  SlidersHorizontal,
  Flame,
  Zap,
  ShieldCheck,
  Building2,
  ChevronRight,
  ChevronDown,
  FileText,
  Compass,
  AlertTriangle,
  HelpCircle,
  Settings,
  Key,
  X,
  Users,
  Upload,
  Download,
  Copy,
  Play,
  Pause,
  Square,
  FileSpreadsheet,
  ArrowRight,
  Radio,
  Eye,
  CheckSquare,
  ShieldAlert
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BOT_RESPONSES, SALES_TEAM, matchBotResponse, MatchedRule } from "@/lib/botRules";

export const LEAD_QUALIFICATION_TEMPLATES = {
  questionnaire: `🙏 *ॐ नमः शिवाय | जय बद्री विशाल* 🙏
*TRAYMBHKAM TOUR AND TRAVELS (HARIDWAR)*

Devotee / Yatri ji, aapki Devbhoomi yatra ki best planning ke liye kripya yeh 5 quick details bata dijiye:
1️⃣ *Kaun si yatra plan hai?* (Char Dham / Kedarnath / Badrinath / Do Dham / Taxi rental)
2️⃣ *Aapki expected travel date ya month?* (e.g. May, June, Sept, Oct)
3️⃣ *Total kitne yatri / pilgrims hain?* (Adults + Kids)
4️⃣ *Pickup location kahan se chahiye?* (Haridwar / Rishikesh / Dehradun / Delhi)
5️⃣ *Hotel preference?* (Deluxe / Standard / Luxury)

Hamari team turant aapko customized yatra itinerary aur best rates share karegi.
📞 *Senior Coordinator:* Mr. Gagandeep (Hunny) (+91 82660 16066)`,

  chardhamBrochure: `🙏 *CHAR DHAM YATRA 2026 (9 Nights / 10 Days ex-Haridwar)*
*Traymbhkam Tour and Travels*

🚩 *Sacred Route:* Haridwar -> Barkot (Yamunotri) -> Uttarkashi (Gangotri) -> Guptkashi/Sonprayag -> Kedarnath Dham -> Pipalkoti/Joshimath -> Badrinath Dham -> Rishikesh -> Haridwar

✨ *Inclusions:*
• Dedicated Mountain Cab / Tempo Traveller
• Deluxe Hotel & Resort Stays
• Daily Pure Vegetarian Breakfast & Dinner (MAP)
• Yatra Registration & Biometric Assistance
• 24x7 Haridwar Local Ground Support

💰 *Starting from ₹24,000 - ₹28,000/person (Group) | ₹28,000 - ₹34,000/person (Private Cab)*
📞 Call / WhatsApp: +91 82660 16066 (Mr. Gagandeep - Hunny)`,

  kedarnathBrochure: `🙏 *KEDARNATH DHAM SPECIAL YATRA (3 Nights / 4 Days ex-Haridwar)*
*Traymbhkam Tour and Travels*

🛕 *Route:* Haridwar/Rishikesh -> Devprayag -> Guptkashi -> Sonprayag/Gaurikund -> Kedarnath Dham Darshan -> Haridwar

✨ *Inclusions:*
• Clean private/sharing sanitized mountain cab
• Guptkashi/Sitapur Deluxe Hotel Stay + Dinner & Breakfast
• Kedarnath top stay assistance & Yatra pass registration
• No fake helicopter tickets; pure safe verified ground support

💰 *Starting from ₹9,500/person (Sharing) | ₹13,500/person (Private Cab)*
📞 Coordinator: Mr. Gagandeep (Hunny) (+91 82660 16066)`,

  taxiTariff: `🚕 *UTTARAKHAND HILL FLEET & TAXI TARIFFS (2026 Season)*
*Traymbhkam Tour and Travels, Haridwar*

🚙 *Vehicle Options:*
• *Swift Dzire (Sedan):* ₹3,800 / day
• *Maruti Ertiga (7-Seater):* ₹4,800 / day
• *Toyota Innova (7-Seater):* ₹5,500 / day
• *Toyota Innova Crysta (Deluxe):* ₹6,500 / day
• *Tempo Traveller (12/17 Seater):* ₹8,000 - ₹9,500 / day

✅ Clean vehicles, hill-expert certified drivers, all toll/parking guidance included.
📍 Office: Opp. Railway Station Gate No. 2, Haridwar
📞 Direct Booking: +91 82660 16066 (Mr. Gagandeep - Hunny)`
};

export const BULK_CAMPAIGN_TEMPLATES = {
  chardham: `🙏 *ॐ नमः शिवाय | जय बद्री विशाल* 🙏

🚩 *श्री चार धाम यात्रा 2026 - स्पेशल अर्ली बर्ड बुकिंग ओपन!* 🚩
*Traymbhkam Tour and Travels (हरिद्वार)*

प्रिय भक्तजन,
चार धाम यात्रा 2026 (यमुनोत्री, गंगोत्री, केदारनाथ, बद्रीनाथ) के लिए स्पेशल फैमिली एवं ग्रुप पैकेज बुकिंग शुरू हो चुकी है!

✨ *पैकेज में शामिल:*
• हरिद्वार/देहरादून से कम्प्लीट 9N/10D सेनेटाइज्ड प्राइवेट कैब (Dzire, Ertiga, Innova, Tempo)
• डीलक्स होटल/रिसॉर्ट स्टे + रोजाना स्वादिष्ट सात्विक ब्रेकफास्ट व डिनर
• बायोमेट्रिक यात्रा रजिस्ट्रेशन एवं स्पेशल दर्शन गाइडेंस
• 24x7 हरिद्वार ग्राउंड असिस्टेंस व मेडिकल इमरजेंसी सपोर्ट

🎁 *सीमित समय ऑफर:* पहले 50 ग्रुप्स के लिए स्पेशल अर्ली-बर्ड डिस्काउंट!

📞 *डायरेक्ट बुकिंग व कस्टमाइज्ड कोटेशन के लिए अभी कॉल/व्हाट्सएप करें:*
👤 *Mr. Gagandeep (Hunny)*: +91 82660 16066
📍 *ऑफिस:* पुरुषार्थी मार्केट, रेलवे स्टेशन गेट नं. 2 के सामने, हरिद्वार`,

  kedarnath: `🙏 *हर हर महादेव | ॐ नमः शिवाय* 🙏

🛕 *श्री केदारनाथ धाम यात्रा 2026 - स्पेशल 3N/4D पैकेज*
*Traymbhkam Tour and Travels, Haridwar*

बाबा केदार के दर्शन की इच्छा रखने वाले सभी श्रद्धालुओं के लिए स्पेशल 3 रात / 4 दिन का एक्स-हरिद्वार/ऋषिकेश पैकेज उपलब्ध है।

✨ *मुख्य सुविधाएं:*
• हरिद्वार से सोनप्रयाग/गुप्तकाशी तक प्राइवेट सुरक्षित कैब
• गुप्तकाशी/सीतापुर में डीलक्स होटल व रिसॉर्ट स्टे (MAP मील प्लान सहित)
• गौरीकुंड से केदारनाथ धाम पैदल/घोड़ा-पालकी व रजिस्ट्रेशन सपोर्ट
• नो फ्रॉड गारंटी: सभी लीगल परमिट्स एवं लोकल असिस्टेंस

💰 *पैकेज रेट:* मात्र ₹9,500/- प्रति व्यक्ति से शुरू (ग्रुप शेयरिंग)

📲 *तुरंत बुकिंग या सीट ब्लॉक करने के लिए संपर्क करें:*
👤 *Mr. Gagandeep (Hunny)*: +91 82660 16066
🌐 *ट्रस्टेड टूर ऑपरेटर:* Traymbhkam Tour and Travels`,

  taxi: `🙏 *जय देवभूमि उत्तराखंड* 🙏

🚕 *चार धाम एवं हिल स्टेशन टैक्सी सेवा (हरिद्वार / देहरादून)*
*Traymbhkam Tour and Travels (Mr. Gagandeep - Hunny)*

यदि आप परिवार या मित्रों के साथ उत्तराखंड की यात्रा प्लान कर रहे हैं, तो बुक करें सबसे भरोसेमंद एवं अनुभवी पहाड़ी ड्राइवर्स के साथ सेनेटाइज्ड कैब:

🚗 *फ्लीट व डेली टैरिफ:*
• Swift Dzire: ₹3,800/दिन
• Maruti Ertiga: ₹4,800/दिन
• Toyota Innova: ₹5,500/दिन
• Innova Crysta: ₹6,500/दिन
• 12/17 सीटर टेम्पो ट्रैवलर: ₹8,000/दिन से शुरू

✅ नो हिडन चार्ज • क्लीन गाड़ियां • 24x7 हेल्पलाइन
📞 *कॉल / व्हाट्सएप:* +91 82660 16066 (Mr. Gagandeep - Hunny)
📍 हरिद्वार रेलवे स्टेशन गेट नंबर 2 के सामने`,

  custom: ""
};

interface WhatsAppMessage {
  id: string;
  sender: "customer" | "bot" | "agent";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  isBookingConfirmation?: boolean;
}

interface WhatsAppChat {
  id: string;
  customerName: string;
  phone: string;
  destination: string;
  bookingId?: string;
  totalAmount?: number;
  advancePaid?: number;
  travelDates?: string;
  paxCount?: string;
  humanTakeover: boolean;
  unreadCount: number;
  lastMessageTime: string;
  messages: WhatsAppMessage[];
  status: "inquiry" | "quoted" | "confirmed" | "completed";
  leadQualificationStage?: "unqualified" | "interested" | "dates_pax_shared" | "itinerary_sent" | "ready_to_book" | "confirmed";
}

const INITIAL_CHATS: WhatsAppChat[] = [];

export default function WhatsAppDeskPage() {
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "bot" | "human" | "confirmed">("all");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [matchedRuleInfo, setMatchedRuleInfo] = useState<MatchedRule | null>(null);

  // Active top navigation tab
  const [activeDeskTab, setActiveDeskTab] = useState<"inbox" | "broadcast" | "sim_setup">("inbox");

  // Bulk Marketing & Broadcast state (5,000 numbers capacity)
  const [broadcastNumbersText, setBroadcastNumbersText] = useState<string>("");
  const [campaignTemplateKey, setCampaignTemplateKey] = useState<"chardham" | "kedarnath" | "taxi" | "custom">("chardham");
  const [customBroadcastMessage, setCustomBroadcastMessage] = useState<string>("");
  const [broadcastDelaySeconds, setBroadcastDelaySeconds] = useState<number>(3);
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>("+91 82660 16066");
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [isBroadcastPaused, setIsBroadcastPaused] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [broadcastProgress, setBroadcastProgress] = useState<{
    sent: number;
    failed: number;
    total: number;
    currentPhone: string;
    activeIndex: number;
  }>({ sent: 0, failed: 0, total: 0, currentPhone: "", activeIndex: 0 });
  const [broadcastLog, setBroadcastLog] = useState<{
    phone: string;
    time: string;
    status: "success" | "failed" | "skipped";
    message?: string;
  }[]>([]);
  const [webQueueIndex, setWebQueueIndex] = useState<number>(0);
  const stopBroadcastRef = useRef<boolean>(false);
  const pauseBroadcastRef = useRef<boolean>(false);
  
  // Custom API configuration cache
  const [metaConfig, setMetaConfig] = useState<{ phoneNumberId: string; accessToken: string }>({
    phoneNumberId: "",
    accessToken: ""
  });

  // Meta Token Configuration Modal States
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [modalPhoneId, setModalPhoneId] = useState("");
  const [modalToken, setModalToken] = useState("");
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [tokenTestResult, setTokenTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Load chats live from Supabase leads table
  const loadChatsFromSupabase = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const { data: dbLeads, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !dbLeads) {
        if (isManual) setIsRefreshing(false);
        return;
      }

      const syncedChats: WhatsAppChat[] = dbLeads
        .filter((lead: any) => lead.phone) // only leads with phone
        .map((lead: any) => {
          let chatMessages: WhatsAppMessage[] = [];
          let humanTakeover = false;

          if (lead.notes) {
            try {
              const parsed = JSON.parse(lead.notes);
              if (Array.isArray(parsed.chatHistory)) {
                chatMessages = parsed.chatHistory;
              }
              if (parsed.humanTakeover !== undefined) {
                humanTakeover = parsed.humanTakeover;
              }
            } catch {
              // Legacy plain text note format
              if (typeof lead.notes === "string" && lead.notes.trim()) {
                chatMessages = [
                  {
                    id: `msg-${lead.id}`,
                    sender: "customer",
                    text: lead.notes,
                    timestamp: new Date(lead.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ];
              }
            }
          }

          return {
            id: lead.id,
            customerName: lead.name || `Devotee (+${(lead.phone || '').slice(-4)})`,
            phone: lead.phone,
            destination: lead.destination || "Uttarakhand Yatra",
            humanTakeover,
            unreadCount: 0,
            lastMessageTime: chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].timestamp : "Recent",
            messages: chatMessages,
            status: (lead.status as any) || "inquiry"
          };
        });

      if (syncedChats.length > 0) {
        setChats(syncedChats);
        setSelectedChatId(prev => (prev && syncedChats.some(c => c.id === prev) ? prev : syncedChats[0].id));
      }
    } catch (err) {
      console.warn("Failed to load chats from Supabase:", err);
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  };

  // Load WhatsApp credentials & start real-time sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const pId = localStorage.getItem("traymbhkam_meta_phone_number_id") || process.env.NEXT_PUBLIC_META_WA_PHONE_NUMBER_ID || "1291621467367556";
        const token = localStorage.getItem("traymbhkam_meta_access_token") || process.env.NEXT_PUBLIC_META_WA_ACCESS_TOKEN || "EAAT7x0bHdhABShqV9ZAc3gsn4ABlXvNXHwzcm2xi9x9hiILpwEaU2cb2r3h7dY7atZAgyKP88bLGgNwxSZAFCYtnJQiXmykP4TvsiugubZCf4YGqqG1lNH9g8oj4ZBmpfB9NfTISzbxAujSZBZBN9Wan1O0QXiQ0nyZBrt1dUtYFxXZB6JEHhZB7yb0FpS63ZCklgZDZD";
        setMetaConfig({ phoneNumberId: pId, accessToken: token });
      } catch (e) {}
    }

    // Initial load from Supabase
    loadChatsFromSupabase();

    // Auto-poll every 5 seconds for new customer WhatsApp messages
    const pollTimer = setInterval(() => {
      loadChatsFromSupabase();
    }, 5000);

    return () => clearInterval(pollTimer);
  }, []);

  const saveChats = (updated: WhatsAppChat[]) => {
    setChats(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("traymbhkam_whatsapp_desk_chats", JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Scroll active chat messages to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedChatId, chats]);

  // Active Chat
  const activeChat = useMemo(() => {
    return chats.find(c => c.id === selectedChatId) || chats[0];
  }, [chats, selectedChatId]);

  // Analytics (including 250/per day quota)
  const stats = useMemo(() => {
    const totalChats = chats.length;
    const humanTakeovers = chats.filter(c => c.humanTakeover).length;
    const botActive = chats.filter(c => !c.humanTakeover).length;
    const confirmedBookings = chats.filter(c => c.status === "confirmed").length;

    // Daily conversation messages sent today (Tier limit: 250/day)
    const todaySentCount = chats.reduce((acc, c) => {
      return acc + c.messages.filter(m => m.sender === "bot" || m.sender === "agent").length;
    }, 0);

    const dailyLimit = 250;
    const remainingQuota = Math.max(0, dailyLimit - todaySentCount);
    const usagePercent = Math.min(100, Math.round((todaySentCount / dailyLimit) * 100));

    return {
      totalChats,
      humanTakeovers,
      botActive,
      confirmedBookings,
      todaySentCount,
      dailyLimit,
      remainingQuota,
      usagePercent
    };
  }, [chats]);

  // Filtered chats list
  const filteredChats = useMemo(() => {
    return chats.filter(c => {
      if (filterMode === "bot" && c.humanTakeover) return false;
      if (filterMode === "human" && !c.humanTakeover) return false;
      if (filterMode === "confirmed" && c.status !== "confirmed") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.customerName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [chats, filterMode, searchQuery]);

  // Toggle Human Takeover
  const toggleHumanTakeover = async (chatId: string) => {
    const targetChat = chats.find(c => c.id === chatId);
    if (!targetChat) return;
    const nextState = !targetChat.humanTakeover;

    const systemMessage: WhatsAppMessage = {
      id: `sys-${Date.now()}`,
      sender: "agent",
      text: nextState 
        ? "⚠️ Human Takeover Enabled: AI Bot paused. You can now chat manually with this customer." 
        : "🤖 AI Bot Resumed: Automated responses re-enabled.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = chats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          humanTakeover: nextState,
          messages: [...c.messages, systemMessage]
        };
      }
      return c;
    });

    saveChats(updated);

    // Persist to Supabase
    try {
      const chatToSave = updated.find(c => c.id === chatId);
      if (chatToSave) {
        await supabase.from("leads").update({
          notes: JSON.stringify({
            humanTakeover: nextState,
            chatHistory: chatToSave.messages
          })
        }).eq("id", chatId);
      }
    } catch (e) {
      console.warn("Failed to persist human takeover to Supabase:", e);
    }

    showToast(
      nextState 
        ? "👤 Human Takeover Activated: AI Bot is paused for this chat." 
        : "🤖 AI Bot Re-activated for this chat."
    );
  };

  // Send Manual Reply or WhatsApp Web Fallback
  const handleSendMessage = async () => {
    if (!replyText.trim() || !activeChat) return;

    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      sender: activeChat.humanTakeover ? "agent" : "bot",
      text: replyText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };

    const currentText = replyText.trim();
    setReplyText("");
    setIsSending(true);

    // Call backend API (backend will use its env vars if not passed)
    try {
      const res = await fetch("/api/whatsapp/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: activeChat.phone,
          customerName: activeChat.customerName,
          yatraName: activeChat.destination,
          customMessage: currentText,
          phoneNumberId: metaConfig.phoneNumberId || undefined,
          accessToken: metaConfig.accessToken || undefined
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        newMsg.status = "delivered";
        showToast(`✓ Message delivered to ${activeChat.phone} via Meta Cloud API!`);
      } else {
        newMsg.status = "sent";
        const errMsg = resJson.error || "Could not deliver message";
        showToast(`⚠️ Meta API Error: ${errMsg}`);
        console.error("Meta API error response:", resJson);
        const lower = errMsg.toLowerCase();
        if (lower.includes("token") || lower.includes("session") || lower.includes("expired") || lower.includes("oauth") || lower.includes("190")) {
          setModalPhoneId(metaConfig.phoneNumberId || "1291621467367556");
          setModalToken(metaConfig.accessToken || "");
          setTokenTestResult({ success: false, message: "Your Meta Access Token has expired (24-hour limit). Please generate a fresh token from developers.facebook.com and paste it below." });
          setIsTokenModalOpen(true);
        }
      }
    } catch (e: any) {
      console.error("Meta send request failed:", e);
      showToast(`⚠️ Network error: ${e.message || "Failed to reach WhatsApp API"}`);
    }

    const updated = chats.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          lastMessageTime: "Just now",
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    saveChats(updated);

    // Persist to Supabase
    try {
      const targetChat = updated.find(c => c.id === activeChat.id);
      if (targetChat) {
        await supabase.from("leads").update({
          notes: JSON.stringify({
            humanTakeover: targetChat.humanTakeover,
            chatHistory: targetChat.messages
          })
        }).eq("id", activeChat.id);
      }
    } catch (e) {
      console.warn("Failed to persist sent message to Supabase:", e);
    }

    setIsSending(false);
  };

  // Test and Save Token from Modal
  const handleTestAndSaveToken = async () => {
    if (!modalPhoneId.trim() || !modalToken.trim()) {
      setTokenTestResult({ success: false, message: "Phone Number ID and Access Token are required." });
      return;
    }
    setIsTestingToken(true);
    setTokenTestResult(null);
    try {
      const res = await fetch("/api/whatsapp/test-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumberId: modalPhoneId.trim(),
          accessToken: modalToken.trim()
        })
      });
      const data = await res.json();
      if (data.valid) {
        setTokenTestResult({ 
          success: true, 
          message: `✓ Token Verified! Phone: ${data.data?.display_phone_number || data.data?.verified_name || "Active"}` 
        });
        localStorage.setItem("traymbhkam_meta_phone_number_id", modalPhoneId.trim());
        localStorage.setItem("traymbhkam_meta_access_token", modalToken.trim());
        setMetaConfig({ phoneNumberId: modalPhoneId.trim(), accessToken: modalToken.trim() });
        showToast("✓ Meta API credentials saved & verified!");
        setTimeout(() => setIsTokenModalOpen(false), 1400);
      } else {
        setTokenTestResult({ 
          success: false, 
          message: `❌ ${data.error || "Token verification failed"}` 
        });
      }
    } catch (e: any) {
      setTokenTestResult({ success: false, message: `Network error: ${e.message}` });
    } finally {
      setIsTestingToken(false);
    }
  };

  // Send Official Hello World Template to re-open 24h conversation window
  const handleSendHelloWorldTemplate = async () => {
    if (!activeChat) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/whatsapp/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: activeChat.phone,
          customerName: activeChat.customerName,
          yatraName: activeChat.destination,
          templateName: "hello_world",
          phoneNumberId: metaConfig.phoneNumberId || "1291621467367556",
          accessToken: metaConfig.accessToken || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Hello World Template sent to ${activeChat.phone}!`);
        const templateMsg: WhatsAppMessage = {
          id: `msg-${Date.now()}`,
          sender: "agent",
          text: "👋 [Official Template Delivered]: Hello World! (Customer can reply to open 24h chat window)",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "delivered"
        };
        saveChats(chats.map(c => c.id === activeChat.id ? { ...c, messages: [...c.messages, templateMsg] } : c));
      } else {
        showToast(`⚠️ Meta Error: ${data.error}`);
        if (data.error?.includes("Token") || data.error?.includes("expired")) {
          setIsTokenModalOpen(true);
        }
      }
    } catch (e: any) {
      showToast(`Network error: ${e.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Send 1-Click Booking Confirmation Template
  const handleSendBookingConfirmation = async () => {
    if (!activeChat) return;
    const confirmText = 
      `🙏 *ॐ नमः शिवाय | जय बद्री विशाल* 🙏\n\n` +
      `*DEV BHOOMI YATRA BOOKING CONFIRMATION*\n` +
      `*Traymbhkam Tour and Travels*\n\n` +
      `Dear *${activeChat.customerName}*,\n` +
      `Your sacred pilgrimage booking for *${activeChat.destination}* is successfully confirmed! 🚩\n\n` +
      `📋 *Booking Details:*\n` +
      (activeChat.bookingId ? `• *Booking File:* ${activeChat.bookingId}\n` : "") +
      (activeChat.travelDates ? `• *Dates:* ${activeChat.travelDates}\n` : "") +
      (activeChat.paxCount ? `• *Pilgrims:* ${activeChat.paxCount}\n` : "") +
      (activeChat.totalAmount ? `• *Total Cost:* ₹${activeChat.totalAmount.toLocaleString("en-IN")}\n` : "") +
      (activeChat.advancePaid ? `• *Advance Received:* ₹${activeChat.advancePaid.toLocaleString("en-IN")}\n` : "") +
      (activeChat.totalAmount && activeChat.advancePaid ? `• *Balance Due:* ₹${(activeChat.totalAmount - activeChat.advancePaid).toLocaleString("en-IN")}\n` : "") +
      `\n📞 *24x7 Helpline:* +91 82660 16066 (Mr. Gagandeep - Hunny)\n` +
      `📍 *Office:* Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar\n\n` +
      `May Baba Kedar and Badri Vishal bless your holy pilgrimage! 🙏🌸`;

    setReplyText(confirmText);
    showToast("Template loaded in input box! Click 'Send' or edit before sending.");
  };

  // Load Lead Qualification Templates
  const handleLoadLeadTemplate = (type: "questionnaire" | "chardham" | "kedarnath" | "taxi") => {
    if (type === "questionnaire") {
      setReplyText(LEAD_QUALIFICATION_TEMPLATES.questionnaire);
      showToast("📋 Loaded Pilgrim Lead Qualification Questionnaire!");
    } else if (type === "chardham") {
      setReplyText(LEAD_QUALIFICATION_TEMPLATES.chardhamBrochure);
      showToast("🚩 Loaded Char Dham 10D Brochure & Quote!");
    } else if (type === "kedarnath") {
      setReplyText(LEAD_QUALIFICATION_TEMPLATES.kedarnathBrochure);
      showToast("🛕 Loaded Kedarnath 4D Package!");
    } else if (type === "taxi") {
      setReplyText(LEAD_QUALIFICATION_TEMPLATES.taxiTariff);
      showToast("🚕 Loaded Mountain Fleet Tariff Card!");
    }
  };

  // Auto Match Bot Rule on customer inquiry
  const handleAutoSuggestReply = () => {
    if (!activeChat) return;
    const lastCustomerMsg = [...activeChat.messages].reverse().find(m => m.sender === "customer");
    const query = lastCustomerMsg ? lastCustomerMsg.text : (replyText || activeChat.destination || "");
    const rule = matchBotResponse(query);
    setMatchedRuleInfo(rule);
    setReplyText(rule.response);
    showToast(`🤖 Rule Matched: ${rule.title}`);
  };

  // Preset Rule Loaders
  const handleLoadRule = (type: "sales" | "helicopter" | "gst" | "package" | "season") => {
    let rule: MatchedRule;
    if (type === "sales") {
      rule = {
        ruleId: "sales",
        title: "Helpline & Official Contact",
        description: "Official contact for Mr. Gagandeep (Hunny) (+91 82660 16066)",
        response: BOT_RESPONSES.salesHandoff
      };
    } else if (type === "helicopter") {
      rule = {
        ruleId: "helicopter",
        title: "Helicopter Fraud Warning & IRCTC Portal",
        description: "Multilingual advisory: Agency does not book copters, use official IRCTC",
        response: BOT_RESPONSES.helicopterAdvisory
      };
    } else if (type === "gst") {
      rule = {
        ruleId: "gst",
        title: "GST / Billing Sales Policy",
        description: "Strict sales handoff: GST details handled by sales team only",
        response: BOT_RESPONSES.gstPolicy
      };
    } else if (type === "package") {
      rule = {
        ruleId: "payment_package",
        title: "Package Range & Payment Security",
        description: "Indicative ballpark estimate; no direct account details shared",
        response: BOT_RESPONSES.packageAndPayment
      };
    } else {
      rule = {
        ruleId: "seasonality",
        title: "Seasonality & Tours Calendar",
        description: "Chardham season (May-July & Sept-Nov) + Leisure/Hill stations",
        response: BOT_RESPONSES.seasonalityAndDestinations
      };
    }
    setMatchedRuleInfo(rule);
    setReplyText(rule.response);
    showToast(`📋 Loaded template: ${rule.title}`);
  };

  // Memoized phone number parser for up to 5,000+ numbers with real-time validation & deduplication
  const parsedBroadcastAudience = useMemo(() => {
    if (!broadcastNumbersText.trim()) {
      return {
        validList: [] as { raw: string; clean: string; formatted: string }[],
        totalRaw: 0,
        validCount: 0,
        duplicates: 0,
        invalid: 0
      };
    }

    const tokens = broadcastNumbersText
      .split(/[\r\n,;\t]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const seen = new Set<string>();
    const validList: { raw: string; clean: string; formatted: string }[] = [];
    let duplicates = 0;
    let invalid = 0;

    for (const token of tokens) {
      let digits = token.replace(/[^0-9]/g, "");
      if (digits.startsWith("0")) {
        digits = digits.substring(1);
      }
      if (digits.startsWith("91") && digits.length === 12) {
        digits = digits.substring(2);
      }

      if (/^[6-9]\d{9}$/.test(digits)) {
        if (seen.has(digits)) {
          duplicates++;
        } else {
          seen.add(digits);
          validList.push({
            raw: token,
            clean: digits,
            formatted: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
          });
        }
      } else {
        invalid++;
      }
    }

    return {
      validList,
      totalRaw: tokens.length,
      validCount: validList.length,
      duplicates,
      invalid
    };
  }, [broadcastNumbersText]);

  // Active bulk campaign message
  const activeCampaignMessage = useMemo(() => {
    if (campaignTemplateKey === "custom") {
      return customBroadcastMessage;
    }
    return BULK_CAMPAIGN_TEMPLATES[campaignTemplateKey];
  }, [campaignTemplateKey, customBroadcastMessage]);

  // Handle CSV / TXT / Excel file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBroadcastNumbersText(prev => {
          return prev ? `${prev}\n${content}` : content;
        });
        showToast(`📁 Loaded file: ${file.name} successfully!`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Test Broadcast Message to Gagandeep (+91 82660 16066)
  const handleSendTestBroadcast = async () => {
    const cleanTestPhone = testPhoneNumber.replace(/[^0-9]/g, "");
    if (!cleanTestPhone || cleanTestPhone.length < 10) {
      showToast("Please enter a valid 10-digit test phone number");
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await fetch("/api/whatsapp/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanTestPhone.startsWith("91") ? `+${cleanTestPhone}` : `+91${cleanTestPhone}`,
          customerName: "Mr. Gagandeep (Hunny)",
          destination: "Marketing Test Broadcast",
          freeformMessage: activeCampaignMessage,
          customPhoneId: metaConfig.phoneNumberId || undefined,
          customAccessToken: metaConfig.accessToken || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✅ Test broadcast sent to ${testPhoneNumber}! Check WhatsApp.`);
      } else {
        showToast(`Meta Notice: ${data.error || "Opening preview in WhatsApp Web..."}`);
        const encoded = encodeURIComponent(activeCampaignMessage);
        window.open(`https://wa.me/${cleanTestPhone.startsWith("91") ? cleanTestPhone : `91${cleanTestPhone}`}?text=${encoded}`, "_blank");
      }
    } catch (e: any) {
      const encoded = encodeURIComponent(activeCampaignMessage);
      window.open(`https://wa.me/${cleanTestPhone.startsWith("91") ? cleanTestPhone : `91${cleanTestPhone}`}?text=${encoded}`, "_blank");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Launch Automated Cloud API Broadcast to all verified contacts
  const handleStartBroadcast = async () => {
    const audience = parsedBroadcastAudience.validList;
    if (audience.length === 0) {
      showToast("⚠️ No valid +91 phone numbers found. Please paste or upload numbers first.");
      return;
    }

    if (!activeCampaignMessage.trim()) {
      showToast("⚠️ Campaign message is empty! Please select or write a message.");
      return;
    }

    if (!confirm(`Are you ready to broadcast to ${audience.length} verified devotee numbers?\n\n• Delay: ${broadcastDelaySeconds}s per message\n• Authorized Rep: Mr. Gagandeep (Hunny)\n• Helpline: +91 82660 16066`)) {
      return;
    }

    setIsBroadcasting(true);
    setIsBroadcastPaused(false);
    stopBroadcastRef.current = false;
    pauseBroadcastRef.current = false;

    setBroadcastProgress({
      sent: 0,
      failed: 0,
      total: audience.length,
      currentPhone: audience[0]?.clean || "",
      activeIndex: 0
    });

    let sent = 0;
    let failed = 0;
    const logs: typeof broadcastLog = [];

    for (let i = 0; i < audience.length; i++) {
      if (stopBroadcastRef.current) {
        showToast("⏹️ Broadcast stopped by operator.");
        break;
      }

      while (pauseBroadcastRef.current) {
        await new Promise(r => setTimeout(r, 500));
        if (stopBroadcastRef.current) break;
      }
      if (stopBroadcastRef.current) break;

      const item = audience[i];
      setBroadcastProgress({
        sent,
        failed,
        total: audience.length,
        currentPhone: item.formatted,
        activeIndex: i + 1
      });

      try {
        const fullPhone = `+91${item.clean}`;
        const res = await fetch("/api/whatsapp/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: fullPhone,
            customerName: "Devotee",
            destination: "Chardham Yatra 2026",
            freeformMessage: activeCampaignMessage,
            customPhoneId: metaConfig.phoneNumberId || undefined,
            customAccessToken: metaConfig.accessToken || undefined
          })
        });

        const resData = await res.json();
        if (res.ok && resData.success) {
          sent++;
          logs.unshift({
            phone: item.formatted,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            status: "success",
            message: "Delivered via Meta Cloud API"
          });
        } else {
          failed++;
          logs.unshift({
            phone: item.formatted,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            status: "failed",
            message: resData.error || "Meta API error"
          });
        }
      } catch (err: any) {
        failed++;
        logs.unshift({
          phone: item.formatted,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          status: "failed",
          message: err.message || "Network error"
        });
      }

      setBroadcastProgress(prev => ({ ...prev, sent, failed }));
      setBroadcastLog([...logs.slice(0, 500)]);

      // Delay between each dispatch
      await new Promise(r => setTimeout(r, broadcastDelaySeconds * 1000));
    }

    setIsBroadcasting(false);
    showToast(`🏁 Broadcast completed! Sent: ${sent}, Failed: ${failed}`);
  };

  const handlePauseResumeBroadcast = () => {
    if (isBroadcastPaused) {
      pauseBroadcastRef.current = false;
      setIsBroadcastPaused(false);
      showToast("▶️ Broadcast resumed");
    } else {
      pauseBroadcastRef.current = true;
      setIsBroadcastPaused(true);
      showToast("⏸️ Broadcast paused");
    }
  };

  const handleStopBroadcast = () => {
    stopBroadcastRef.current = true;
    setIsBroadcasting(false);
    setIsBroadcastPaused(false);
    showToast("⏹️ Broadcast cancelled");
  };

  // Export Campaign Delivery Report as CSV
  const handleExportBroadcastReport = () => {
    if (broadcastLog.length === 0 && parsedBroadcastAudience.validList.length === 0) {
      showToast("No audience or broadcast data to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Phone Number,Clean Digits,Status,Timestamp,Details\n";

    if (broadcastLog.length > 0) {
      broadcastLog.forEach(log => {
        csvContent += `"${log.phone}","${log.phone.replace(/[^0-9]/g, "")}","${log.status}","${log.time}","${(log.message || "").replace(/"/g, '""')}"\n`;
      });
    } else {
      parsedBroadcastAudience.validList.forEach((item) => {
        csvContent += `"${item.formatted}","${item.clean}","Audience Ready","${new Date().toLocaleTimeString()}","Ready for broadcast"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Traymbhkam_Marketing_Broadcast_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📊 Downloaded Broadcast Campaign Report CSV!");
  };

  // Simulate incoming test message to test bot rules
  const handleSimulateIncomingMessage = (text: string) => {
    if (!activeChat) return;
    const customerMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      sender: "customer",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let autoBotMsg: WhatsAppMessage | null = null;
    if (!activeChat.humanTakeover) {
      const rule = matchBotResponse(text);
      autoBotMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: "bot",
        text: rule.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "delivered"
      };
    }

    const updated = chats.map(c => {
      if (c.id === activeChat.id) {
        const msgs = autoBotMsg ? [...c.messages, customerMsg, autoBotMsg] : [...c.messages, customerMsg];
        return {
          ...c,
          lastMessageTime: "Just now",
          messages: msgs
        };
      }
      return c;
    });

    saveChats(updated);
    showToast(`Inquiry simulated: "${text}"`);
  };

  // Open Direct in WhatsApp Web
  const handleOpenWhatsAppWeb = () => {
    if (!activeChat) return;
    const cleanPhone = activeChat.phone.replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(replyText || `Namaste ${activeChat.customerName} ji, warm greetings from Traymbhkam Tour and Travels!`);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
  };

  return (
    <div className="w-full relative">
      {/* --- MOBILE WHATSAPP UI (Shows only on mobile) --- */}
      <div className="block md:hidden -mx-4 -mt-4 bg-[#0b141a] min-h-[calc(100vh-4rem)] text-[#e9edef] font-sans flex flex-col relative pb-20">
        
        {/* WA Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h1 className="text-[22px] font-semibold text-[#e9edef]">WhatsApp</h1>
          <div className="flex items-center gap-5 text-[#aebac1]">
            <IndianRupee className="w-[22px] h-[22px]" />
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mx-4 mt-2 mb-3 bg-[#202c33] rounded-full flex items-center px-4 py-2 gap-3 text-[#8696a0]">
          <Search className="w-4 h-4" />
          <span className="text-[15px] font-normal">Ask Meta AI or Search</span>
        </div>

        {/* Filter Chips */}
        <div className="px-4 flex gap-2 overflow-x-auto hide-scrollbar mb-2">
          <div className="bg-[#111b21] border border-[#202c33] px-4 py-1.5 rounded-full text-sm text-[#00a884] bg-[#00a884]/10 shrink-0">All</div>
          <div className="bg-[#202c33] px-4 py-1.5 rounded-full text-sm text-[#8696a0] shrink-0">Unread 20</div>
          <div className="bg-[#202c33] px-4 py-1.5 rounded-full text-sm text-[#8696a0] shrink-0">Favourites</div>
          <div className="bg-[#202c33] px-4 py-1.5 rounded-full text-sm text-[#8696a0] shrink-0">Groups</div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const isBot = lastMsg?.sender === "bot" || lastMsg?.sender === "agent";
            return (
              <div key={chat.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] active:bg-[#202c33] cursor-pointer" onClick={() => { setSelectedChatId(chat.id); setIsMobileChatOpen(true); }}>
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.customerName)}&background=random`} alt={chat.customerName} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 border-b border-[#202c33] pb-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-[#e9edef] text-base font-normal truncate pr-2">{chat.customerName}</h3>
                    <span className="text-[#8696a0] text-xs shrink-0">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isBot && <CheckCheck className="w-[14px] h-[14px] text-[#53bdeb] shrink-0" />}
                    <p className="text-[#8696a0] text-sm truncate">{lastMsg?.text || "Started conversation"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-20 right-4 w-12 h-12 bg-[#21c063] rounded-2xl flex items-center justify-center shadow-lg z-20 cursor-pointer">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#111b21]"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0b141a] border-t border-[#202c33] flex items-center justify-between px-2 z-30 pb-1">
          <div className="flex-1 flex flex-col items-center justify-center gap-1 text-[#e9edef]">
            <div className="relative">
              <MessageSquare className="w-6 h-6 fill-current" />
              <div className="absolute -top-1 -right-2 bg-[#21c063] text-[#111b21] text-[10px] font-bold px-1.5 py-0.5 rounded-full">20</div>
            </div>
            <span className="text-[11px] font-medium">Chats</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1 text-[#8696a0]">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
            <span className="text-[11px] font-medium">Updates</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1 text-[#8696a0]">
            <Users className="w-6 h-6" />
            <span className="text-[11px] font-medium">Communities</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1 text-[#8696a0]">
            <Phone className="w-6 h-6" />
            <span className="text-[11px] font-medium">Calls</span>
          </div>
        </div>
        {/* Active Chat Overlay (Mobile) */}
        {isMobileChatOpen && activeChat && (
          <div className="absolute inset-0 z-50 bg-[#0b141a] flex flex-col">
            {/* Chat Header */}
            <div className="bg-[#202c33] px-2 py-2 flex items-center gap-3 shrink-0">
              <button onClick={() => setIsMobileChatOpen(false)} className="p-1 rounded-full text-[#aebac1] flex items-center cursor-pointer">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden ml-1">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.customerName)}&background=random`} alt="avatar" className="w-full h-full" />
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-[#e9edef] font-medium text-[17px] leading-tight truncate">{activeChat.customerName}</h2>
                <p className="text-[#8696a0] text-xs truncate">tap here for contact info</p>
              </div>
              <div className="flex items-center gap-4 text-[#aebac1] px-2">
                <Phone className="w-5 h-5" />
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#0b141a] bg-opacity-95" style={{ backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r_QNEW37mXk.png')", backgroundSize: 'cover', backgroundBlendMode: 'overlay' }}>
              <div className="flex flex-col gap-2 pb-6">
                {activeChat.messages.map(msg => {
                  const isCust = msg.sender === "customer";
                  return (
                    <div key={msg.id} className={`flex ${isCust ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[85%] rounded-lg px-3 py-1.5 ${isCust ? "bg-[#202c33] text-[#e9edef] rounded-tl-none" : "bg-[#005c4b] text-[#e9edef] rounded-tr-none"}`}>
                        <p className="text-[15px] leading-snug whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[11px] text-white/60">{msg.timestamp}</span>
                          {!isCust && <CheckCheck className="w-[14px] h-[14px] text-[#53bdeb]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input Bar */}
            <div className="bg-[#202c33] px-2 py-2 flex items-center gap-2 shrink-0 pb-3">
              <div className="flex-1 bg-[#2a3942] rounded-full flex items-center px-3 py-2 gap-3 min-h-[44px]">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#8696a0] shrink-0"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                <input type="text" placeholder="Message" className="flex-1 bg-transparent border-none focus:outline-none text-[#e9edef] text-[15px] placeholder-[#8696a0]" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#8696a0] shrink-0"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#8696a0] shrink-0"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              </div>
              {replyText ? (
                <button onClick={handleSendMessage} className="w-[44px] h-[44px] rounded-full bg-[#00a884] flex items-center justify-center shrink-0 cursor-pointer">
                  <Send className="w-5 h-5 text-[#111b21] ml-1" />
                </button>
              ) : (
                <div className="w-[44px] h-[44px] rounded-full bg-[#00a884] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#111b21]"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- DESKTOP CRM UI (Shows only on desktop) --- */}
      <div className="hidden md:block space-y-4 pb-8">
        {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-gray-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-sm">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                WhatsApp Live Desk & Booking Bot
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                LIVE DESK
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Live customer conversation inbox, booking confirmation dispatcher & Human Takeover supervisor
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh / Sync Chats Button */}
          <button
            type="button"
            onClick={() => loadChatsFromSupabase(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-60"
            title="Fetch latest WhatsApp messages and leads from cloud database"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-700 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Chats"}</span>
          </button>

          {/* Meta API Settings Button */}
          <button
            type="button"
            onClick={() => {
              setModalPhoneId(metaConfig.phoneNumberId || "1291621467367556");
              setModalToken(metaConfig.accessToken || "");
              setTokenTestResult(null);
              setIsTokenModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 text-gray-700 hover:text-emerald-900 text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Configure or refresh Meta WhatsApp Cloud API credentials"
          >
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>Meta API Keys</span>
            <span className={`w-2 h-2 rounded-full ${metaConfig.accessToken ? "bg-emerald-500" : "bg-amber-500"}`} />
          </button>

          {/* 250 / Per Day Quota Gauge Pill */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/60 to-sky-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="min-w-[170px]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950">Daily Quota:</span>
                <span className="font-mono font-extrabold text-emerald-700 text-[11.5px]">
                  {stats.todaySentCount} / {stats.dailyLimit} per day
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-emerald-200/60 rounded-full h-2 mt-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.usagePercent}%` }}
                />
              </div>
              <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
                {stats.remainingQuota} free conversations remaining today
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Tab Mode Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-gray-100/90 p-1.5 rounded-2xl border border-gray-200">
        <button
          type="button"
          onClick={() => setActiveDeskTab("inbox")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeDeskTab === "inbox"
              ? "bg-white text-emerald-950 shadow-xs border border-emerald-300 ring-2 ring-emerald-500/10"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
          }`}
        >
          <MessageSquare className={`w-4 h-4 ${activeDeskTab === "inbox" ? "text-emerald-600" : "text-gray-400"}`} />
          <span>Live Chats &amp; Lead Qualification</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
            {chats.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeskTab("broadcast")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeDeskTab === "broadcast"
              ? "bg-white text-indigo-950 shadow-xs border border-indigo-300 ring-2 ring-indigo-500/10"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
          }`}
        >
          <Users className={`w-4 h-4 ${activeDeskTab === "broadcast" ? "text-indigo-600" : "text-gray-400"}`} />
          <span>Bulk Marketing &amp; Broadcast (5,000 Audience)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800">
            {parsedBroadcastAudience.validCount > 0 ? `${parsedBroadcastAudience.validCount} Valid` : "5,000 Cap"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeskTab("sim_setup")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeDeskTab === "sim_setup"
              ? "bg-white text-teal-950 shadow-xs border border-teal-300 ring-2 ring-teal-500/10"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
          }`}
        >
          <Radio className={`w-4 h-4 ${activeDeskTab === "sim_setup" ? "text-teal-600" : "text-gray-400"}`} />
          <span>SIM Arrival &amp; Meta WhatsApp Ready Setup</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800">
            Plug &amp; Play
          </span>
        </button>
      </div>

      {activeDeskTab === "inbox" && (
        <>
          {/* Analytics Metric Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase font-bold text-gray-400 tracking-wider block">Active Chats</span>
            <span className="text-xl font-black text-gray-900">{stats.totalChats}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase font-bold text-gray-400 tracking-wider block">Confirmed Yatras</span>
            <span className="text-xl font-black text-emerald-700">{stats.confirmedBookings}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase font-bold text-gray-400 tracking-wider block">AI Bot Managed</span>
            <span className="text-xl font-black text-purple-700">{stats.botActive}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase font-bold text-gray-400 tracking-wider block">Human Takeover</span>
            <span className="text-xl font-black text-amber-700">{stats.humanTakeovers}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main 2-Pane Chat Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px]">
        
        {/* LEFT PANE: Chat List (5 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col overflow-hidden h-full">
          
          {/* Search & Filter Header */}
          <div className="p-3.5 border-b border-gray-100 space-y-2.5 bg-gray-50/60 shrink-0">
            {/* Search + New Chat Button */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats or phone..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const phoneInput = prompt("Enter 10-digit WhatsApp number (e.g. 9719038278):");
                  if (!phoneInput) return;
                  const nameInput = prompt("Enter Customer / Devotee Name:", "Valued Devotee") || "Valued Devotee";
                  const cleanPhone = phoneInput.replace(/[^0-9]/g, "");
                  const newChat: WhatsAppChat = {
                    id: `chat-${Date.now()}`,
                    customerName: nameInput,
                    phone: cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91 ${cleanPhone}`,
                    destination: "Chardham Yatra 2026",
                    humanTakeover: true,
                    unreadCount: 0,
                    lastMessageTime: "Just now",
                    status: "inquiry",
                    messages: [
                      {
                        id: `msg-${Date.now()}`,
                        sender: "agent",
                        text: `Namaste ${nameInput} ji! Warm greetings from Traymbhkam Tour and Travels. How may we assist your holy yatra today?`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]
                  };
                  const updated = [newChat, ...chats.filter(c => c.phone !== newChat.phone)];
                  saveChats(updated);
                  setSelectedChatId(newChat.id);
                  showToast(`✓ Started new WhatsApp conversation with ${newChat.customerName} (${newChat.phone})`);
                }}
                className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                title="Start a new WhatsApp chat with any phone number"
              >
                <span>+ New</span>
              </button>
            </div>

            {/* Filter Pills + Clear Dummy button */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 flex-1">
                {[
                  { id: "all", label: "All" },
                  { id: "bot", label: "Bot" },
                  { id: "human", label: "Human" },
                  { id: "confirmed", label: "Confirmed" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterMode(f.id as any)}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      filterMode === f.id
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {chats.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Erase all WhatsApp chat logs and start fresh?")) {
                      saveChats([]);
                      setSelectedChatId("");
                      showToast("✓ All WhatsApp chat logs erased.");
                    }
                  }}
                  className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 shrink-0 cursor-pointer"
                  title="Clear all chat history"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Chat List Scrollable Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No conversations match your filter.
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = chat.id === activeChat?.id;
                const lastMsg = chat.messages[chat.messages.length - 1];
                return (
                  <div
                    key={chat.id}
                    onClick={() => { setSelectedChatId(chat.id); setIsMobileChatOpen(true); }}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-emerald-50/70 border-l-4 border-emerald-600" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Devotee Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center shadow-2xs">
                        {chat.customerName.charAt(0)}
                      </div>
                      {/* Bot / Human Takeover mini badge */}
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold border border-white shadow-2xs ${
                        chat.humanTakeover ? "bg-amber-500" : "bg-purple-600"
                      }`} title={chat.humanTakeover ? "Human Takeover" : "AI Bot Active"}>
                        {chat.humanTakeover ? "H" : "B"}
                      </span>
                    </div>

                    {/* Chat Preview Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {chat.customerName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {chat.lastMessageTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10.5px] text-gray-500 font-mono mt-0.5">
                        <Phone className="w-2.5 h-2.5 text-gray-400" />
                        <span>{chat.phone}</span>
                      </div>

                      <p className="text-[11px] text-gray-600 truncate mt-1">
                        {lastMsg ? lastMsg.text : "New conversation started"}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded font-bold bg-sky-50 text-sky-700 border border-sky-200 truncate max-w-[140px]">
                          {chat.destination}
                        </span>
                        {chat.status === "confirmed" && (
                          <span className="text-[9.5px] px-1.5 py-0.2 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ✓ Confirmed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: Live Active Conversation Stream (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col overflow-hidden h-full">
          
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-xs">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">No Active Chat Selected</h3>
              <p className="text-xs text-gray-500 max-w-sm mb-4">
                Click <b>"+ New"</b> in the left panel to start a fresh WhatsApp conversation with any devotee, or select an existing chat.
              </p>
              <button
                type="button"
                onClick={() => {
                  const phoneInput = prompt("Enter 10-digit WhatsApp number (e.g. 9719038278):");
                  if (!phoneInput) return;
                  const nameInput = prompt("Enter Customer / Devotee Name:", "Valued Devotee") || "Valued Devotee";
                  const cleanPhone = phoneInput.replace(/[^0-9]/g, "");
                  const newChat: WhatsAppChat = {
                    id: `chat-${Date.now()}`,
                    customerName: nameInput,
                    phone: cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91 ${cleanPhone}`,
                    destination: "Chardham Yatra 2026",
                    humanTakeover: true,
                    unreadCount: 0,
                    lastMessageTime: "Just now",
                    status: "inquiry",
                    messages: [
                      {
                        id: `msg-${Date.now()}`,
                        sender: "agent",
                        text: `Namaste ${nameInput} ji! Warm greetings from Traymbhkam Tour and Travels. How may we assist your holy yatra today?`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]
                  };
                  saveChats([newChat, ...chats]);
                  setSelectedChatId(newChat.id);
                  showToast(`✓ Started conversation with ${newChat.customerName}`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>+ Start New Chat</span>
              </button>
            </div>
          ) : (
            <>
              {/* Chat Header with Human Takeover Switch */}
              <div className="px-5 py-3.5 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-xs">
                    {activeChat.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-gray-900">
                        {activeChat.customerName}
                      </h2>
                      <span className="text-[10px] font-mono text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded">
                        {activeChat.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-600 mt-0.5">
                      <span className="text-sky-700 font-semibold">{activeChat.destination}</span>
                      {activeChat.travelDates && <span>• 📅 {activeChat.travelDates}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Lead Qualification Stage Selector */}
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                    <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Lead:</span>
                    <select
                      value={activeChat.leadQualificationStage || (activeChat.status === "confirmed" ? "confirmed" : "unqualified")}
                      onChange={(e) => {
                        const stage = e.target.value as any;
                        const updated = chats.map(c => c.id === activeChat.id ? { 
                          ...c, 
                          leadQualificationStage: stage,
                          status: stage === "confirmed" ? "confirmed" : c.status
                        } : c);
                        saveChats(updated);
                        showToast(`✓ Lead status updated to: ${stage.replace(/_/g, " ").toUpperCase()}`);
                      }}
                      className="text-xs font-bold text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer"
                    >
                      <option value="unqualified">⚪ Unqualified Lead</option>
                      <option value="interested">🟡 Interested Devotee</option>
                      <option value="dates_pax_shared">🔵 Dates & Pax Shared</option>
                      <option value="itinerary_sent">🟣 Itinerary / Quote Sent</option>
                      <option value="ready_to_book">🟠 Ready to Book (Advance Pending)</option>
                      <option value="confirmed">🟢 Confirmed Yatra</option>
                    </select>
                  </div>

                  {/* Human Takeover Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleHumanTakeover(activeChat.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border ${
                      activeChat.humanTakeover
                        ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600"
                        : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                    }`}
                    title="Toggle between Automated AI Bot and Manual Human Takeover"
                  >
                    {activeChat.humanTakeover ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Human Takeover Active</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 text-purple-600" />
                        <span>AI Bot Handling (Click to Take Over)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

          {/* Quick Pre-Actions Bar */}
          <div className="px-5 py-2 bg-slate-50 border-b border-gray-200 flex flex-wrap items-center gap-1.5 text-xs shrink-0">
            <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mr-1">Lead Qualify & Actions:</span>
            
            {/* Pilgrim Lead Questionnaire */}
            <button
              type="button"
              onClick={() => handleLoadLeadTemplate("questionnaire")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition cursor-pointer shadow-2xs"
              title="Send 5-point pilgrim qualification questionnaire (dates, pax, destination, pickup, hotel)"
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-200" />
              <span>📋 Qualify Pilgrim</span>
            </button>

            {/* Chardham 10D Brochure & Quote */}
            <button
              type="button"
              onClick={() => handleLoadLeadTemplate("chardham")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-[11px] font-bold transition cursor-pointer"
              title="Load Chardham 9N/10D itinerary brochure, inclusions and starting rates"
            >
              <Compass className="w-3 h-3 text-sky-600" />
              <span>🚩 Chardham 10D</span>
            </button>

            {/* Kedarnath 4D Package */}
            <button
              type="button"
              onClick={() => handleLoadLeadTemplate("kedarnath")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-bold transition cursor-pointer"
              title="Load Kedarnath 3N/4D direct package & hotel inclusions"
            >
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>🛕 Kedarnath 4D</span>
            </button>

            {/* Taxi & Fleet Tariffs */}
            <button
              type="button"
              onClick={() => handleLoadLeadTemplate("taxi")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold transition cursor-pointer"
              title="Load Haridwar/Dehradun taxi fleet tariffs (Dzire, Ertiga, Innova, Tempo)"
            >
              <SlidersHorizontal className="w-3 h-3 text-amber-600" />
              <span>🚕 Taxi Tariffs</span>
            </button>

            {/* AI Auto-Suggest / Rule Matcher */}
            <button
              type="button"
              onClick={handleAutoSuggestReply}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition cursor-pointer shadow-2xs"
              title="Auto-detect customer inquiry and match the exact bot rule response"
            >
              <Bot className="w-3 h-3" />
              <span>AI Match & Reply</span>
            </button>

            {/* Helicopter IRCTC Advisory */}
            <button
              type="button"
              onClick={() => handleLoadRule("helicopter")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold transition cursor-pointer"
              title="Multilingual warning: No copter booking, fraud alert, official IRCTC link"
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>Helicopter IRCTC Alert</span>
            </button>

            {/* Helpline & Official Contact */}
            <button
              type="button"
              onClick={() => handleLoadRule("sales")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-bold transition cursor-pointer"
              title="Forward official contact for Mr. Gagandeep (Hunny) (+91 82660 16066)"
            >
              <Phone className="w-3 h-3 text-indigo-600" />
              <span>Official Contact</span>
            </button>

            {/* 1-Click Booking Confirmation */}
            <button
              type="button"
              onClick={handleSendBookingConfirmation}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-[11px] font-bold transition cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3 text-teal-600" />
              <span>Booking Confirm</span>
            </button>

            {/* Send Hello World Template (Opens 24-hr session) */}
            <button
              type="button"
              onClick={handleSendHelloWorldTemplate}
              disabled={isSending}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition cursor-pointer shadow-2xs disabled:opacity-50"
              title="Send Meta-approved Hello World template to start/open the 24-hour customer conversation window"
            >
              <Send className="w-3 h-3" />
              <span>👋 Hello World</span>
            </button>
          </div>

          {/* Test Customer Inquiries Simulator */}
          <div className="px-5 py-1.5 bg-gray-100/70 border-b border-gray-200 flex flex-wrap items-center gap-1.5 text-[10px] shrink-0">
            <span className="text-gray-500 font-semibold">Test Inquiries:</span>
            <button
              type="button"
              onClick={() => handleSimulateIncomingMessage("GST bill milega kya package par?")}
              className="px-2 py-0.5 bg-white hover:bg-amber-50 text-gray-700 hover:text-amber-900 rounded border border-gray-300 font-medium transition cursor-pointer"
            >
              🧪 &quot;GST bill milega?&quot;
            </button>
            <button
              type="button"
              onClick={() => handleSimulateIncomingMessage("Kedarnath helicopter ticket book karni hai")}
              className="px-2 py-0.5 bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-900 rounded border border-gray-300 font-medium transition cursor-pointer"
            >
              🧪 &quot;Helicopter ticket?&quot;
            </button>
            <button
              type="button"
              onClick={() => handleSimulateIncomingMessage("Package ka price kitna hai aur payment account bhejo")}
              className="px-2 py-0.5 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-900 rounded border border-gray-300 font-medium transition cursor-pointer"
            >
              🧪 &quot;Package price &amp; payment?&quot;
            </button>
            <button
              type="button"
              onClick={() => handleSimulateIncomingMessage("Nainital aur Jim Corbett tour package kab available hai?")}
              className="px-2 py-0.5 bg-white hover:bg-sky-50 text-gray-700 hover:text-sky-900 rounded border border-gray-300 font-medium transition cursor-pointer"
            >
              🧪 &quot;Nainital / Corbett trip?&quot;
            </button>
            <button
              type="button"
              onClick={() => handleSimulateIncomingMessage("Sales person ka contact number de dijiye")}
              className="px-2 py-0.5 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-900 rounded border border-gray-300 font-medium transition cursor-pointer"
            >
              🧪 &quot;Sales person number?&quot;
            </button>
          </div>

          {/* Chat Messages Stream (Scrollable) */}
          <div 
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#efeae2]/30 custom-scrollbar"
            style={{
              backgroundImage: "radial-gradient(#cbd5e1 0.75px, transparent 0.75px)",
              backgroundSize: "16px 16px"
            }}
          >
            {/* Spiritual Date separator */}
            <div className="text-center my-2">
              <span className="bg-white/90 border border-gray-200 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                🙏 ॐ नमः शिवाय · Official Traymbhkam Tour and Travels WhatsApp
              </span>
            </div>

            {activeChat.messages.map((msg) => {
              const isCustomer = msg.sender === "customer";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed whitespace-pre-wrap ${
                      isCustomer
                        ? "bg-white text-gray-900 rounded-tl-xs border border-gray-200"
                        : msg.sender === "bot"
                        ? "bg-purple-50 text-purple-950 rounded-tr-xs border border-purple-200"
                        : "bg-[#d9fdd3] text-gray-900 rounded-tr-xs border border-emerald-300"
                    }`}
                  >
                    {/* Sender Identity Indicator */}
                    {!isCustomer && (
                      <div className="flex items-center gap-1 text-[10px] font-bold mb-1">
                        {msg.sender === "bot" ? (
                          <span className="text-purple-700 flex items-center gap-0.5">
                            <Bot className="w-3 h-3" /> AI Assistant
                          </span>
                        ) : (
                          <span className="text-emerald-800 flex items-center gap-0.5">
                            <UserCheck className="w-3 h-3" /> Human Operator (Mr. Gagandeep - Hunny)
                          </span>
                        )}
                      </div>
                    )}

                    <p>{msg.text}</p>

                    <div className="flex items-center justify-end gap-1 mt-1 text-[9.5px] text-gray-400">
                      <span>{msg.timestamp}</span>
                      {!isCustomer && (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-500 inline" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Message Input Box */}
          <div className="p-3.5 border-t border-gray-200 bg-white space-y-2 shrink-0">
            {/* Matched Rule Banner */}
            {matchedRuleInfo && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                  <span className="font-bold">{matchedRuleInfo.title}:</span>
                  <span className="text-[11px] text-purple-700 hidden sm:inline">{matchedRuleInfo.description}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMatchedRuleInfo(null)}
                  className="text-purple-400 hover:text-purple-700 text-xs font-bold px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={activeChat.humanTakeover 
                  ? "Type your message as Human Operator..." 
                  : "Type message or trigger automated templates..."}
                className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <div className="flex flex-col gap-1.5 shrink-0">
                {/* Send via API */}
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!replyText.trim() || isSending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Send via Meta Cloud WhatsApp API"
                >
                  {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send</span>
                </button>

                {/* Direct WhatsApp Web button */}
                <button
                  type="button"
                  onClick={handleOpenWhatsAppWeb}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Open in WhatsApp Web"
                >
                  <span>WhatsApp Web</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10.5px] text-gray-400 px-1">
              <span>Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line</span>
              <span className="text-emerald-700 font-semibold">
                ● Connected to +91 82660 16066 (Traymbhkam Tour and Travels)
              </span>
            </div>
          </div>

          </>
          )}
        </div>

      </div>
      </>
      )}

      {/* TAB 2: BULK MARKETING & BROADCAST SUITE (5,000 NUMBERS) */}
      {activeDeskTab === "broadcast" && (
        <div className="space-y-4">
          {/* Header & Guidance Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-indigo-700/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    5,000 AUDIENCE ENGINE
                  </span>
                  <span className="text-xs text-indigo-300">
                    Anti-Ban Throttled &bull; CSV/Excel Import &bull; Meta Approved
                  </span>
                </div>
                <h2 className="text-lg font-black tracking-tight mt-1 text-white flex items-center gap-2">
                  <span>Bulk Marketing &amp; Devotee Broadcast Suite</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </h2>
                <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
                  Campaign messages dispatch directly under <strong>Mr. Gagandeep (Hunny)</strong> (+91 82660 16066). Paste up to 5,000 mobile numbers or upload a spreadsheet. The system automatically scrubs invalid characters, standardizes +91 country prefixes, and eliminates duplicates.
                </p>
              </div>

              <div className="bg-indigo-950/60 border border-indigo-500/40 rounded-xl p-3 shrink-0 text-right">
                <span className="text-[10px] uppercase font-bold text-indigo-300 block">Authorized Representative</span>
                <span className="text-xs font-black text-amber-300 block">Mr. Gagandeep (Hunny)</span>
                <span className="text-[11px] font-mono text-emerald-300 font-bold block">+91 82660 16066</span>
              </div>
            </div>

            {/* Anti-Ban Safety Advisory Alert */}
            <div className="mt-4 p-3 bg-indigo-950/80 rounded-xl border border-indigo-600/40 flex items-start gap-2.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-indigo-100 text-[11.5px]">
                <p>
                  <strong>Anti-Ban &amp; Delivery Rule:</strong> For cold broadcasts to 5,000 numbers, Meta Cloud API requires pre-approved templates or customer-initiated sessions. We have configured an automatic <strong>Throttle Delay (1.5s - 5.0s)</strong>.
                </p>
                <p className="text-indigo-300 text-[10.5px]">
                  💡 <em>Zero-API Fallback:</em> You can also use our <strong>&quot;WhatsApp Web Sequential Queue&quot;</strong> below to dispatch with 1-click preview directly from your browser without waiting for API tokens or new SIM activation!
                </p>
              </div>
            </div>
          </div>

          {/* 4 Audience Health Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-[10.5px] uppercase font-bold text-gray-400 tracking-wider block">Total Input Items</span>
              <span className="text-2xl font-black text-gray-900 mt-0.5 block">{parsedBroadcastAudience.totalRaw}</span>
              <span className="text-[10.5px] text-gray-500 mt-1 block">Tokens parsed from text/file</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <span className="text-[10.5px] uppercase font-bold text-emerald-800 tracking-wider block">Valid +91 Mobiles</span>
              <span className="text-2xl font-black text-emerald-700 mt-0.5 block">{parsedBroadcastAudience.validCount}</span>
              <span className="text-[10.5px] text-emerald-700 font-medium mt-1 block">Unique 10-digit Indian numbers</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
              <span className="text-[10.5px] uppercase font-bold text-amber-800 tracking-wider block">Duplicates Filtered</span>
              <span className="text-2xl font-black text-amber-700 mt-0.5 block">{parsedBroadcastAudience.duplicates}</span>
              <span className="text-[10.5px] text-amber-700 font-medium mt-1 block">Repeat entries safely skipped</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
              <span className="text-[10.5px] uppercase font-bold text-rose-800 tracking-wider block">Invalid / Discarded</span>
              <span className="text-2xl font-black text-rose-700 mt-0.5 block">{parsedBroadcastAudience.invalid}</span>
              <span className="text-[10.5px] text-rose-700 font-medium mt-1 block">Short, landline or bad formats</span>
            </div>
          </div>

          {/* Main 2-Column Campaign Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* LEFT COLUMN: Number Input & File Upload (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-sm text-gray-900">Audience List (Up to 5,000)</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                    {parsedBroadcastAudience.validCount} / 5,000
                  </span>
                </div>

                {/* Upload & Quick Action Bar */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Upload CSV / TXT</span>
                    <input
                      type="file"
                      accept=".csv,.txt,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const demo = "9876543210\n9812345678\n9719038278\n8266016066\n9389880277\n9897123456\n9412098765\n9557112233\n9837012345\n9760123456";
                      setBroadcastNumbersText(demo);
                      showToast("Loaded 10 demo devotee contacts for testing!");
                    }}
                    className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Load Sample
                  </button>

                  {broadcastNumbersText && (
                    <button
                      type="button"
                      onClick={() => setBroadcastNumbersText("")}
                      className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer ml-auto"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Large Textarea for 5,000 Numbers */}
                <div className="mt-3">
                  <textarea
                    rows={11}
                    value={broadcastNumbersText}
                    onChange={(e) => setBroadcastNumbersText(e.target.value)}
                    placeholder="Paste up to 5,000 numbers here...&#10;&#10;Supported formats:&#10;• 9876543210&#10;• +91 98765 43210&#10;• 09876543210&#10;• Comma, tab or newline separated"
                    className="w-full p-3 font-mono text-xs bg-gray-50/70 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Parsed Preview Card */}
              {parsedBroadcastAudience.validCount > 0 ? (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                  <div className="flex items-center justify-between mb-1.5 font-bold">
                    <span className="flex items-center gap-1 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Audience Sanitized &amp; Ready</span>
                    </span>
                    <span className="font-mono text-[11px] text-emerald-700">
                      {parsedBroadcastAudience.validCount} numbers
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 font-mono text-[11px] text-emerald-900">
                    {parsedBroadcastAudience.validList.slice(0, 5).map((v, i) => (
                      <span key={i} className="bg-white/80 px-2 py-0.5 rounded border border-emerald-300">
                        {v.formatted}
                      </span>
                    ))}
                    {parsedBroadcastAudience.validCount > 5 && (
                      <span className="px-2 py-0.5 text-emerald-700 italic">
                        +{parsedBroadcastAudience.validCount - 5} more devotees
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 text-center italic py-2">
                  No contacts entered yet. Paste or upload your numbers to begin.
                </p>
              )}
            </div>

            {/* RIGHT COLUMN: Campaign Message Composer & Dispatcher (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-sm text-gray-900">Spiritual Campaign Message</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500">
                    Signature: Mr. Gagandeep (Hunny)
                  </span>
                </div>

                {/* Campaign Template Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-3">
                  {[
                    { key: "chardham", label: "🚩 Char Dham 2026" },
                    { key: "kedarnath", label: "🛕 Kedarnath 4D" },
                    { key: "taxi", label: "🚕 Hill Taxi Fleet" },
                    { key: "custom", label: "✍️ Custom Text" }
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setCampaignTemplateKey(t.key as any)}
                      className={`py-1.5 px-2 text-xs font-bold rounded-xl transition cursor-pointer border ${
                        campaignTemplateKey === t.key
                          ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Message Content Area */}
                <div className="mt-3 relative">
                  <textarea
                    rows={9}
                    value={campaignTemplateKey === "custom" ? customBroadcastMessage : BULK_CAMPAIGN_TEMPLATES[campaignTemplateKey]}
                    onChange={(e) => {
                      if (campaignTemplateKey === "custom") {
                        setCustomBroadcastMessage(e.target.value);
                      }
                    }}
                    readOnly={campaignTemplateKey !== "custom"}
                    placeholder={campaignTemplateKey === "custom" ? "Type your custom bulk broadcast message here..." : ""}
                    className={`w-full p-3.5 text-xs rounded-xl border leading-relaxed resize-none focus:outline-none ${
                      campaignTemplateKey === "custom"
                        ? "bg-white border-indigo-300 focus:ring-2 focus:ring-indigo-500 text-gray-900 font-sans"
                        : "bg-gray-50/80 border-gray-200 text-gray-800 select-all cursor-default"
                    }`}
                  />
                  {campaignTemplateKey !== "custom" && (
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomBroadcastMessage(BULK_CAMPAIGN_TEMPLATES[campaignTemplateKey]);
                          setCampaignTemplateKey("custom");
                          showToast("Copied template to Custom Editor. You can now edit any text!");
                        }}
                        className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold shadow-2xs cursor-pointer"
                        title="Click to customize this preset text"
                      >
                        Edit This Template
                      </button>
                    </div>
                  )}
                </div>

                {/* Anti-Ban Throttle & Safety Settings */}
                <div className="mt-3 p-3 bg-slate-50 border border-gray-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-bold text-gray-700">Throttle Delay:</span>
                    <div className="flex items-center gap-1">
                      {[
                        { sec: 1.5, label: "1.5s (Fast)" },
                        { sec: 3, label: "3.0s (Safe)" },
                        { sec: 5, label: "5.0s (Anti-Ban)" }
                      ].map((d) => (
                        <button
                          key={d.sec}
                          type="button"
                          onClick={() => setBroadcastDelaySeconds(d.sec)}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                            broadcastDelaySeconds === d.sec
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <span className="text-[10.5px] text-gray-500">
                    Est. Speed: ~{Math.round(60 / broadcastDelaySeconds)} msgs/min
                  </span>
                </div>

                {/* Test Send Box to Gagandeep */}
                <div className="mt-3 flex items-center gap-2 p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
                  <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="font-bold text-amber-950 shrink-0">Test to Gagandeep:</span>
                  <input
                    type="text"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="+91 82660 16066"
                    className="flex-1 px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-mono text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestBroadcast}
                    disabled={isSendingTest}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isSendingTest ? "Sending..." : "Send Test"}
                  </button>
                </div>
              </div>

              {/* Primary Dispatch Action Controls */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!isBroadcasting ? (
                    <button
                      type="button"
                      onClick={handleStartBroadcast}
                      disabled={parsedBroadcastAudience.validCount === 0}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Launch Broadcast ({parsedBroadcastAudience.validCount} Devotees)</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePauseResumeBroadcast}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {isBroadcastPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5 fill-white" />}
                        <span>{isBroadcastPaused ? "Resume" : "Pause"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStopBroadcast}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Stop</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleExportBroadcastReport}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Export audience and broadcast log to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-gray-600" />
                  <span>Export Report (CSV)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Progress Bar & Activity Monitor */}
          {(isBroadcasting || broadcastProgress.total > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isBroadcasting ? "bg-emerald-500 animate-ping" : "bg-gray-400"}`} />
                  <h3 className="font-bold text-sm text-gray-900">
                    Live Broadcast Status: {isBroadcasting ? "Broadcasting in Progress..." : "Broadcast Completed"}
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono font-bold">
                  <span className="text-emerald-700">✓ Sent: {broadcastProgress.sent}</span>
                  <span className="text-rose-600">✕ Failed: {broadcastProgress.failed}</span>
                  <span className="text-gray-500">Total: {broadcastProgress.total}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-gray-600">
                    Currently dispatching: <span className="font-mono text-indigo-700">{broadcastProgress.currentPhone || "Initiating..."}</span>
                  </span>
                  <span className="font-mono text-indigo-700">
                    {Math.round(((broadcastProgress.sent + broadcastProgress.failed) / (broadcastProgress.total || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, Math.round(((broadcastProgress.sent + broadcastProgress.failed) / (broadcastProgress.total || 1)) * 100))}%` 
                    }}
                  />
                </div>
              </div>

              {/* Live Event Log */}
              {broadcastLog.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar border border-gray-100 rounded-xl p-2 bg-gray-50/60 font-mono text-[11px]">
                  {broadcastLog.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 px-2 rounded hover:bg-white transition">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${log.status === "success" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        <span className="text-gray-900 font-bold">{log.phone}</span>
                        <span className="text-gray-500">{log.message}</span>
                      </div>
                      <span className="text-gray-400 text-[10px]">{log.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WhatsApp Web Sequential Queue (Zero-Cost / Immediate Pre-SIM Dispatcher) */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-sky-50 rounded-2xl border border-emerald-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900">
                    ZERO COST &bull; NO API TOKEN REQUIRED
                  </span>
                  <h3 className="font-bold text-sm text-emerald-950">
                    WhatsApp Web Sequential Dispatcher Queue
                  </h3>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Send to all 5,000 devotees 1-by-1 directly via WhatsApp Web without waiting for Meta API keys or new SIM!
                </p>
              </div>

              {parsedBroadcastAudience.validCount > 0 && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-emerald-900">
                    Devotee {webQueueIndex + 1} of {parsedBroadcastAudience.validCount}
                  </span>
                </div>
              )}
            </div>

            {parsedBroadcastAudience.validCount > 0 ? (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 p-4 rounded-xl border border-emerald-200 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    {webQueueIndex + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Target Devotee Number:
                    </span>
                    <span className="text-sm font-mono font-extrabold text-emerald-700">
                      {parsedBroadcastAudience.validList[webQueueIndex]?.formatted}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={webQueueIndex === 0}
                    onClick={() => setWebQueueIndex(prev => Math.max(0, prev - 1))}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-40"
                  >
                    ⬅️ Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const cur = parsedBroadcastAudience.validList[webQueueIndex];
                      if (!cur) return;
                      const encoded = encodeURIComponent(activeCampaignMessage);
                      window.open(`https://wa.me/91${cur.clean}?text=${encoded}`, "_blank");
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Open in WhatsApp Web</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    disabled={webQueueIndex >= parsedBroadcastAudience.validCount - 1}
                    onClick={() => setWebQueueIndex(prev => Math.min(parsedBroadcastAudience.validCount - 1, prev + 1))}
                    className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-40"
                  >
                    <span>Next Devotee</span>
                    <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-emerald-800 text-center py-3">
                Paste or upload phone numbers above to unlock the 1-click WhatsApp Web queue.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SIM ARRIVAL & META WHATSAPP READY SETUP */}
      {activeDeskTab === "sim_setup" && (
        <div className="space-y-4">
          {/* Status Hero Card */}
          <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-teal-700/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    SIM READY ARCHITECTURE
                  </span>
                  <span className="text-xs text-teal-300">
                    Plug-and-Play &bull; Instant Meta Activation
                  </span>
                </div>
                <h2 className="text-lg font-black tracking-tight mt-1 text-white flex items-center gap-2">
                  <span>New SIM Card &amp; Meta WhatsApp Setup Guide</span>
                  <Radio className="w-4 h-4 text-emerald-400" />
                </h2>
                <p className="text-xs text-teal-200 mt-1 max-w-2xl leading-relaxed">
                  Agency ne abhi new SIM card provide nahi ki hai, par software ka pura infrastructure (lead qualify bot, spiritual campaigns, bulk marketing dispatcher, booking vouchers) 100% ready hai! Jaise hi SIM milti hai, niche diye gaye 6 aasan steps karke WhatsApp turant live ho jayega.
                </p>
              </div>

              <div className="bg-teal-950/70 border border-teal-500/40 rounded-xl p-3 shrink-0 text-right">
                <span className="text-[10px] uppercase font-bold text-teal-300 block">Current Status</span>
                <span className="text-xs font-black text-amber-300 block">⏳ Awaiting SIM Delivery</span>
                <span className="text-[11px] font-mono text-emerald-300 font-bold block">100% Prepared</span>
              </div>
            </div>
          </div>

          {/* 6-Step Visual Interactive Roadmap */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5">
            <h3 className="font-black text-sm text-gray-900 mb-1 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Step-by-Step SIM Arrival Checklist (When SIM is Received)</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Follow these simple steps in order to connect your new SIM with Meta Cloud API.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                {
                  step: "01",
                  title: "Insert SIM in Phone",
                  desc: "Nayi SIM ko kisi bhi mobile phone me dalein aur incoming SMS / Call verify karein taaki Meta ka 6-digit verification code receive ho sake.",
                  status: "Pending SIM arrival"
                },
                {
                  step: "02",
                  title: "Open Meta Business Manager",
                  desc: "Meta Developer / Business Manager (business.facebook.com) open karein aur Traymbhkam Tour and Travels ke WhatsApp Account me jayein.",
                  status: "Meta Account Ready"
                },
                {
                  step: "03",
                  title: "Add Number & Enter OTP",
                  desc: "WhatsApp Setup me '+91' ke saath naya SIM number register karein. Mobile par aane wala 6-digit OTP enter karke number verify karein.",
                  status: "Requires SIM"
                },
                {
                  step: "04",
                  title: "Copy Phone Number ID",
                  desc: "Meta portal par generate hua 15-16 digit 'Phone Number ID' copy karein aur niche diye credentials box me paste karein.",
                  status: "One-Click Paste"
                },
                {
                  step: "05",
                  title: "Generate Permanent Token",
                  desc: "Meta System Users section se permanent token generate karein with 'whatsapp_business_messaging' permission taaki 24h expire na ho.",
                  status: "Permanent Token"
                },
                {
                  step: "06",
                  title: "Webhook Activation",
                  desc: "Webhook URL (/api/whatsapp/webhook) aur verify token (traymbhkam_wa_webhook_token_2026) daal kar messages subscription enable karein.",
                  status: "Route Pre-built"
                }
              ].map((s) => (
                <div key={s.step} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-emerald-50/30 transition flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                        {s.step}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {s.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-gray-900 mt-2">{s.title}</h4>
                    <p className="text-[11.5px] text-gray-600 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credentials Manager & Live Tester */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Input Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-gray-900">Live Meta WhatsApp API Credentials</h3>
                </div>
                <a
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1"
                >
                  <span>Meta Developers Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {tokenTestResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  tokenTestResult.success 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}>
                  {tokenTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed font-semibold">{tokenTestResult.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Meta Phone Number ID (from API Setup)
                </label>
                <input
                  type="text"
                  value={modalPhoneId || metaConfig.phoneNumberId || "1291621467367556"}
                  onChange={(e) => setModalPhoneId(e.target.value)}
                  placeholder="e.g. 1291621467367556"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Permanent Access Token (starts with EAAT...)
                </label>
                <textarea
                  rows={3}
                  value={modalToken || metaConfig.accessToken}
                  onChange={(e) => setModalToken(e.target.value)}
                  placeholder="Paste permanent Meta access token here..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-gray-500">
                  Stored securely in local storage &amp; cloud session.
                </span>
                <button
                  type="button"
                  onClick={handleTestAndSaveToken}
                  disabled={isTestingToken}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isTestingToken ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying with Meta API...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify &amp; Save Live Connection</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Webhook Details & Official Info (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Webhook Configuration Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-gray-900">Webhook Integration Config</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Callback URL</span>
                    <code className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded block border border-emerald-200 truncate mt-0.5 font-mono">
                      https://hunny-travelcrm.vercel.app/api/whatsapp/webhook
                    </code>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Verify Token</span>
                    <code className="text-[11px] text-gray-800 bg-gray-100 px-2 py-1 rounded block border border-gray-200 mt-0.5 font-mono">
                      traymbhkam_wa_webhook_token_2026
                    </code>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Subscribed Webhook Fields</span>
                    <span className="text-[11px] text-gray-700 font-semibold block mt-0.5">
                      ✓ messages &bull; message_deliveries &bull; message_reads
                    </span>
                  </div>
                </div>
              </div>

              {/* Authorized Identity Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200 p-5 space-y-2 text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  <h4 className="font-black text-amber-950">Authorized Agency Identity</h4>
                </div>
                <div className="space-y-1 text-amber-900 pt-1">
                  <p><strong>Agency:</strong> Traymbhkam Tour and Travels</p>
                  <p><strong>Director:</strong> Mr. Gagandeep (Hunny)</p>
                  <p><strong>Primary Line:</strong> +91 82660 16066</p>
                  <p><strong>Address:</strong> Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-sm">Meta WhatsApp API Credentials</h3>
                  <p className="text-[11px] text-emerald-100">Update Temporary or Permanent Access Token</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTokenModalOpen(false)}
                className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Alert / Result */}
              {tokenTestResult && (
                <div className={`p-3 rounded-xl border flex items-start gap-2 ${
                  tokenTestResult.success 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}>
                  {tokenTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed font-medium">{tokenTestResult.message}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={modalPhoneId}
                  onChange={(e) => setModalPhoneId(e.target.value)}
                  placeholder="e.g. 1291621467367556"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">
                    Access Token (Temporary or Permanent)
                  </label>
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10.5px] text-emerald-700 hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <span>Open Meta Portal</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <textarea
                  rows={4}
                  value={modalToken}
                  onChange={(e) => setModalToken(e.target.value)}
                  placeholder="Paste your fresh token starting with EAAT..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <p className="text-[10.5px] text-gray-500 mt-1.5 leading-relaxed">
                  💡 <strong>Note:</strong> Meta Developer Portal ka <em>Temporary Access Token</em> har 24 ghante me expire ho jata hai. Agar token expire ho gaya ho, to Meta Portal se naya token copy karke yahan paste karein aur <strong>Verify &amp; Save Token</strong> dabayein.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsTokenModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTestAndSaveToken}
                  disabled={isTestingToken}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isTestingToken ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying with Meta...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify &amp; Save Token</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
