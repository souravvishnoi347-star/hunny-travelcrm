"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  Hotel, 
  Car, 
  Bike,
  Users, 
  Map, 
  Store, 
  Activity, 
  Plus, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  MapPin,
  Compass,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DashboardStats = {
  activeLeads: number;
  confirmedTours: number;
  totalVouchers: number;
  totalItineraries: number;
  pendingPayables: number;
  leadsByStage: { name: string; count: number; fill: string }[];
  recentActivity: any[];
};

const STAGE_LABELS: Record<string, string> = {
  new_inquiry: "New Inquiry",
  quoted: "Quoted Sent",
  follow_up: "Follow Up",
  confirmed: "Confirmed Yatra",
  lost: "Lost"
};

const CLEAN_INITIAL_STATS: DashboardStats = {
  activeLeads: 0,
  confirmedTours: 0,
  totalVouchers: 0,
  totalItineraries: 0,
  pendingPayables: 0,
  leadsByStage: [
    { name: "New Inquiries", count: 0, fill: "#0f172a" },
    { name: "Quoted Sent", count: 0, fill: "#d97706" },
    { name: "Follow Up", count: 0, fill: "#6366f1" },
    { name: "Confirmed Yatra", count: 0, fill: "#10b981" },
    { name: "Cancelled", count: 0, fill: "#ef4444" },
  ],
  recentActivity: []
};

// 4 Dham Circuit Quick Presets (Haridwar Departures)
const DHAM_CIRCUITS = [
  {
    name: "Complete Char Dham Yatra",
    dhams: "Yamunotri • Gangotri • Kedarnath • Badrinath",
    days: "9N / 10D or 11N / 12D",
    route: "Ex-Haridwar Hub",
    badge: "Signature Tour",
  },
  {
    name: "Do Dham (Kedarnath + Badrinath)",
    dhams: "Kedarnath Temple • Badrinath Ji Darshan",
    days: "5N / 6D",
    route: "Ex-Haridwar / Rishikesh",
    badge: "High Demand",
  },
  {
    name: "Ek Dham (Kedarnath Trek / Heli)",
    dhams: "Guptkashi • Phata • Kedarnath Shrine",
    days: "3N / 4D",
    route: "Ex-Haridwar / Dehradun",
    badge: "Helicopter / Trek",
  },
  {
    name: "Badrinath & Mana Village Excursion",
    dhams: "Badrinath Temple • Vyas Gufa • Joshimath",
    days: "3N / 4D",
    route: "Ex-Haridwar",
    badge: "Senior Friendly",
  }
];

