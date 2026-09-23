"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Settings,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Building2,
  Key,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Database,
  RotateCcw,
  MessageCircle,
  Sparkles,
  Send
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SettingsData {
  id: string;
  company_name: string;
  gst_number: string;
  phone: string;
  email: string;
  website: string;
  logo_url: string;
  openai_key: string;
  // Meta Cloud WhatsApp Business API Configuration
  meta_phone_number_id?: string;
  meta_waba_id?: string;
  meta_access_token?: string;
  meta_default_motto?: string;
}

const defaultSettings: Omit<SettingsData, "id"> = {
  company_name: "Traymbhkam Tour and Travels",
  gst_number: "05AAAPL1234F1Z1",
  phone: "+91 82660 16066",
  email: "info@traymbhkam.com",
  website: "Opp. Railway Station Gate No. 2, Haridwar",
  logo_url: "/logo.png",
  openai_key: "",
  meta_phone_number_id: "1291621467367556",
  meta_waba_id: "1776498666879701",
  meta_access_token: "",
  meta_default_motto: "ॐ नमः शिवाय | जय बद्री विशाल",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(() => {
    let key = "";
    if (typeof window !== "undefined") {
      try {
        key = localStorage.getItem("traymbhkam_gemini_api_key") || "";
        const cached = localStorage.getItem("traymbhkam_settings_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            ...defaultSettings,
            ...parsed,
            openai_key: parsed.openai_key || key,
            meta_phone_number_id: parsed.meta_phone_number_id || localStorage.getItem("traymbhkam_meta_phone_number_id") || "1291621467367556",
            meta_waba_id: parsed.meta_waba_id || localStorage.getItem("traymbhkam_meta_waba_id") || "1776498666879701",
            meta_access_token: parsed.meta_access_token || localStorage.getItem("traymbhkam_meta_access_token") || "",
            meta_default_motto: parsed.meta_default_motto || "ॐ नमः शिवाय | जय बद्री विशाल"
          };
        }
      } catch {}
    }
    return {
      id: "local-1",
      ...defaultSettings,
      openai_key: key
    };
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Security & Password Change States
  const { changePassword } = useAuth();
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPass !== confirmPass) {
      setPassError("New Password and Confirm Password do not match.");
      return;
    }
    if (newPass.length < 6) {
      setPassError("New Password must be at least 6 characters long.");
      return;
    }

    setPassLoading(true);
    setTimeout(() => {
      const res = changePassword(currentPass, newPass);
      if (res.success) {
        setPassSuccess("Password successfully updated! Your new password is now active.");
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        setPassError(res.error || "Failed to update password.");
      }
      setPassLoading(false);
    }, 400);
  };

  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const handlePurgeDemoData = () => {
    if (!confirm("Are you sure you want to clear all mock/demo records from this browser? Real configured settings will remain safe.")) return;
    try {
      localStorage.removeItem("traymbhkam_leads_board");
      localStorage.removeItem("traymbhkam_leads");
      localStorage.removeItem("traymbhkam_payables");
      localStorage.removeItem("traymbhkam_vendors");
      localStorage.removeItem("traymbhkam_hotel_voucher");
      localStorage.removeItem("traymbhkam_multi_hotel_voucher");
      localStorage.removeItem("traymbhkam_transport_voucher");
      setPurgeSuccess(true);
      setTimeout(() => {
        setPurgeSuccess(false);
        window.location.reload();
      }, 1200);
    } catch (e) {
      alert("Error resetting cache: " + e);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [showMetaToken, setShowMetaToken] = useState(false);
  const [testPhone, setTestPhone] = useState("+91 82660 16066");
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      if (data && !error) {
        const updated: SettingsData = {
          id: data.id,
          company_name: data.company_name ?? defaultSettings.company_name,
          gst_number: data.gst_number ?? defaultSettings.gst_number,
          phone: data.phone ?? defaultSettings.phone,
          email: data.email ?? defaultSettings.email,
          website: data.website ?? defaultSettings.website,
          logo_url: data.logo_url ?? defaultSettings.logo_url,
          openai_key: data.openai_key ?? "",
          meta_phone_number_id: data.meta_phone_number_id ?? localStorage.getItem("traymbhkam_meta_phone_number_id") ?? "",
          meta_waba_id: data.meta_waba_id ?? localStorage.getItem("traymbhkam_meta_waba_id") ?? "",
          meta_access_token: data.meta_access_token ?? localStorage.getItem("traymbhkam_meta_access_token") ?? "",
          meta_default_motto: data.meta_default_motto ?? "ॐ नमः शिवाय | जय बद्री विशाल"
        };
        setSettings(updated);
        if (typeof window !== "undefined") {
          localStorage.setItem("traymbhkam_settings_cache", JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.warn("Background settings sync:", err);
    }
  }

  async function handleSave() {
    setSaving(true);
    const payload: Record<string, any> = {
      company_name: settings.company_name,
      gst_number: settings.gst_number,
      phone: settings.phone,
      email: settings.email,
      website: settings.website,
      logo_url: settings.logo_url,
      openai_key: settings.openai_key,
      meta_phone_number_id: settings.meta_phone_number_id,
      meta_waba_id: settings.meta_waba_id,
      meta_access_token: settings.meta_access_token,
      meta_default_motto: settings.meta_default_motto,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("traymbhkam_settings_cache", JSON.stringify(settings));
      if (settings.openai_key) {
        localStorage.setItem("traymbhkam_gemini_api_key", settings.openai_key.trim());
      }
      if (settings.meta_phone_number_id !== undefined) {
        localStorage.setItem("traymbhkam_meta_phone_number_id", settings.meta_phone_number_id.trim());
      }
      if (settings.meta_waba_id !== undefined) {
        localStorage.setItem("traymbhkam_meta_waba_id", settings.meta_waba_id.trim());
      }
      if (settings.meta_access_token !== undefined) {
        localStorage.setItem("traymbhkam_meta_access_token", settings.meta_access_token.trim());
      }
      if (settings.meta_default_motto !== undefined) {
        localStorage.setItem("traymbhkam_meta_default_motto", settings.meta_default_motto.trim());
      }
    }

    try {
      let error;
      if (settings.id && settings.id !== "local-1") {
        ({ error } = await supabase
          .from("settings")
          .update(payload)
          .eq("id", settings.id));
      } else {
        const { data, error: insertError } = await supabase
          .from("settings")
          .insert([payload])
          .select()
          .single();
        error = insertError;
        if (data) {
          setSettings((prev) => ({ ...prev, id: data.id }));
        }
      }

      if (error) {
        setToast("Settings saved locally! (Cloud sync pending connection)");
      } else {
        setToast("Settings saved successfully!");
      }
    } catch {
      setToast("Settings saved locally!");
    } finally {
      setSaving(false);
    }
  }

  const handleTestWhatsApp = async () => {
    const pId = settings.meta_phone_number_id?.trim() || "1291621467367556";
    if (!settings.meta_access_token?.trim()) {
      setTestResult({ success: false, message: "Please paste your Meta Access Token before testing." });
      return;
    }
    setTestingWhatsApp(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/whatsapp/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: testPhone,
          customerName: "Devotee Test",
          yatraName: "Chardham Yatra 2026 (Live Test)",
          bookingId: "TEST-CD-001",
          travelDates: "10 May – 19 May 2026",
          paxCount: "04 Adults",
          totalAmount: 114000,
          advancePaid: 35000,
          balanceDue: 79000,
          phoneNumberId: pId,
          accessToken: settings.meta_access_token.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: "✓ Test message sent successfully via Meta Cloud API!" });
      } else {
        setTestResult({ success: false, message: `Error: ${data.error || "Failed to send message"}` });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Network error: ${err.message}` });
    } finally {
      setTestingWhatsApp(false);
    }
  };

  function update(field: keyof Omit<SettingsData, "id">, value: string) {
    setSettings((prev) => {
      const next = { ...prev, [field]: value };
      if (typeof window !== "undefined") {
        localStorage.setItem("traymbhkam_settings_cache", JSON.stringify(next));
      }
      return next;
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${
            toast.includes("Failed")
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {toast}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-sky-100 rounded-xl">
          <Settings className="w-6 h-6 text-sky-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your company profile and integrations
          </p>
        </div>
      </div>

      {/* Card 1 – Company Profile */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <Building2 className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Company Profile
          </h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              Company Name
            </label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => update("company_name", e.target.value)}
              placeholder="Traymbhkam Tour and Travels"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Registration / License Number */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              Govt. Registration / License No.
            </label>
            <input
              type="text"
              value={settings.gst_number}
              onChange={(e) => update("gst_number", e.target.value)}
              placeholder="UK-TO-2026-001"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              Phone Number
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="info@traymbhkam.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              Website / Office Location
            </label>
            <input
              type="text"
              value={settings.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="Opp. Railway Station Gate No. 2, Haridwar"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Logo URL + Preview */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-500">
              Logo URL
            </label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={settings.logo_url}
                onChange={(e) => update("logo_url", e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
              {settings.logo_url && (
                <img
                  src={settings.logo_url}
                  alt="Logo preview"
                  className="w-10 h-10 rounded-lg object-contain border border-gray-200 bg-gray-50 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card 2 – AI Configuration */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <Key className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            AI Configuration
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>AI API Key (Gemini / OpenRouter / Hugging Face)</span>
              <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Auto-detects provider
              </span>
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={settings.openai_key}
                onChange={(e) => update("openai_key", e.target.value)}
                placeholder="sk-or-v1-... (OpenRouter) or AIzaSy... (Gemini) or hf_... (HuggingFace)"
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showKey ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              This key powers instant 10-day pilgrimage itinerary generation. Works with:
              <br />
              • <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline font-medium">OpenRouter.ai</a> (Recommended — free models like Llama 3.3 70B & Gemini 2.0 Flash)
              <br />
              • <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline font-medium">Google AI Studio</a> (Free Gemini 2.0/1.5 Flash key)
              <br />
              • <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline font-medium">Hugging Face</a> (Access Token with Qwen 2.5 72B)
            </p>
          </div>
        </div>
      </div>

      {/* Card 3 – Meta Cloud WhatsApp Business API Configuration */}
      <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Meta Cloud WhatsApp Business API
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  1,000 Free Messages/Mo Tier
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Send official Traymbhkam Tour and Travels booking confirmation messages directly to customer WhatsApp
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone Number ID */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Phone Number ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.meta_phone_number_id || ""}
                onChange={(e) => update("meta_phone_number_id", e.target.value)}
                placeholder="e.g. 105938291823019"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
              />
              <p className="text-[11px] text-gray-400">Found in Meta App Dashboard → WhatsApp → API Setup</p>
            </div>

            {/* WABA ID */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                WhatsApp Business Account ID (WABA ID)
              </label>
              <input
                type="text"
                value={settings.meta_waba_id || ""}
                onChange={(e) => update("meta_waba_id", e.target.value)}
                placeholder="e.g. 108371928472918"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
              />
              <p className="text-[11px] text-gray-400">Your Meta WhatsApp Business Account ID</p>
            </div>
          </div>

          {/* Meta Access Token */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Permanent / System User Access Token <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showMetaToken ? "text" : "password"}
                value={settings.meta_access_token || ""}
                onChange={(e) => update("meta_access_token", e.target.value)}
                placeholder="EAABwzL... (Permanent System User Token)"
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowMetaToken(!showMetaToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showMetaToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Obtained from Meta Business Suite → System Users with <code className="text-emerald-700 font-bold">whatsapp_business_messaging</code> permission.
            </p>
          </div>

          {/* Default Spiritual Motto */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Header Blessing Motto in Messages
            </label>
            <input
              type="text"
              value={settings.meta_default_motto || "ॐ नमः शिवाय | जय बद्री विशाल"}
              onChange={(e) => update("meta_default_motto", e.target.value)}
              placeholder="ॐ नमः शिवाय | जय बद्री विशाल"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
            />
          </div>

          {/* Test WhatsApp Connection */}
          <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100">
            <div className="flex-1">
              <span className="text-xs font-bold text-emerald-900 block">Test WhatsApp Connection:</span>
              <p className="text-[11px] text-emerald-700">Send a sample Chardham booking confirmation to verify your Meta API credentials</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+91 82660 16066"
                className="w-36 px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-semibold"
              />
              <button
                type="button"
                onClick={handleTestWhatsApp}
                disabled={testingWhatsApp}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0"
              >
                {testingWhatsApp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {testingWhatsApp ? "Sending..." : "Test Send"}
              </button>
            </div>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-medium ${testResult.success ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Card 4 – Data Management & Backups */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Data Management & Backups
            </h2>
          </div>
          <span className="text-xs text-gray-500">1-Click Excel / CSV Export</span>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Export your entire CRM database for accounting, tax filing, or local offline backup.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                try {
                  const saved = localStorage.getItem("traymbhkam_leads");
                  const leads = saved ? JSON.parse(saved) : [];
                  const headers = ["Lead Name", "Phone", "Destination", "Budget", "Status", "Notes"];
                  const rows = leads.map((l: any) => [l.name, l.phone, l.destination, l.budget, l.status, l.notes]);
                  import("@/lib/exportCsv").then(m => m.exportToCsv("All_Leads_Backup", headers, rows));
                } catch (e) {
                  alert("Could not export leads: " + e);
                }
              }}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              📥 Export All Leads (CSV)
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  const saved = localStorage.getItem("traymbhkam_vendors");
                  const vendors = saved ? JSON.parse(saved) : [];
                  const headers = ["Vendor Name", "Type", "Contact Person", "Phone", "Location", "Notes"];
                  const rows = vendors.map((v: any) => [v.name, v.type, v.contact_person, v.phone, v.location, v.notes]);
                  import("@/lib/exportCsv").then(m => m.exportToCsv("All_Vendors_Backup", headers, rows));
                } catch (e) {
                  alert("Could not export vendors: " + e);
                }
              }}
              className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              📥 Export All Vendors (CSV)
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  const backup = {
                    date: new Date().toISOString(),
                    settings: localStorage.getItem("traymbhkam_settings_cache"),
                    leads: localStorage.getItem("traymbhkam_leads"),
                    vendors: localStorage.getItem("traymbhkam_vendors"),
                    payables: localStorage.getItem("traymbhkam_payables"),
                    itineraryDraft: localStorage.getItem("traymbhkam_itinerary_draft")
                  };
                  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `Travel_to_Uttarakhand_Full_CRM_Backup_${new Date().toISOString().split("T")[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (e) {
                  alert("Could not export JSON backup: " + e);
                }
              }}
              className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              💾 Full CRM Backup (JSON)
            </button>
          </div>
        </div>

        {/* Card 4 – CRM Access, Security & Password Management */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">CRM Login Security & Password</h2>
              <p className="text-xs text-gray-500">Manage administrator login credentials and change password</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Credentials Info & Recovery PIN */}
            <div className="space-y-3 bg-gray-50/70 p-4 rounded-xl border border-gray-200/80 text-xs">
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[10.5px] block">
                Authorized Login Particulars
              </span>
              <div className="space-y-1.5 text-gray-600">
                <p>• <strong>Primary Admin ID:</strong> <span className="font-mono text-gray-900">admin@traymbhkam.com</span></p>
                <p>• <strong>Alternate Admin ID:</strong> <span className="font-mono text-gray-900">souravvishnoi347@gmail.com</span></p>
                <p>• <strong>Default Password:</strong> <span className="font-mono text-gray-900">Devbhoomi@2026</span></p>
                <p>• <strong>Master Recovery PIN:</strong> <span className="font-mono text-amber-700 font-bold">971903</span> (Linked to +91 82660 16066)</p>
              </div>
              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-100 text-[11px] text-sky-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>If you forget your password on the login screen, click <strong>&quot;Forgot Password?&quot;</strong> and verify with your registered email and Master PIN <strong>971903</strong>.</span>
              </div>
            </div>

            {/* Right: Change Password Form */}
            <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[10.5px] block">
                Update Administrator Password
              </span>

              {passError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-gray-600 font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="px-4 py-2 bg-[#0369a1] hover:bg-[#0284c7] text-white rounded-lg font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {passLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Update Password
              </button>
            </form>

          </div>
        </div>

        {/* System Data & Demo Reset */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Demo Data & Cache Management</h2>
              <p className="text-xs text-gray-500">Purge rough mock items and reset local storage to clean state</p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-gray-600 max-w-md">
              <p>Wipe all stored sample leads, test vouchers, and mock payables from this computer. Starts all modules fresh with 0 clutter.</p>
              {purgeSuccess && (
                <p className="text-emerald-600 font-bold mt-1">✓ Local demo data wiped! Reloading workspace...</p>
              )}
            </div>
            <button
              type="button"
              onClick={handlePurgeDemoData}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Purge Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 cursor-pointer"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
