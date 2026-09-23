"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  FolderArchive, 
  FileText, 
  Hotel, 
  Car, 
  Map, 
  Search, 
  Trash2, 
  Download, 
  ExternalLink, 
  Filter, 
  Calendar, 
  User, 
  IndianRupee, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowUpDown,
  FileCheck,
  RefreshCw,
  Eye
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getSavedDocuments, deleteDocumentFromHub, SavedDocument, saveDocumentToHub } from "@/lib/documentsHub";

export default function DocumentsHubPage() {
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [selectedType, setSelectedType] = useState<"all" | "hotel_voucher" | "transport_voucher" | "itinerary" | "invoice">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "amount">("newest");
  const [deleteModalDoc, setDeleteModalDoc] = useState<SavedDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from local hub without any mock/sample data
  const loadDocs = () => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("traymbhkam_saved_documents_hub");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            // Permanently purge any sample/demo documents from local storage
            const cleaned = parsed.filter((d: any) => !d.id?.startsWith("sample-"));
            if (cleaned.length !== parsed.length) {
              localStorage.setItem("traymbhkam_saved_documents_hub", JSON.stringify(cleaned));
            }
          }
        }
      } catch {}
    }
    const docs = getSavedDocuments().filter(d => !d.id.startsWith("sample-"));
    setDocuments(docs);
  };

  const handleClearAllDocuments = () => {
    if (confirm("Are you sure you want to clear all documents from the Doc Hub?")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("traymbhkam_saved_documents_hub");
      }
      setDocuments([]);
      showToast("✓ All documents cleared successfully from Doc Hub.");
    }
  };

  useEffect(() => {
    loadDocs();
    handleSyncCloud();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cloud Sync to fetch Supabase records if available
  const handleSyncCloud = async () => {
    setLoading(true);
    try {
      const [vouchersRes, invoicesRes, itinsRes] = await Promise.allSettled([
        supabase.from("vouchers").select("*").order("created_at", { ascending: false }).limit(25),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(25),
        supabase.from("itineraries").select("*").order("created_at", { ascending: false }).limit(25)
      ]);

      let addedCount = 0;
      if (vouchersRes.status === "fulfilled" && Array.isArray(vouchersRes.value.data)) {
        vouchersRes.value.data.forEach((v: any) => {
          const docType = v.voucher_type === "transport" ? "transport_voucher" : "hotel_voucher";
          const data = v.document_data || {};
          saveDocumentToHub({
            id: `cloud-v-${v.id}`,
            type: docType,
            title: docType === "hotel_voucher" ? `Hotel Voucher - ${v.guest_name || "Guest"}` : `Transport Voucher - ${v.guest_name || "Guest"}`,
            docNumber: data.voucherNo || data.exoNo || `VCH-${v.id.slice(0, 6).toUpperCase()}`,
            guestName: v.guest_name || "Guest",
            guestPhone: data.guestPhone || data.managerMobile || "",
            travelDates: data.tripDates || data.arrivalDate || "",
            createdAt: v.created_at || new Date().toISOString(),
            detailsSummary: docType === "hotel_voucher" 
              ? `${data.stays?.length || 0} Hotel Stays` 
              : `Vehicle: ${data.vehicleType || "Fleet"} (${data.itinerary?.length || 0} Days)`,
            studioUrl: docType === "hotel_voucher" ? "/hotels" : "/transport",
            rawPayload: data
          });
          addedCount++;
        });
      }

      if (invoicesRes.status === "fulfilled" && Array.isArray(invoicesRes.value.data)) {
        invoicesRes.value.data.forEach((inv: any) => {
          const data = inv.document_data || {};
          saveDocumentToHub({
            id: `cloud-inv-${inv.id}`,
            type: "invoice",
            title: `Tax Invoice - ${data.guestName || inv.invoice_number || "Invoice"}`,
            docNumber: inv.invoice_number || `INV-${inv.id.slice(0, 6).toUpperCase()}`,
            guestName: data.guestName || "Valued Client",
            guestPhone: data.guestPhone || "",
            travelDates: data.travelDate || data.bookingDate || "",
            amount: inv.total_amount || 0,
            paidAmount: Number(data.amountPaid) || 0,
            pendingAmount: (inv.total_amount || 0) - (Number(data.amountPaid) || 0),
            createdAt: inv.created_at || new Date().toISOString(),
            detailsSummary: `Total Billed: ₹${Number(inv.total_amount || 0).toLocaleString("en-IN")}`,
            studioUrl: "/invoices",
            rawPayload: data
          });
          addedCount++;
        });
      }

      if (itinsRes.status === "fulfilled" && Array.isArray(itinsRes.value.data)) {
        itinsRes.value.data.forEach((it: any) => {
          const data = it.document_data || {};
          saveDocumentToHub({
            id: `cloud-itin-${it.id}`,
            type: "itinerary",
            title: it.title || "Chardham Yatra Itinerary",
            docNumber: `ITIN-${it.id.slice(0, 6).toUpperCase()}`,
            guestName: data.preparedFor || "Valued Devotee",
            travelDates: data.travelDates || "",
            amount: it.total_cost || 0,
            createdAt: it.created_at || new Date().toISOString(),
            detailsSummary: `Route: ${data.routeCovered || "Pilgrimage Route"}`,
            studioUrl: "/itinerary-builder",
            rawPayload: data
          });
          addedCount++;
        });
      }

      loadDocs();
      showToast(`✓ Cloud sync complete! Updated documents vault.`);
    } catch (err) {
      console.warn("Sync failed:", err);
      showToast("Cloud sync failed or offline. Using local records.");
    } finally {
      setLoading(false);
    }
  };

  // Delete document action
  const confirmDelete = () => {
    if (!deleteModalDoc) return;
    const updated = deleteDocumentFromHub(deleteModalDoc.id);
    setDocuments(updated);
    showToast(`✓ Deleted "${deleteModalDoc.title}" successfully.`);
    setDeleteModalDoc(null);
  };

  // Export filtered documents as CSV
  const handleExportCSV = async () => {
    try {
      const headers = ["Doc Type", "Doc Number", "Title", "Guest Name", "Phone", "Dates", "Amount (₹)", "Created At"];
      const rows = filteredDocs.map(d => [
        d.type.replace("_", " ").toUpperCase(),
        d.docNumber || "",
        d.title,
        d.guestName,
        d.guestPhone || "",
        d.travelDates || "",
        d.amount ? d.amount.toString() : "",
        new Date(d.createdAt).toLocaleDateString("en-IN")
      ]);
      const { exportToCsv } = await import("@/lib/exportCsv");
      exportToCsv("All_Vouchers_and_Documents", headers, rows);
    } catch (e) {
      alert("Could not export CSV: " + e);
    }
  };

  // Analytics Calculations
  const analytics = useMemo(() => {
    const totalDocs = documents.length;
    const hotelVouchers = documents.filter(d => d.type === "hotel_voucher").length;
    const transportVouchers = documents.filter(d => d.type === "transport_voucher").length;
    const itineraries = documents.filter(d => d.type === "itinerary").length;
    const invoices = documents.filter(d => d.type === "invoice").length;

    const totalInvoiceAmount = documents
      .filter(d => d.type === "invoice")
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    const totalCollected = documents
      .filter(d => d.type === "invoice")
      .reduce((sum, d) => sum + (d.paidAmount || 0), 0);

    const totalPending = documents
      .filter(d => d.type === "invoice")
      .reduce((sum, d) => sum + (d.pendingAmount || 0), 0);

    return {
      totalDocs,
      hotelVouchers,
      transportVouchers,
      itineraries,
      invoices,
      totalInvoiceAmount,
      totalCollected,
      totalPending
    };
  }, [documents]);

  // Filtering & Sorting
  const filteredDocs = useMemo(() => {
    let result = documents.filter(d => {
      if (selectedType !== "all" && d.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = d.title.toLowerCase().includes(q);
        const matchNumber = d.docNumber?.toLowerCase().includes(q);
        const matchGuest = d.guestName.toLowerCase().includes(q);
        const matchPhone = d.guestPhone?.toLowerCase().includes(q);
        const matchDates = d.travelDates?.toLowerCase().includes(q);
        return matchTitle || matchNumber || matchGuest || matchPhone || matchDates;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name") return a.guestName.localeCompare(b.guestName);
      if (sortBy === "amount") return (b.amount || 0) - (a.amount || 0);
      return 0;
    });

    return result;
  }, [documents, selectedType, searchQuery, sortBy]);

  const getTypeBadge = (type: SavedDocument["type"]) => {
    switch (type) {
      case "hotel_voucher":
        return { label: "Hotel Voucher", icon: Hotel, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
      case "transport_voucher":
        return { label: "Transport Voucher", icon: Car, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
      case "itinerary":
        return { label: "Chardham Itinerary", icon: Map, bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" };
      case "invoice":
        return { label: "Tax Invoice", icon: FileText, bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-gray-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-[#0369a1] text-white flex items-center justify-center shadow-sm">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Documents & Records Hub
            </h1>
            <p className="text-xs text-gray-500">
              Central vault for all generated Vouchers, Itineraries & Tax Invoices with live search & analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncCloud}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Sync latest records from Supabase Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-600" : ""}`} />
            <span>Sync Cloud</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition cursor-pointer"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {documents.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllDocuments}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer"
              title="Clear all saved records from Hub"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear Hub</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {/* Total Documents */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">All Documents</span>
            <Layers className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-gray-900">{analytics.totalDocs}</span>
            <span className="text-[11px] text-gray-400 block mt-0.5">Records in storage</span>
          </div>
        </div>

        {/* Hotel Vouchers */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Hotel Vouchers</span>
            <Hotel className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-700">{analytics.hotelVouchers}</span>
            <span className="text-[11px] text-gray-400 block mt-0.5">Confirmed Lodgings</span>
          </div>
        </div>

        {/* Transport Vouchers */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Transport Vouchers</span>
            <Car className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-700">{analytics.transportVouchers}</span>
            <span className="text-[11px] text-gray-400 block mt-0.5">Fleet Dispatch Orders</span>
          </div>
        </div>

        {/* Itineraries */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Itineraries</span>
            <Map className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-purple-700">{analytics.itineraries}</span>
            <span className="text-[11px] text-gray-400 block mt-0.5">Custom Tour Plans</span>
          </div>
        </div>

        {/* Total Invoiced Amount */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-50/70 p-4 rounded-xl border border-sky-200 shadow-xs flex flex-col justify-between col-span-2 md:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between text-sky-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Invoiced</span>
            <IndianRupee className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-[#0369a1]">
              ₹{analytics.totalInvoiceAmount.toLocaleString("en-IN")}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold mt-0.5">
              <span className="text-emerald-700">Paid: ₹{analytics.totalCollected.toLocaleString("en-IN")}</span>
              <span className="text-gray-300">|</span>
              <span className="text-rose-600">Due: ₹{analytics.totalPending.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200">
            {[
              { id: "all", label: "All Records", count: analytics.totalDocs, icon: Layers },
              { id: "hotel_voucher", label: "Hotels", count: analytics.hotelVouchers, icon: Hotel },
              { id: "transport_voucher", label: "Transport", count: analytics.transportVouchers, icon: Car },
              { id: "itinerary", label: "Itineraries", count: analytics.itineraries, icon: Map },
              { id: "invoice", label: "Invoices", count: analytics.invoices, icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "bg-[#0369a1] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-200/80 text-gray-700"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Guest Name (A-Z)</option>
              <option value="amount">Highest Amount</option>
            </select>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Guest Name, Phone Number, Voucher No, or Travel Dates..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Document Grid / Table */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
            <FolderArchive className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Documents Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {searchQuery 
              ? `No documents match "${searchQuery}". Try a different keyword.` 
              : "No documents stored in this category yet. When you generate vouchers, invoices or itineraries, they will appear here automatically."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const badge = getTypeBadge(doc.type);
            const BadgeIcon = badge.icon;
            return (
              <div 
                key={doc.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-all p-4.5 flex flex-col justify-between group relative"
              >
                {/* Header Tag & Doc Number */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                      {doc.docNumber || "N/A"}
                    </span>
                  </div>

                  {/* Title & Guest */}
                  <div className="mt-3 space-y-1">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-sky-700 transition line-clamp-1">
                      {doc.title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold">
                      <User className="w-3.5 h-3.5 text-[#0369a1] shrink-0" />
                      <span className="truncate">{doc.guestName || "Valued Guest"}</span>
                    </div>

                    {doc.guestPhone && (
                      <p className="text-[11px] text-gray-500 pl-5 font-mono">
                        {doc.guestPhone}
                      </p>
                    )}

                    {doc.travelDates && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-600 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{doc.travelDates}</span>
                      </div>
                    )}

                    {/* Summary / Route / Details */}
                    <p className="text-[11px] text-gray-500 bg-gray-50/80 p-2 rounded-lg border border-gray-100 mt-2 line-clamp-2 leading-relaxed">
                      {doc.detailsSummary}
                    </p>
                  </div>
                </div>

                {/* Footer: Amount & Action Buttons */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    {doc.amount !== undefined && doc.amount > 0 ? (
                      <div className="flex flex-col">
                        <span className="text-[9.5px] text-gray-400 uppercase font-bold">Amount</span>
                        <span className="text-sm font-black text-emerald-700">
                          ₹{doc.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(doc.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Delete Entry Button */}
                    <button
                      type="button"
                      onClick={() => setDeleteModalDoc(doc)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Delete this document record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Open in Studio Button */}
                    <Link
                      href={doc.studioUrl}
                      className="flex items-center gap-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0369a1] rounded-lg text-xs font-bold transition cursor-pointer border border-sky-200"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalDoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => setDeleteModalDoc(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Document Record</h3>
                <p className="text-xs text-gray-500">Are you sure you want to remove this record?</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
              <p><strong>Title:</strong> {deleteModalDoc.title}</p>
              <p><strong>Guest:</strong> {deleteModalDoc.guestName}</p>
              <p><strong>Doc No:</strong> {deleteModalDoc.docNumber}</p>
            </div>

            <p className="text-xs text-gray-500">
              This will remove the entry from your Documents Hub. Any generated PDF files already on your computer will remain intact.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
