"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Hotel, 
  Car, 
  Bike,
  Menu, 
  X, 
  Map, 
  Users, 
  Store, 
  Settings, 
  LogOut, 
  Image as ImageIcon,
  FolderArchive,
  MessageSquare,
  Calculator,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navSections = [
  {
    title: "Yatra Operations",
    items: [
      { name: "Yatra Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Chardham Itineraries", href: "/itinerary-builder", icon: Map, badge: "Hub" },
      { name: "Bike & Scooty Rentals", href: "/rentals", icon: Bike, badge: "Haridwar" },
      { name: "Documents & Vouchers", href: "/documents", icon: FolderArchive },
      { name: "Hotel Vouchers", href: "/hotels", icon: Hotel },
      { name: "Fleet & Transport", href: "/transport", icon: Car },
    ]
  },
  {
    title: "Commercials & Leads",
    items: [
      { name: "Trip Cost Calculator", href: "/quotation-calculator", icon: Calculator },
      { name: "Invoices & Billing", href: "/invoices", icon: FileText },
      { name: "Pilgrim Leads", href: "/leads", icon: Users },
      { name: "WhatsApp Live Desk", href: "/whatsapp-desk", icon: MessageSquare, badge: "Live" },
    ]
  },
  {
    title: "Assets & Partners",
    items: [
      { name: "Dham Photo Library", href: "/gallery", icon: ImageIcon },
      { name: "Vendors & Payables", href: "/vendors", icon: Store },
      { name: "CRM Configuration", href: "/settings", icon: Settings },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Top Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0c1524] border-b border-slate-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shadow-xs border border-amber-500/30">
            <img src="/logo.png" alt="Traymbhkam Travels" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight">Traymbhkam Travels</span>
            <span className="text-[9px] text-amber-400 font-semibold tracking-wider uppercase">Chardham Specialist</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Luxury Dark Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0b1320] text-slate-300 border-r border-slate-800/80 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-slate-800/80 bg-[#080e18]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-white p-1 shadow-sm flex items-center justify-center border border-amber-400/40 group-hover:border-amber-400 transition-colors shrink-0">
              <img 
                src="/logo.png" 
                alt="Traymbhkam Tour and Travels" 
                className="h-full w-full object-contain" 
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors truncate">
                  Traymbhkam
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  EST. 2022
                </span>
              </div>
              <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                Tour &amp; Travels &bull; Haridwar
              </span>
            </div>
          </Link>
        </div>

        {/* Categorized Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              <div className="px-3 pb-1.5 text-[9.5px] font-bold uppercase tracking-widest text-slate-400">
                {section.title}
              </div>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 text-[12.5px] rounded-lg transition-all duration-150 group ${
                      isActive
                        ? "bg-slate-800/90 text-amber-300 font-semibold border-l-2 border-amber-400 shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <item.icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-300"
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge ? (
                      <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded ${
                        isActive 
                          ? "bg-amber-400/20 text-amber-300" 
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight size={13} className={`opacity-0 group-hover:opacity-60 transition-opacity ${isActive ? "opacity-40" : ""}`} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Understated Haridwar Desk Status Card */}
          <div className="mx-1 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 text-[10.5px] flex items-center gap-1">
                <ShieldCheck size={13} className="text-amber-400" />
                UTDB Govt. Reg.
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">Verified</span>
            </div>
            <p className="text-[9.5px] text-slate-400 leading-tight">
              Reg: UTTR/HARIDWAR/08-2022/004983
            </p>
          </div>
        </div>

        {/* Compact User Profile */}
        <div className="p-3 border-t border-slate-800/80 bg-[#080e18] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xs shrink-0">
              G
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-200 truncate">
                {user?.name || "Mr. Gagandeep"}
              </span>
              <span className="text-[9.5px] text-slate-400 truncate">
                Haridwar Operations
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out of CRM"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
