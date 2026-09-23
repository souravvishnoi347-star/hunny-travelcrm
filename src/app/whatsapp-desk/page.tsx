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
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BOT_RESPONSES, SALES_TEAM, matchBotResponse, MatchedRule } from "@/lib/botRules";

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
      `\n📞 *24x7 Helpline:* +91 82660 16066 (Mr. Gagandeep)\n` +
      `📍 *Office:* Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar\n\n` +
      `May Baba Kedar and Badri Vishal bless your holy pilgrimage! 🙏🌸`;

    setReplyText(confirmText);
    showToast("Template loaded in input box! Click 'Send' or edit before sending.");
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
        description: "Official contact for Mr. Gagandeep (+91 82660 16066)",
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
    <div className="space-y-4 pb-8">
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
                    onClick={() => setSelectedChatId(chat.id)}
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

                {/* Human Takeover Toggle Button */}
                <div className="flex items-center gap-2">
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
            <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mr-1">Bot Rules & Actions:</span>
            
            {/* AI Auto-Suggest / Rule Matcher */}
            <button
              type="button"
              onClick={handleAutoSuggestReply}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition cursor-pointer shadow-2xs"
              title="Auto-detect customer inquiry and match the exact bot rule response"
            >
              <Sparkles className="w-3 h-3" />
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

            {/* GST Policy */}
            <button
              type="button"
              onClick={() => handleLoadRule("gst")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold transition cursor-pointer"
              title="No GST chat on bot: sales team direct handoff"
            >
              <FileText className="w-3 h-3 text-amber-600" />
              <span>GST Sales Handoff</span>
            </button>

            {/* Package Range & Payment */}
            <button
              type="button"
              onClick={() => handleLoadRule("package")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold transition cursor-pointer"
              title="Indicative package ballpark range, no bank/UPI shared, sales handoff"
            >
              <IndianRupee className="w-3 h-3 text-emerald-600" />
              <span>Package & Payment Range</span>
            </button>

            {/* Seasonality & Destinations */}
            <button
              type="button"
              onClick={() => handleLoadRule("season")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-[11px] font-bold transition cursor-pointer"
              title="Chardham (May-July & Sept-Nov) and leisure trips (Nainital, Corbett, Mussoorie, Chopta, Auli)"
            >
              <Compass className="w-3 h-3 text-sky-600" />
              <span>Season & Tours</span>
            </button>

            {/* Helpline & Official Contact */}
            <button
              type="button"
              onClick={() => handleLoadRule("sales")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-bold transition cursor-pointer"
              title="Forward official contact for Mr. Gagandeep (+91 82660 16066)"
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
              <span>👋 Hello World (Start Chat)</span>
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
                            <UserCheck className="w-3 h-3" /> Human Operator (Mr. Gagandeep)
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

      {/* Meta API Token Configuration Modal */}
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
  );
}