// Sample Yatra Review Group Photos (from the uploaded pictures)
const RECENT_REVIEWS = [
  { src: "/reviews/review_1.jpeg", caption: "Pilgrim Group Darshan" },
  { src: "/reviews/review_2.jpeg", caption: "Chardham Holy Tour" },
  { src: "/reviews/review_3.jpeg", caption: "Uttarakhand Mountains" },
  { src: "/reviews/review_4.jpeg", caption: "Temple Darshan Tour" },
  { src: "/reviews/review_5.jpeg", caption: "Haridwar Departure" },
  { src: "/reviews/review_6.jpeg", caption: "Devotee Family Group" },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(CLEAN_INITIAL_STATS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        let activeLeads = 0;
        let confirmedTours = 0;
        let recentLeads: any[] = [];
        let stageCounts: Record<string, number> = { new_inquiry: 0, quoted: 0, follow_up: 0, confirmed: 0, lost: 0 };

        // Clean Traymbhkam Isolated Storage
        const storedLeads = localStorage.getItem("traymbhkam_leads");
        if (storedLeads) {
          const parsed = JSON.parse(storedLeads);
          if (Array.isArray(parsed) && parsed.length > 0) {
            activeLeads = parsed.filter((l: any) => l.status !== "lost").length;
            confirmedTours = parsed.filter((l: any) => l.status === "confirmed").length;
            recentLeads = parsed.slice(0, 5);
            parsed.forEach((l: any) => {
              const st = l.status || "new_inquiry";
              if (stageCounts[st] !== undefined) stageCounts[st]++;
            });
          }
        }

        let pendingPayables = 0;
        const storedPayables = localStorage.getItem("traymbhkam_payables");
        if (storedPayables) {
          const parsed = JSON.parse(storedPayables);
          if (Array.isArray(parsed)) {
            pendingPayables = parsed.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount || 0), 0);
          }
        }

        const chartData = [
          { name: "New Inquiries", count: stageCounts.new_inquiry || 0, fill: "#0f172a" },
          { name: "Quoted Sent", count: stageCounts.quoted || 0, fill: "#d97706" },
          { name: "Follow Up", count: stageCounts.follow_up || 0, fill: "#6366f1" },
          { name: "Confirmed Yatra", count: stageCounts.confirmed || 0, fill: "#10b981" },
          { name: "Cancelled", count: stageCounts.lost || 0, fill: "#ef4444" },
        ];

        let totalDocs = 0;
        const storedDocs = localStorage.getItem("traymbhkam_saved_documents_hub");
        if (storedDocs) {
          const pDocs = JSON.parse(storedDocs);
          if (Array.isArray(pDocs)) totalDocs = pDocs.length;
        }

        setStats({
          activeLeads,
          confirmedTours,
          totalVouchers: totalDocs,
          totalItineraries: totalDocs,
          pendingPayables,
          leadsByStage: chartData,
          recentActivity: recentLeads
        });
      } catch (e) {
        console.warn("Storage sync:", e);
      }
    }

    async function fetchDashboardData() {
      try {
        const { data: leads } = await supabase.from('leads').select('*').limit(100);
        if (leads && leads.length > 0) {
          const active = leads.filter((l: any) => l.status !== 'lost').length;
          const confirmed = leads.filter((l: any) => l.status === 'confirmed').length;
          setStats(prev => ({
            ...prev,
            activeLeads: active || prev.activeLeads,
            confirmedTours: confirmed || prev.confirmedTours,
            recentActivity: leads.slice(0, 5)
          }));
        }
      } catch (error) {
        // Fallback silently if supabase not configured
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* ========================================================================= */}
      {/* 1. REFINED LUXURY EXECUTIVE GREETING (NO WEIRD BANNER) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 uppercase tracking-wider text-[10px]">
              Traymbhkam Tour &amp; Travels
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">Haridwar Operations Desk</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Yatra Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome, Mr. Gagandeep &bull; Chardham Pilgrimage Bookings, Vouchers &amp; Billing Desk
          </p>
        </div>

        {/* Executive Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link 
            href="/rentals" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-900 rounded-lg font-medium text-xs transition cursor-pointer"
          >
            <Bike size={14} className="text-amber-700" />
            <span>Bike &amp; Scooty Desk</span>
          </Link>

          <Link 
            href="/invoices" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-xs shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition cursor-pointer"
          >
            <FileText size={14} className="text-amber-600" />
            <span>Quick Invoice</span>
          </Link>

          <Link 
            href="/transport" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-xs shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition cursor-pointer"
          >
            <Car size={14} className="text-slate-600" />
            <span>Fleet Voucher</span>
          </Link>

          <Link 
            href="/itinerary-builder" 
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0b1320] hover:bg-[#16233b] text-white rounded-lg font-semibold text-xs shadow-sm transition cursor-pointer border border-slate-800"
          >
            <Plus size={14} className="text-amber-400" />
            <span>New Proposal</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REFINED KPI METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: Active Leads */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Inquiries</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users size={15} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.activeLeads}</p>
          <p className="text-[10.5px] text-slate-500 mt-1">Ongoing Pilgrim Leads</p>
        </div>

        {/* KPI 2: Confirmed Yatras */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Tours</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.confirmedTours}</p>
          <p className="text-[10.5px] text-emerald-700 font-medium mt-1">Booked Yatra Tours</p>
        </div>

        {/* KPI 3: Itineraries Generated */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proposals</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Map size={15} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalItineraries}</p>
          <p className="text-[10.5px] text-slate-500 mt-1">Itinerary Quotes</p>
        </div>

        {/* KPI 4: Service Vouchers */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Vouchers</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Hotel size={15} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalVouchers}</p>
          <p className="text-[10.5px] text-slate-500 mt-1">Hotel &amp; Fleet Vouchers</p>
        </div>

        {/* KPI 5: Vendor Payables */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Partner Payables</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <Store size={15} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">₹{stats.pendingPayables.toLocaleString("en-IN")}</p>
          <p className="text-[10.5px] text-slate-500 mt-1">Hotels &amp; Cabs Due</p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CHARDHAM CIRCUIT PRESETS (HARIDWAR HUB) */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Compass className="text-amber-600" size={17} />
              Chardham Yatra Circuit Presets &bull; Haridwar Departures
            </h2>
            <p className="text-xs text-slate-500">Quick-launch customized package proposals for clients</p>
          </div>
          <Link 
            href="/itinerary-builder" 
            className="text-xs font-semibold text-slate-700 hover:text-amber-700 flex items-center gap-1 transition"
          >
            Itinerary Studio <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DHAM_CIRCUITS.map((circuit, idx) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-amber-400/80 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/70">
                    {circuit.badge}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">{circuit.days}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 mb-0.5">{circuit.name}</h3>
                <p className="text-[10px] text-slate-500 leading-tight mb-2">{circuit.dhams}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">{circuit.route}</span>
                <Link 
                  href="/itinerary-builder" 
                  className="font-semibold text-amber-700 hover:underline"
                >
                  Configure &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. REAL CUSTOMER TOUR SHOWCASE (UPLOADED REVIEWS) */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ImageIcon size={15} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Recent Pilgrim Tour Groups &bull; Authentic Reviews
              </h2>
              <p className="text-xs text-slate-500">Real pilgrims on holy yatra with Traymbhkam Tour and Travels</p>
            </div>
          </div>
          <Link 
            href="/gallery" 
            className="text-xs font-semibold text-slate-700 hover:text-amber-700 flex items-center gap-1 transition"
          >
            View Photo Library <ArrowRight size={13} />
          </Link>
        </div>

        {/* Subtle Luxury Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {RECENT_REVIEWS.map((review, i) => (
            <Link 
              key={i} 
              href="/gallery" 
              className="group relative overflow-hidden rounded-lg border border-slate-200 aspect-4/3 bg-slate-100 block shadow-2xs hover:shadow-xs transition"
            >
              <img 
                src={review.src} 
                alt={review.caption}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5">
                <span className="text-[9.5px] font-semibold text-white leading-tight">
                  {review.caption}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FAST ACCESS STUDIOS LAUNCHPAD */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-slate-900">Operations &amp; Document Studios</h2>
          <p className="text-xs text-slate-500">Fast access to itineraries, invoices, vouchers, and WhatsApp desk</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {[
            { label: "Bike & Scooty", desc: "Haridwar Rentals", icon: Bike, color: "text-amber-700", bg: "bg-amber-50", href: "/rentals" },
            { label: "Itinerary Studio", desc: "PDF Proposals", icon: Map, color: "text-slate-800", bg: "bg-slate-100", href: "/itinerary-builder" },
            { label: "Billing Invoices", desc: "Advance & Receipts", icon: FileText, color: "text-amber-700", bg: "bg-amber-50", href: "/invoices" },
            { label: "Hotel Vouchers", desc: "Room Allocation", icon: Hotel, color: "text-indigo-700", bg: "bg-indigo-50", href: "/hotels" },
            { label: "Transport Vouchers", desc: "Tempo & Cabs", icon: Car, color: "text-emerald-700", bg: "bg-emerald-50", href: "/transport" },
            { label: "Cost Calculator", desc: "Pricing Engine", icon: Users, color: "text-blue-700", bg: "bg-blue-50", href: "/quotation-calculator" },
            { label: "WhatsApp Desk", desc: "Live Chat Desk", icon: Store, color: "text-rose-700", bg: "bg-rose-50", href: "/whatsapp-desk" },
          ].map((action, i) => (
            <Link 
              key={i} 
              href={action.href} 
              className="flex flex-col p-3 rounded-lg border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/60 transition-all group"
            >
              <div className={`w-8 h-8 rounded-md ${action.bg} flex items-center justify-center mb-2`}>
                <action.icon size={16} className={action.color} />
              </div>
              <span className="font-bold text-slate-900 text-xs group-hover:text-amber-700 transition-colors">{action.label}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{action.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. CONVERSION PIPELINE & RECENT INQUIRIES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Pipeline Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="text-slate-800" size={16} /> Pilgrim Lead Pipeline
              </h2>
              <p className="text-xs text-slate-500">Inquiries by conversion stage</p>
            </div>
            <Link href="/leads" className="text-xs font-semibold text-slate-600 hover:text-amber-700 flex items-center gap-1">
              View Leads <ArrowRight size={13} />
            </Link>
          </div>

          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.leadsByStage} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'}}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Inquiries List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="text-amber-600" size={16} /> Recent Inquiries
              </h2>
              <Link href="/leads" className="text-xs font-semibold text-slate-600 hover:underline">
                View All
              </Link>
            </div>

            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-1.5">
                <Users size={28} className="mx-auto text-slate-300" />
                <p className="text-xs">No recent inquiries recorded yet.</p>
                <Link 
                  href="/leads" 
                  className="inline-block text-xs font-semibold text-amber-700 hover:underline mt-1"
                >
                  + Add New Lead
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.recentActivity.map((lead: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{lead.name || "Guest Pilgrim"}</p>
                      <p className="text-[10px] text-slate-500">{lead.phone || "No phone"} &bull; {lead.destination || "Chardham"}</p>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 shrink-0">
                      {STAGE_LABELS[lead.status] || lead.status || "New"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100">
            <Link 
              href="/whatsapp-desk" 
              className="w-full py-2 px-3 rounded-lg bg-[#0b1320] hover:bg-[#16233b] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              💬 WhatsApp Live Desk
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
