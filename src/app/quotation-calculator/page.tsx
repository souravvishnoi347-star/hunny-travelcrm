"use client";

import { useState, useMemo } from "react";
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  IndianRupee, 
  Percent, 
  Users, 
  Hotel, 
  Car, 
  Utensils, 
  Zap, 
  ListFilter, 
  RotateCcw,
  CheckCircle2,
  PhoneCall,
  MapPin,
  ShieldCheck
} from "lucide-react";

interface CostItem {
  id: string;
  category: "hotel" | "transport" | "meals" | "activities" | "misc";
  title: string;
  unitCost: number;
  quantity: number;
  days: number;
  notes?: string;
}

interface PresetPackage {
  name: string;
  pax: number;
  days: number;
  hotelCost: number;
  cabCost: number;
  mealCost: number;
  otherCost: number;
}

const QUICK_PRESETS: PresetPackage[] = [
  { name: "Char Dham Deluxe 9N/10D", pax: 4, days: 10, hotelCost: 38000, cabCost: 55000, mealCost: 18000, otherCost: 3000 },
  { name: "Do Dham Kedar-Badri 5N/6D", pax: 2, days: 6, hotelCost: 18500, cabCost: 24000, mealCost: 7500, otherCost: 2000 },
  { name: "Ek Dham Kedarnath 3N/4D", pax: 4, days: 4, hotelCost: 16000, cabCost: 17000, mealCost: 8000, otherCost: 2500 },
  { name: "Haridwar-Rishikesh-Mussoorie 2N/3D", pax: 2, days: 3, hotelCost: 8000, cabCost: 9000, mealCost: 3500, otherCost: 1000 },
];

