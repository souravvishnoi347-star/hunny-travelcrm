"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  User, 
  Building2, 
  CreditCard, 
  FileText, 
  Hotel, 
  Car, 
  Bike,
  Map, 
  Settings, 
  ArrowRight,
  Sparkles,
  CornerDownLeft
} from "lucide-react";

interface SearchResult {
  id: string;
  category: "lead" | "vendor" | "payable" | "navigation";
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}

const QUICK_NAV: SearchResult[] = [
  { id: "nav-itin", category: "navigation", title: "Itinerary Studio", subtitle: "AI-Powered Chardham & Uttarakhand Brochure", href: "/itinerary-builder", badge: "Studio", badgeColor: "bg-sky-100 text-sky-700" },
  { id: "nav-rentals", category: "navigation", title: "Bike & Scooty Rentals Haridwar", subtitle: "Activa, Himalayan & Classic 350 bookings, slips & deposit desk", href: "/rentals", badge: "Rentals", badgeColor: "bg-amber-100 text-amber-800" },
  { id: "nav-gallery", category: "navigation", title: "Dham Photo Library & Media", subtitle: "High-resolution photography repository for tour brochures", href: "/gallery", badge: "Gallery", badgeColor: "bg-cyan-100 text-cyan-700" },
  { id: "nav-hotel", category: "navigation", title: "Hotel Service Voucher", subtitle: "A4 Accommodation Confirmation Voucher", href: "/hotels", badge: "Voucher", badgeColor: "bg-amber-100 text-amber-700" },
  { id: "nav-trans", category: "navigation", title: "Transport Service Voucher", subtitle: "Vehicle & Day-wise Transfer Voucher", href: "/transport", badge: "Voucher", badgeColor: "bg-purple-100 text-purple-700" },
  { id: "nav-inv", category: "navigation", title: "Tax Invoice Studio", subtitle: "Bill of Supply & Service Tax Invoice", href: "/invoices", badge: "Invoice", badgeColor: "bg-emerald-100 text-emerald-700" },
  { id: "nav-leads", category: "navigation", title: "Leads & Inquiries Pipeline", subtitle: "Kanban board for all customer inquiries", href: "/leads", badge: "CRM", badgeColor: "bg-blue-100 text-blue-700" },
  { id: "nav-vendors", category: "navigation", title: "Vendor Directory & Payables", subtitle: "Hotel partners, cab fleets & payment entries", href: "/vendors", badge: "Finance", badgeColor: "bg-orange-100 text-orange-700" },
  { id: "nav-settings", category: "navigation", title: "Agency & Owner Settings", subtitle: "Update business details, API keys & contact", href: "/settings", badge: "Config", badgeColor: "bg-gray-100 text-gray-700" },
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut: Ctrl+K or Cmd+K or "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search logic across leads, vendors, payables, and nav
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults(QUICK_NAV);
      setSelectedIndex(0);
      return;
    }

    const matched: SearchResult[] = [];

    // 1. Search Navigations
    QUICK_NAV.forEach(item => {
      if (item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)) {
        matched.push(item);
      }
    });

    // 2. Search Leads from localStorage
    if (typeof window !== "undefined") {
      try {
        const savedLeads = localStorage.getItem("traymbhkam_leads");
        if (savedLeads) {
          const parsed = JSON.parse(savedLeads);
          if (Array.isArray(parsed)) {
            parsed.forEach((lead: any) => {
              const name = (lead.name || "").toLowerCase();
              const phone = (lead.phone || "").toLowerCase();
              const dest = (lead.destination || "").toLowerCase();
              if (name.includes(q) || phone.includes(q) || dest.includes(q)) {
                matched.push({
                  id: `lead-${lead.id || Math.random()}`,
                  category: "lead",
                  title: lead.name || "Inquiry",
                  subtitle: `${lead.destination || "Uttarakhand"} • ${lead.phone || "No phone"} • ₹${lead.budget || "N/A"}`,
                  href: "/leads",
                  badge: lead.status?.replace("_", " ") || "Inquiry",
                  badgeColor: "bg-blue-100 text-blue-700"
                });
              }
            });
          }
        }
      } catch {}

      // 3. Search Vendors
      try {
        const savedVendors = localStorage.getItem("traymbhkam_vendors");
        if (savedVendors) {
          const parsed = JSON.parse(savedVendors);
          if (Array.isArray(parsed)) {
            parsed.forEach((vendor: any) => {
              const name = (vendor.name || "").toLowerCase();
              const person = (vendor.contact_person || "").toLowerCase();
              const phone = (vendor.phone || "").toLowerCase();
              const loc = (vendor.location || "").toLowerCase();
              if (name.includes(q) || person.includes(q) || phone.includes(q) || loc.includes(q)) {
                matched.push({
                  id: `vendor-${vendor.id || Math.random()}`,
                  category: "vendor",
                  title: vendor.name,
                  subtitle: `${vendor.type === "hotel" ? "Hotel" : "Transport"} • ${vendor.contact_person || ""} • ${vendor.phone || ""}`,
                  href: "/vendors",
                  badge: vendor.type || "Vendor",
                  badgeColor: vendor.type === "hotel" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
                });
              }
            });
          }
        }
      } catch {}

      // 4. Search Payables
      try {
        const savedPayables = localStorage.getItem("traymbhkam_payables");
        if (savedPayables) {
          const parsed = JSON.parse(savedPayables);
          if (Array.isArray(parsed)) {
            parsed.forEach((p: any) => {
              const desc = (p.description || "").toLowerCase();
              const vName = (p.vendors?.name || "").toLowerCase();
              if (desc.includes(q) || vName.includes(q)) {
                matched.push({
                  id: `pay-${p.id || Math.random()}`,
                  category: "payable",
                  title: p.description,
                  subtitle: `${p.vendors?.name || "Vendor"} • ₹${p.amount || 0} • Due: ${p.due_date || "N/A"}`,
                  href: "/vendors",
                  badge: p.status === "paid" ? "Paid" : "Outstanding",
                  badgeColor: p.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                });
              }
            });
          }
        }
      } catch {}
    }

    setResults(matched.slice(0, 10));
    setSelectedIndex(0);
  }, [query]);

  // Navigate to item
  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    router.push(item.href);
  };

  // Keyboard navigation
  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (results.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % (results.length || 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "lead": return <User className="w-4 h-4 text-blue-500" />;
      case "vendor": return <Building2 className="w-4 h-4 text-emerald-500" />;
      case "payable": return <CreditCard className="w-4 h-4 text-amber-500" />;
      default: return <Sparkles className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <>
      {/* Search trigger button in header */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-500 shadow-2xs hover:border-sky-300 hover:text-gray-900 transition cursor-pointer group"
      >
        <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-600" />
        <span className="hidden sm:inline">Search CRM (Leads, Vendors, Vouchers)...</span>
        <span className="sm:hidden">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 text-gray-500 rounded border border-gray-200 ml-2">
          Ctrl K
        </kbd>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
              <Search className="w-5 h-5 text-sky-600 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a guest name, phone, vendor, invoice, or voucher..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDownInInput}
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              {query && (
                <button 
                  onClick={() => setQuery("")}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block text-[10px] font-mono bg-gray-200/80 text-gray-600 px-1.5 py-0.5 rounded">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto p-2 space-y-1 max-h-[60vh]">
              {results.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  No matching leads, vendors or pages found for "{query}"
                </div>
              ) : (
                results.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                      selectedIndex === idx ? "bg-sky-50 text-sky-900 font-medium" : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-2xs border border-gray-200/80 flex items-center justify-center shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-gray-900 truncate">{item.title}</span>
                          {item.badge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 uppercase tracking-wider ${item.badgeColor || "bg-gray-100 text-gray-600"}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 shrink-0 transition ${selectedIndex === idx ? "text-sky-600 translate-x-0.5" : "text-gray-300"}`} />
                  </div>
                ))
              )}
            </div>

            {/* Footer / Keyboard hints */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <div className="flex items-center gap-3">
                <span><kbd className="font-mono bg-white px-1 py-0.5 rounded border text-[10px]">↑</kbd> <kbd className="font-mono bg-white px-1 py-0.5 rounded border text-[10px]">↓</kbd> Navigate</span>
                <span><kbd className="font-mono bg-white px-1 py-0.5 rounded border text-[10px]">↵</kbd> Select</span>
              </div>
              <span>Traymbhkam Tour and Travels CRM</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
