"use client";

import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { GlobalSearch } from "@/components/GlobalSearch";
import { AuthScreen } from "@/components/AuthScreen";
import { Loader2, LogOut, PhoneCall, MapPin, ShieldCheck } from "lucide-react";

export function CrmLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1320] text-white gap-3">
        <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-2xl flex items-center justify-center border border-amber-400/40">
          <img 
            src="/logo.png" 
            alt="Traymbhkam Tour and Travels" 
            className="h-full w-full object-contain animate-pulse" 
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mt-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span>Loading Traymbhkam CRM...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <>
      <Sidebar />
      <main className="lg:pl-72 flex-1 flex flex-col min-h-screen pt-16 lg:pt-0 bg-[#f8fafc]">
        {/* Sleek Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/70 px-4 md:px-7 py-2.5 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <GlobalSearch />
          
          <div className="flex items-center gap-3 text-xs">
            {/* Haridwar Hub Badge */}
            <div className="hidden xl:flex items-center gap-1.5 text-slate-600 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/80">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Haridwar Station Gate 2</span>
            </div>

            {/* Helpline CTA */}
            <a 
              href="tel:+918266016066" 
              className="hidden sm:flex items-center gap-1.5 text-slate-800 hover:text-amber-700 font-semibold bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 px-2.5 py-1 rounded-md transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              <span>+91 82660 16066</span>
            </a>

            <span className="hidden sm:inline text-slate-200">|</span>

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                {user?.name || "Mr. Gagandeep"}
              </span>
              <button
                onClick={logout}
                title="Sign Out"
                className="flex items-center gap-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 w-full mx-auto p-4 md:p-6 lg:p-7">
          {children}
        </div>
      </main>
    </>
  );
}