export default function QuotationCalculatorPage() {
  // Mode: "quick" (Compact/Fast) vs "detailed" (Itemized table)
  const [viewMode, setViewMode] = useState<"quick" | "detailed">("quick");

  // Core Trip Info
  const [tripTitle, setTripTitle] = useState("Char Dham Deluxe Yatra 2026");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paxCount, setPaxCount] = useState<number>(4);
  const [durationDays, setDurationDays] = useState<number>(10);

  // Quick Mode 4 Cost Buckets
  const [hotelTotal, setHotelTotal] = useState<number>(38000);
  const [cabTotal, setCabTotal] = useState<number>(55000);
  const [mealsTotal, setMealsTotal] = useState<number>(18000);
  const [othersTotal, setOthersTotal] = useState<number>(3000);

  // Detailed Mode Items
  const [items, setItems] = useState<CostItem[]>([
    { id: "1", category: "hotel", title: "Yamunotri & Gangotri Hotels (4N)", unitCost: 3000, quantity: 2, days: 4, notes: "Deluxe MAP" },
    { id: "2", category: "hotel", title: "Kedarnath & Badrinath Stays (5N)", unitCost: 3500, quantity: 2, days: 5, notes: "Temple view stays" },
    { id: "3", category: "transport", title: "Innova Crysta AC (10 Days)", unitCost: 5500, quantity: 1, days: 10, notes: "Tolls & Driver DA incl." },
    { id: "4", category: "meals", title: "Breakfast + Dinner (4 Pax x 10 Days)", unitCost: 450, quantity: 4, days: 10, notes: "Pure veg satvik" },
    { id: "5", category: "misc", title: "Yatra Biometric Pass & Medical Kit", unitCost: 3000, quantity: 1, days: 1, notes: "Ground coordination" }
  ]);

  // Margin Mode & Values
  const [marginMode, setMarginMode] = useState<"percentage" | "manual">("percentage");
  const [marginPercentage, setMarginPercentage] = useState<number>(18);
  const [manualMarginType, setManualMarginType] = useState<"total" | "perPax">("total");
  const [manualMarginAmount, setManualMarginAmount] = useState<number>(20000);

  // Tax Policy
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [gstRate, setGstRate] = useState<number>(5);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);

  // Apply Quick Preset
  const applyPreset = (preset: PresetPackage) => {
    setTripTitle(preset.name);
    setPaxCount(preset.pax);
    setDurationDays(preset.days);
    setHotelTotal(preset.hotelCost);
    setCabTotal(preset.cabCost);
    setMealsTotal(preset.mealCost);
    setOthersTotal(preset.otherCost);
  };

  // Reset to Clean
  const resetQuick = () => {
    setTripTitle("Custom Chardham Pilgrimage Tour");
    setPaxCount(2);
    setDurationDays(5);
    setHotelTotal(0);
    setCabTotal(0);
    setMealsTotal(0);
    setOthersTotal(0);
  };

  // Detailed items management
  const addItem = (category: CostItem["category"] = "hotel") => {
    setItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        category,
        title: category === "hotel" ? "Hotel Stay" : category === "transport" ? "Vehicle Charges" : "Service",
        unitCost: 2000,
        quantity: 1,
        days: 1,
        notes: ""
      }
    ]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof CostItem, val: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  // Core Calculations
  const calculations = useMemo(() => {
    let netCost = 0;

    if (viewMode === "quick") {
      netCost = (Number(hotelTotal) || 0) + (Number(cabTotal) || 0) + (Number(mealsTotal) || 0) + (Number(othersTotal) || 0);
    } else {
      netCost = items.reduce((sum, it) => sum + (Number(it.unitCost) * Number(it.quantity) * Number(it.days || 1)), 0);
    }

    let marginAmount = 0;
    let effectiveMarginPct = 0;

    if (marginMode === "percentage") {
      marginAmount = Math.round(netCost * (Number(marginPercentage) / 100));
      effectiveMarginPct = Number(marginPercentage);
    } else {
      if (manualMarginType === "perPax") {
        marginAmount = Math.round((Number(manualMarginAmount) || 0) * Math.max(1, paxCount));
      } else {
        marginAmount = Math.round(Number(manualMarginAmount) || 0);
      }
      effectiveMarginPct = netCost > 0 ? Number(((marginAmount / netCost) * 100).toFixed(1)) : 0;
    }

    const subtotal = netCost + marginAmount;
    const gstAmount = includeGst ? Math.round(subtotal * (Number(gstRate) / 100)) : 0;
    const grandTotal = subtotal + gstAmount;

    const safePax = Math.max(1, paxCount);
    const netPerPax = Math.round(netCost / safePax);
    const marginPerPax = Math.round(marginAmount / safePax);
    const quotePerPax = Math.round(grandTotal / safePax);

    return {
      netCost,
      marginAmount,
      effectiveMarginPct,
      subtotal,
      gstAmount,
      grandTotal,
      netPerPax,
      marginPerPax,
      quotePerPax
    };
  }, [viewMode, hotelTotal, cabTotal, mealsTotal, othersTotal, items, marginMode, marginPercentage, manualMarginType, manualMarginAmount, includeGst, gstRate, paxCount]);

  // Formatted WhatsApp Quotation Text with Traymbhkam Tour and Travels Branding
  const whatsappQuoteText = useMemo(() => {
    const lines = [
      `🙏 *जय बद्री विशाल | हर हर महादेव* 🙏`,
      `*TRAYMBHKAM TOUR AND TRAVELS*`,
      `*CHARDHAM & UTTARAKHAND PILGRIMAGE QUOTATION*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📌 *Package:* ${tripTitle}`,
      `⏳ *Duration:* ${durationDays} Days / ${Math.max(1, durationDays - 1)} Nights`,
      `👥 *Pilgrims:* ${paxCount} Devotees`,
      customerName ? `👤 *Quotation For:* ${customerName}` : "",
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📋 *OFFICIAL INCLUSIONS:*`,
      `🏨 • *Verified Pilgrim Hotels / Camps / Resorts*`,
      `🚗 • *Dedicated AC Vehicle* (All Toll, State Green Tax, Parking & Driver DA incl.)`,
      `🍽️ • *MAP Meal Plan* (Daily Hot Breakfast & Pure Veg Dinner)`,
      `✨ • *Char Dham Biometric Registration & 24x7 Haridwar Coordinator Support*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💰 *FINAL QUOTATION SUMMARY:*`,
      `👉 *Per Person Rate:* ₹${calculations.quotePerPax.toLocaleString("en-IN")}/- (Per Pax)`,
      `👉 *Grand Total Price:* ₹${calculations.grandTotal.toLocaleString("en-IN")}/- ${includeGst ? `(Incl. ${gstRate}% Tour GST)` : "(Net)"}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📞 *Direct Booking & Customization Desk:*`,
      `👤 *Mr. Gagandeep:* +91 82660 16066`,
      `📍 *Head Office:* Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar, Uttarakhand`,
      `🌟 *Approved Uttarakhand Pilgrimage Operator (EST. 2022)*`
    ].filter(Boolean);

    return lines.join("\n");
  }, [tripTitle, durationDays, paxCount, customerName, calculations, includeGst, gstRate]);

  const copyQuotation = () => {
    navigator.clipboard.writeText(whatsappQuoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const shareOnWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappQuoteText);
    const targetPhone = customerPhone ? customerPhone.replace(/[^0-9]/g, "") : "";
    const url = targetPhone ? `https://wa.me/${targetPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-16">
      {/* Luxury Compact Top Navigation Header */}
      <div className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0b1320] text-amber-400 flex items-center justify-center shadow-xs border border-slate-800">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold text-slate-900 leading-tight">Trip Quotation &amp; Margin Calculator</h1>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60 uppercase">
                    Traymbhkam Pricing Desk
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Fast cost calculation, margins &amp; instant branded WhatsApp quotes</p>
              </div>
            </div>

            {/* Mode Switcher: Quick vs Detailed & Action Buttons */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setViewMode("quick")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "quick"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Quick Mode
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("detailed")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "detailed"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5 text-slate-500" />
                  Detailed
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={copyQuotation}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                {copied ? "Copied" : "Copy"}
              </button>

              <button
                onClick={shareOnWhatsApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-950" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        {/* Quick Presets Bar (Refined Luxury Pills) */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-4 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Presets:
          </span>
          {QUICK_PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 bg-slate-50/80 hover:bg-amber-50/80 text-slate-700 hover:text-amber-900 border border-slate-200/80 hover:border-amber-300 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer"
            >
              {p.name} ({p.pax} Pax)
            </button>
          ))}
          <button
            onClick={resetQuick}
            className="ml-auto px-2 py-1 text-slate-400 hover:text-slate-600 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
            title="Reset numbers"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* MAIN COMPACT GRID: Inputs (7 cols) + Live Summary (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* LEFT: Inputs & Margins (7 Cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            
            {/* Trip Details Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="grid grid-cols-12 gap-2.5">
                <div className="col-span-12 sm:col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Package Title</label>
                  <input
                    type="text"
                    value={tripTitle}
                    onChange={(e) => setTripTitle(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50/60 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. Char Dham Deluxe Yatra"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pilgrims (Pax)</label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="number"
                      min="1"
                      value={paxCount}
                      onChange={(e) => setPaxCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50/60 border border-slate-200 rounded-lg pl-7 pr-2 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Days Duration</label>
                  <input
                    type="number"
                    min="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50/60 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Customer / Guest Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs text-slate-700 bg-slate-50/60 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. Sharma Family / Optional"
                  />
                </div>

                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">WhatsApp Mobile Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs text-slate-700 bg-slate-50/60 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. 9876543210 (without +91)"
                  />
                </div>
              </div>
            </div>

            {/* QUICK COST BUCKETS (If Quick Mode) */}
            {viewMode === "quick" ? (
              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                    Direct Vendor Costs (Net)
                  </span>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                    Total Net: ₹{calculations.netCost.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Hotel Total */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Hotel className="w-3 h-3 text-indigo-600" /> Hotel Stays
                    </span>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-semibold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={hotelTotal}
                        onChange={(e) => setHotelTotal(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-md pl-5 pr-1.5 py-1 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Cab Total */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Car className="w-3 h-3 text-amber-600" /> Cab / Vehicle
                    </span>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-semibold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={cabTotal}
                        onChange={(e) => setCabTotal(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-md pl-5 pr-1.5 py-1 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Meals Total */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-emerald-600" /> Meals (Food)
                    </span>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-semibold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={mealsTotal}
                        onChange={(e) => setMealsTotal(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-md pl-5 pr-1.5 py-1 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Others / Passes Total */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-600" /> Others / Passes
                    </span>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-semibold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={othersTotal}
                        onChange={(e) => setOthersTotal(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-md pl-5 pr-1.5 py-1 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* DETAILED TABLE (If Detailed Mode) */
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Line Items Breakdown</span>
                  <button
                    onClick={() => addItem("hotel")}
                    className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/70 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-1.5 bg-slate-50/80 rounded-lg text-xs border border-slate-200/60">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateItem(item.id, "title", e.target.value)}
                        className="flex-1 bg-transparent font-medium border-b border-transparent hover:border-slate-300 focus:outline-none px-1 text-slate-800"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">₹</span>
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => updateItem(item.id, "unitCost", parseFloat(e.target.value) || 0)}
                          className="w-16 bg-white border border-slate-200 rounded px-1 text-right font-bold"
                          title="Rate"
                        />
                      </div>
                      <span className="text-slate-400">×</span>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        className="w-10 bg-white border border-slate-200 rounded text-center"
                        title="Qty"
                      />
                      <span className="text-slate-400">×</span>
                      <input
                        type="number"
                        value={item.days}
                        onChange={(e) => updateItem(item.id, "days", parseInt(e.target.value) || 1)}
                        className="w-10 bg-white border border-slate-200 rounded text-center"
                        title="Days"
                      />
                      <span className="font-bold text-slate-900 w-16 text-right">
                        ₹{(item.unitCost * item.quantity * item.days).toLocaleString("en-IN")}
                      </span>
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-600 p-0.5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MARGIN CALCULATOR CARD (Refined Amber / Slate) */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-600" />
                  Profit Margin Setting
                </span>

                {/* Dual Toggle Pill: Percentage (%) vs Manual (₹) */}
                <div className="bg-slate-100 p-0.5 rounded-lg flex border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setMarginMode("percentage")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      marginMode === "percentage"
                        ? "bg-white text-amber-800 shadow-xs border border-slate-200/60"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    % Margin
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarginMode("manual")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      marginMode === "manual"
                        ? "bg-white text-amber-800 shadow-xs border border-slate-200/60"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    ₹ Flat Manual
                  </button>
                </div>
              </div>

              {/* Controls based on Margin Mode */}
              {marginMode === "percentage" ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[10, 15, 18, 20, 25, 30].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setMarginPercentage(pct)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                            marginPercentage === pct
                              ? "bg-[#0b1320] text-amber-300 shadow-xs border border-slate-800"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={marginPercentage}
                        onChange={(e) => setMarginPercentage(parseFloat(e.target.value) || 0)}
                        className="w-14 text-xs font-bold text-center bg-slate-50 border border-slate-300 rounded-md py-1"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs bg-amber-50/70 border border-amber-200/60 px-3 py-1.5 rounded-lg text-amber-900">
                    <span className="font-medium">Net Agency Margin Earned:</span>
                    <span className="font-bold text-amber-800">+₹{calculations.marginAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ) : (
                /* Manual Flat ₹ Mode */
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          checked={manualMarginType === "total"}
                          onChange={() => setManualMarginType("total")}
                          className="accent-amber-600"
                        />
                        <span>Total Trip Flat (₹)</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer ml-1">
                        <input
                          type="radio"
                          checked={manualMarginType === "perPax"}
                          onChange={() => setManualMarginType("perPax")}
                          className="accent-amber-600"
                        />
                        <span>Per Pax (₹/Head)</span>
                      </label>
                    </div>

                    <div className="relative w-28">
                      <span className="absolute left-2 top-1 text-xs text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={manualMarginAmount}
                        onChange={(e) => setManualMarginAmount(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-md pl-5 pr-1.5 py-1 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Preset quick pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(manualMarginType === "total" ? [10000, 15000, 20000, 25000] : [2000, 3500, 5000, 7000]).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setManualMarginAmount(amt)}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-md cursor-pointer ${
                          manualMarginAmount === amt
                            ? "bg-[#0b1320] text-amber-300 border border-slate-800"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs bg-amber-50/70 border border-amber-200/60 px-3 py-1.5 rounded-lg text-amber-900">
                    <span className="font-medium">Effective Profit:</span>
                    <span className="font-bold text-amber-800">
                      +₹{calculations.marginAmount.toLocaleString("en-IN")} ({calculations.effectiveMarginPct}%)
                    </span>
                  </div>
                </div>
              )}

              {/* GST Quick Checkbox */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={includeGst}
                    onChange={(e) => setIncludeGst(e.target.checked)}
                    className="accent-amber-600 rounded"
                  />
                  <span>Add 5% Tour Package GST (Govt. Compliant)</span>
                </label>
                {includeGst && (
                  <span className="font-bold text-slate-700 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                    +₹{calculations.gstAmount.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: LUXURY COMPACT QUOTATION SUMMARY CARD (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-gradient-to-b from-[#0b1320] via-[#101b2d] to-[#15233a] rounded-2xl p-5 text-white shadow-xl border border-slate-800 sticky top-16">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  Instant Quote Summary
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {paxCount} Pilgrims • {durationDays}D/{Math.max(1, durationDays - 1)}N
                </span>
              </div>

              {/* Big Bold Per Pax Number */}
              <div className="mt-3.5">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Per Person Rate (Per Pax):</span>
                <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight mt-0.5 flex items-baseline gap-1">
                  ₹{calculations.quotePerPax.toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-slate-400">/ person</span>
                </div>
              </div>

              <div className="my-3.5 border-t border-slate-800" />

              {/* Financial Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Net Direct Vendor Cost:</span>
                  <span className="font-semibold text-white">₹{calculations.netCost.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-amber-300">
                  <span>Your Agency Profit ({calculations.effectiveMarginPct}%):</span>
                  <span className="font-bold">+₹{calculations.marginAmount.toLocaleString("en-IN")}</span>
                </div>

                {includeGst && (
                  <div className="flex justify-between text-slate-300">
                    <span>Tour Package GST (5%):</span>
                    <span className="font-semibold text-white">+₹{calculations.gstAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="pt-2.5 border-t border-slate-700/80 flex justify-between items-center text-sm font-bold text-white">
                  <span>Grand Total Quote:</span>
                  <span className="text-lg text-amber-400 font-black">₹{calculations.grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                <button
                  onClick={copyQuotation}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-white/10"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                  {copied ? "Copied" : "Copy Quote"}
                </button>

                <button
                  onClick={shareOnWhatsApp}
                  className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-950" />
                  Send WhatsApp
                </button>
              </div>

              {/* WhatsApp Live Preview Box with Traymbhkam Brand */}
              <div className="mt-3.5 bg-black/40 rounded-xl p-3 text-[10.5px] text-slate-300 font-mono leading-relaxed max-h-36 overflow-y-auto border border-slate-800/80">
                <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800">
                  <span className="text-amber-400 font-sans font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-amber-400" /> WhatsApp Message Preview
                  </span>
                  <span className="text-[9px] text-slate-500 font-sans">Traymbhkam Format</span>
                </div>
                <pre className="font-sans whitespace-pre-wrap text-[10.5px] text-slate-300 leading-snug">
                  {whatsappQuoteText}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
