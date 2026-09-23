"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { 
  Plus, 
  X, 
  Phone, 
  MapPin, 
  IndianRupee, 
  Loader2, 
  Pencil, 
  Trash2, 
  Users, 
  Download, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Calendar, 
  UserCheck, 
  Sparkles 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { exportToCsv } from "@/lib/exportCsv";

const COLUMNS = [
  { id: "new_inquiry",  label: "New Inquiry",  color: "bg-blue-500",    light: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-700"   },
  { id: "quoted",       label: "Quoted Sent",  color: "bg-purple-500",  light: "bg-purple-50", border: "border-purple-200",text: "text-purple-700" },
  { id: "follow_up",   label: "Follow Up",     color: "bg-amber-500",   light: "bg-amber-50",  border: "border-amber-200", text: "text-amber-700"  },
  { id: "confirmed",   label: "Confirmed Yatra", color: "bg-emerald-500", light: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700"},
  { id: "lost",        label: "Cancelled / Lost", color: "bg-red-500",     light: "bg-red-50",    border: "border-red-200",   text: "text-red-700"    },
];

export const SPIRITUAL_YATRA_PRESETS = [
  "Char Dham Yatra (Yamunotri · Gangotri · Kedarnath · Badrinath)",
  "Do Dham Yatra (Kedarnath + Badrinath)",
  "Do Dham Yatra (Yamunotri + Gangotri)",
  "Teen Dham Yatra (Yamunotri · Gangotri · Kedarnath)",
  "Ek Dham Yatra (Shri Kedarnath Dham Darshan)",
  "Ek Dham Yatra (Shri Badrinath Dham Darshan)",
  "VIP Kedarnath Yatra by Helicopter",
  "Panch Kedar Spiritual Yatra (Tungnath, Rudranath, etc.)",
  "Panch Badri Sacred Circuit",
  "Hemkund Sahib & Valley of Flowers",
  "Haridwar & Rishikesh Divine Ganga Aarti Tour"
];

export type Lead = {
  id: string;
  name: string;
  phone: string;
  destination: string;
  status: string;
  budget: number;
  advance_amount?: number;
  travel_dates?: string;
  pax_count?: string;
  notes: string;
  created_at: string;
};

type BoardState = Record<string, Lead[]>;

const emptyForm = {
  name: "",
  phone: "",
  destination: "Char Dham Yatra (Yamunotri · Gangotri · Kedarnath · Badrinath)",
  budget: "",
  advance_amount: "",
  travel_dates: "",
  pax_count: "04 Adults",
  notes: "",
  status: "new_inquiry"
};

const EMPTY_BOARD: BoardState = {
  new_inquiry: [],
  quoted: [],
  follow_up: [],
  confirmed: [],
  lost: []
};

export default function LeadPipeline() {
  const [board, setBoard] = useState<BoardState>(EMPTY_BOARD);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState(emptyForm);

  // WhatsApp Confirmation Modal State
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [activeWaLead, setActiveWaLead] = useState<Lead | null>(null);
  const [waPhone, setWaPhone] = useState("");
  const [waTravelDates, setWaTravelDates] = useState("");
  const [waPax, setWaPax] = useState("04 Adults");
  const [waTotalCost, setWaTotalCost] = useState<number | string>("");
  const [waAdvance, setWaAdvance] = useState<number | string>("");
  const [waSending, setWaSending] = useState(false);
  const [waResult, setWaResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("traymbhkam_leads_board");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            const allLeads = Object.values(parsed).flat() as Lead[];
            const isMockData = allLeads.length > 0 && allLeads.every(l => l.id.startsWith("lead-") && !l.destination);
            if (isMockData) {
              setBoard(EMPTY_BOARD);
              localStorage.setItem("traymbhkam_leads_board", JSON.stringify(EMPTY_BOARD));
              localStorage.setItem("traymbhkam_leads", JSON.stringify([]));
            } else {
              setBoard(parsed);
            }
          }
        } else {
          localStorage.setItem("traymbhkam_leads_board", JSON.stringify(EMPTY_BOARD));
          localStorage.setItem("traymbhkam_leads", JSON.stringify([]));
        }
      } catch (e) {}
    }
    fetchLeads();
  }, []);

  const saveBoardLocally = (newBoard: BoardState) => {
    setBoard(newBoard);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("traymbhkam_leads_board", JSON.stringify(newBoard));
        localStorage.setItem("traymbhkam_leads", JSON.stringify(Object.values(newBoard).flat()));
      } catch {}
    }
  };

  const fetchLeads = async () => {
    try {
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        const grouped: BoardState = { new_inquiry: [], quoted: [], follow_up: [], confirmed: [], lost: [] };
        data.forEach((lead: Lead) => {
          const col = lead.status || "new_inquiry";
          if (grouped[col]) grouped[col].push(lead);
        });
        saveBoardLocally(grouped);
      }
    } catch (err) {
      console.warn("Background leads sync:", err);
    }
  };

  const openNewForm = () => {
    setEditLead(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (lead: Lead) => {
    setEditLead(lead);
    setForm({
      name: lead.name,
      phone: lead.phone || "",
      destination: lead.destination || SPIRITUAL_YATRA_PRESETS[0],
      budget: lead.budget?.toString() || "",
      advance_amount: lead.advance_amount?.toString() || "",
      travel_dates: lead.travel_dates || "",
      pax_count: lead.pax_count || "04 Adults",
      notes: lead.notes || "",
      status: lead.status
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const targetCol = form.status || "new_inquiry";

    if (editLead) {
      const updatedLead: Lead = {
        ...editLead,
        name: form.name.trim(),
        phone: form.phone.trim(),
        destination: form.destination.trim(),
        budget: Number(form.budget) || 0,
        advance_amount: Number(form.advance_amount) || 0,
        travel_dates: form.travel_dates.trim(),
        pax_count: form.pax_count.trim(),
        notes: form.notes.trim(),
        status: targetCol
      };

      const newBoard: BoardState = { ...board };
      Object.keys(newBoard).forEach(col => {
        newBoard[col] = newBoard[col].filter(l => l.id !== editLead.id);
      });
      newBoard[targetCol] = [updatedLead, ...(newBoard[targetCol] || [])];
      saveBoardLocally(newBoard);

      try {
        await supabase.from("leads").update(updatedLead).eq("id", editLead.id);
      } catch {}

      // Prompt WhatsApp confirmation if status updated to confirmed
      if (editLead.status !== "confirmed" && targetCol === "confirmed") {
        openWhatsAppModal(updatedLead);
      }
    } else {
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        name: form.name.trim(),
        phone: form.phone.trim(),
        destination: form.destination.trim(),
        budget: Number(form.budget) || 0,
        advance_amount: Number(form.advance_amount) || 0,
        travel_dates: form.travel_dates.trim(),
        pax_count: form.pax_count.trim(),
        notes: form.notes.trim(),
        status: targetCol,
        created_at: new Date().toISOString().split("T")[0]
      };

      const newBoard: BoardState = {
        ...board,
        [targetCol]: [newLead, ...(board[targetCol] || [])]
      };
      saveBoardLocally(newBoard);

      try {
        await supabase.from("leads").insert(newLead);
      } catch {}

      if (targetCol === "confirmed") {
        openWhatsAppModal(newLead);
      }
    }

    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    const newBoard: BoardState = { ...board };
    Object.keys(newBoard).forEach(col => {
      newBoard[col] = newBoard[col].filter(l => l.id !== id);
    });
    saveBoardLocally(newBoard);

    try {
      await supabase.from("leads").delete().eq("id", id);
    } catch {}
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = [...board[source.droppableId]];
    const destCol = source.droppableId === destination.droppableId ? sourceCol : [...board[destination.droppableId]];

    const [movedLead] = sourceCol.splice(source.index, 1);
    const prevStatus = movedLead.status;
    movedLead.status = destination.droppableId;
    destCol.splice(destination.index, 0, movedLead);

    const newBoard = { ...board, [source.droppableId]: sourceCol, [destination.droppableId]: destCol };
    saveBoardLocally(newBoard);

    // Update status in DB
    if (source.droppableId !== destination.droppableId) {
      try {
        await supabase.from("leads").update({ status: destination.droppableId }).eq("id", draggableId);
      } catch {}

      // If dragged into "confirmed" column, trigger WhatsApp confirmation modal
      if (prevStatus !== "confirmed" && destination.droppableId === "confirmed") {
        openWhatsAppModal(movedLead);
      }
    }
  };

  // Open WhatsApp Confirmation Modal
  const openWhatsAppModal = (lead: Lead) => {
    setActiveWaLead(lead);
    setWaPhone(lead.phone || "");
    setWaTravelDates(lead.travel_dates || "May – June 2026");
    setWaPax(lead.pax_count || "04 Adults");
    setWaTotalCost(lead.budget || 0);
    setWaAdvance(lead.advance_amount || 0);
    setWaResult(null);
    setWaModalOpen(true);
  };

  // Send WhatsApp Booking Confirmation via Meta Cloud API
  const handleSendMetaWhatsApp = async () => {
    if (!activeWaLead) return;
    if (!waPhone.trim()) {
      alert("Please provide customer phone number.");
      return;
    }

    setWaSending(true);
    setWaResult(null);

    const total = Number(waTotalCost) || 0;
    const advance = Number(waAdvance) || 0;
    const balance = Math.max(0, total - advance);

    // Load credentials from localStorage
    let phoneNumberId = "";
    let accessToken = "";
    if (typeof window !== "undefined") {
      try {
        phoneNumberId = localStorage.getItem("traymbhkam_meta_phone_number_id") || "";
        accessToken = localStorage.getItem("traymbhkam_meta_access_token") || "";
        const cached = localStorage.getItem("traymbhkam_settings_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          phoneNumberId = phoneNumberId || parsed.meta_phone_number_id || "";
          accessToken = accessToken || parsed.meta_access_token || "";
        }
      } catch {}
    }

    try {
      const res = await fetch("/api/whatsapp/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: waPhone,
          customerName: activeWaLead.name,
          yatraName: activeWaLead.destination || "Chardham Yatra 2026",
          bookingId: `BK-${activeWaLead.id.slice(-6).toUpperCase()}`,
          travelDates: waTravelDates,
          paxCount: waPax,
          totalAmount: total,
          advancePaid: advance,
          balanceDue: balance,
          phoneNumberId,
          accessToken
        })
      });

      const data = await res.json();
      if (data.success) {
        setWaResult({ 
          success: true, 
          message: `✓ Booking confirmation successfully delivered via Meta Cloud WhatsApp API to +${data.cleanPhone}!` 
        });
      } else {
        setWaResult({ 
          success: false, 
          message: `Meta API: ${data.error || "Failed to send."} You can also click "Open WhatsApp Web" below as a 1-click alternative.` 
        });
      }
    } catch (err: any) {
      setWaResult({ 
        success: false, 
        message: `Error: ${err.message}. You can use the 1-click WhatsApp Web button below.` 
      });
    } finally {
      setWaSending(false);
    }
  };

  // Fallback 1-click WhatsApp Web
  const handleOpenWhatsAppWeb = () => {
    if (!activeWaLead) return;
    const total = Number(waTotalCost) || 0;
    const advance = Number(waAdvance) || 0;
    const balance = Math.max(0, total - advance);

    const msg = 
      `🙏 *ॐ नमः शिवाय | जय बद्री विशाल* 🙏\n\n` +
      `*DEV BHOOMI YATRA BOOKING CONFIRMATION*\n` +
      `*Traymbhkam Tour and Travels*\n\n` +
      `Dear *${activeWaLead.name || "Devotee"}*,\n` +
      `Your sacred pilgrimage booking is successfully confirmed! 🚩\n\n` +
      `📋 *Booking Particulars:*\n` +
      `• *Yatra Package:* ${activeWaLead.destination || "Chardham Yatra 2026"}\n` +
      `• *Booking ID:* BK-${activeWaLead.id.slice(-6).toUpperCase()}\n` +
      `• *Travel Dates:* ${waTravelDates}\n` +
      `• *Pilgrims (Pax):* ${waPax}\n` +
      (total > 0 ? `• *Total Cost:* ₹${total.toLocaleString("en-IN")}\n` : "") +
      (advance > 0 ? `• *Advance Received:* ₹${advance.toLocaleString("en-IN")}\n` : "") +
      (balance > 0 ? `• *Balance Due:* ₹${balance.toLocaleString("en-IN")}\n` : "") +
      `\n✨ *Pilgrimage Support:*\n` +
      `• Driver and hotel vouchers will be sent before travel.\n` +
      `• Keep your Char Dham Biometric Registration Pass ready.\n\n` +
      `📞 *24x7 Helpline:* +91 82660 16066 (Mr. Gagandeep)\n` +
      `📍 *Office:* Opp. Railway Station Gate No. 2, Haridwar\n\n` +
      `Wishing you a divine and blessed Char Dham Darshan! 🌸🛕`;

    const cleanPhone = waPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // CSV Export
  const handleExportCsv = () => {
    const allLeads = Object.values(board).flat();
    const headers = ["Lead Name", "Phone Number", "Spiritual Yatra", "Budget (INR)", "Advance Paid", "Travel Dates", "Pax Count", "Status", "Notes", "Inquiry Date"];
    const rows = allLeads.map(l => [
      l.name,
      l.phone || "",
      l.destination || "",
      l.budget || 0,
      l.advance_amount || 0,
      l.travel_dates || "",
      l.pax_count || "",
      COLUMNS.find(c => c.id === l.status)?.label || l.status,
      l.notes || "",
      l.created_at || ""
    ]);
    exportToCsv(`Travel_to_Uttarakhand_Yatra_Leads_${new Date().toISOString().split("T")[0]}`, headers, rows);
  };

  const totalLeads = Object.values(board).flat().length;
  const confirmedValue = board.confirmed.reduce((s, l) => s + Number(l.budget || 0), 0);
  const confirmedAdvance = board.confirmed.reduce((s, l) => s + Number(l.advance_amount || 0), 0);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-sky-600" size={26} /> Spiritual Yatra Lead Pipeline
          </h1>
          <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-2">
            <span>{totalLeads} pilgrimage inquiries</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-semibold">₹{confirmedValue.toLocaleString()} booked yatra value</span>
            {confirmedAdvance > 0 && (
              <>
                <span>&bull;</span>
                <span className="text-sky-700 font-semibold">(₹{confirmedAdvance.toLocaleString()} advance received)</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer hover:border-gray-300"
            title="Export all leads to Excel / CSV"
          >
            <Download size={16} className="text-emerald-600" /> Export CSV
          </button>
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium text-sm hover:bg-sky-600 transition-colors shadow-md shadow-sky-600/20 cursor-pointer"
          >
            <Plus size={16} /> + New Yatra Lead
          </button>
        </div>
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-sky-600" size={40} />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
            {COLUMNS.map((col) => (
              <div key={col.id} className="flex flex-col bg-gray-100 rounded-xl shrink-0 w-72 max-h-[calc(100vh-14rem)]">
                {/* Column Header */}
                <div className={`p-3 rounded-t-xl border-b ${col.border} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <span className="font-semibold text-gray-800 text-sm">{col.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.light} ${col.text}`}>
                    {board[col.id]?.length || 0}
                  </span>
                </div>

                {/* Cards */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto p-2 space-y-2 rounded-b-xl transition-colors ${snapshot.isDraggingOver ? col.light : ""}`}
                    >
                      {board[col.id]?.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`bg-white rounded-lg p-3 shadow-sm border border-gray-100 group transition-all ${snap.isDragging ? "shadow-lg rotate-1 scale-105 border-sky-300" : "hover:shadow-md"}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-gray-900 text-sm leading-tight">{lead.name}</h3>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button onClick={() => openEditForm(lead)} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="Edit Lead"><Pencil size={13} /></button>
                                  <button onClick={() => handleDelete(lead.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete Lead"><Trash2 size={13} /></button>
                                </div>
                              </div>
                              
                              {/* Destination / Spiritual Yatra */}
                              {lead.destination && (
                                <div className="flex items-center gap-1.5 text-xs text-[#0369a1] font-semibold mt-1.5 line-clamp-1">
                                  <MapPin size={11} className="shrink-0" /> {lead.destination}
                                </div>
                              )}

                              {/* Phone */}
                              {lead.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                                  <Phone size={11} className="shrink-0 text-gray-400" /> {lead.phone}
                                </div>
                              )}

                              {/* Travel Dates & Pax */}
                              {(lead.travel_dates || lead.pax_count) && (
                                <div className="flex items-center gap-2 text-[10.5px] text-gray-500 mt-1">
                                  {lead.travel_dates && <span>📅 {lead.travel_dates}</span>}
                                  {lead.pax_count && <span>• 👥 {lead.pax_count}</span>}
                                </div>
                              )}

                              {/* Financials: Budget / Advance */}
                              {lead.budget > 0 && (
                                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-50">
                                  <div className="flex items-center gap-1 font-bold text-emerald-700">
                                    <IndianRupee size={11} className="shrink-0" /> {Number(lead.budget).toLocaleString()}
                                  </div>
                                  {lead.advance_amount ? (
                                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                                      Adv: ₹{Number(lead.advance_amount).toLocaleString()}
                                    </span>
                                  ) : null}
                                </div>
                              )}

                              {lead.notes && (
                                <p className="text-xs text-gray-400 mt-1.5 italic line-clamp-2">{lead.notes}</p>
                              )}

                              {/* Action: Send WhatsApp Confirmation Button */}
                              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400">
                                  {new Date(lead.created_at).toLocaleDateString("en-IN")}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openWhatsAppModal(lead)}
                                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                    lead.status === "confirmed"
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  }`}
                                  title="Send official booking confirmation message on WhatsApp"
                                >
                                  <MessageCircle size={12} />
                                  <span>Confirm WhatsApp</span>
                                </button>
                              </div>

                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {board[col.id]?.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center py-8 text-gray-400 text-xs">Drop yatra leads here</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Modal 1: Lead Add / Edit Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{editLead ? "Edit Yatra Lead" : "Add Spiritual Yatra Lead"}</h2>
                  <p className="text-xs text-gray-500">Traymbhkam Tour and Travels Pilgrimage Inquiries</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Guest / Devotee Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mr. Ramesh Sharma & Family" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone / WhatsApp *</label>
                  <input 
                    type="text" 
                    placeholder="98765 43210" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Pilgrims (Pax)</label>
                  <input 
                    type="text" 
                    placeholder="04 Adults / 02 Senior Citizens" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" 
                    value={form.pax_count} 
                    onChange={e => setForm({...form, pax_count: e.target.value})} 
                  />
                </div>
              </div>

              {/* Spiritual Yatra Package Selection */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Sacred Yatra / Destination</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium text-gray-800"
                  value={form.destination} 
                  onChange={e => setForm({...form, destination: e.target.value})}
                >
                  {SPIRITUAL_YATRA_PRESETS.map((dest, i) => (
                    <option key={i} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Total Package Cost (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 114000" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold text-emerald-800" 
                    value={form.budget} 
                    onChange={e => setForm({...form, budget: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Advance Received (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 35000" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold text-sky-800" 
                    value={form.advance_amount} 
                    onChange={e => setForm({...form, advance_amount: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Travel Dates</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 10 May – 19 May 2026" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" 
                    value={form.travel_dates} 
                    onChange={e => setForm({...form, travel_dates: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Pipeline Stage</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white" 
                    value={form.status} 
                    onChange={e => setForm({...form, status: e.target.value})}
                  >
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Pilgrimage Notes / Special Requests</label>
                <textarea 
                  rows={2} 
                  placeholder="Helicopter requirement, ground floor rooms for elders, pony arrangements..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" 
                  value={form.notes} 
                  onChange={e => setForm({...form, notes: e.target.value})} 
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5 pt-3 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-500 text-white rounded-lg text-xs font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 cursor-pointer">
                {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                {saving ? "Saving..." : editLead ? "Update Yatra Lead" : "Save Lead"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Meta Cloud WhatsApp Booking Confirmation Modal */}
      {waModalOpen && activeWaLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setWaModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-8 space-y-4" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Send Booking Confirmation</h2>
                  <p className="text-xs text-gray-500">Official Meta Cloud WhatsApp Business API</p>
                </div>
              </div>
              <button onClick={() => setWaModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* Editable Confirmation Parameters */}
            <div className="space-y-3 text-xs bg-gray-50/70 p-3.5 rounded-xl border border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Guest Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={activeWaLead.name} 
                    className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Phone / WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={waPhone} 
                    onChange={e => setWaPhone(e.target.value)} 
                    placeholder="9876543210"
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded font-semibold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Yatra Package</label>
                <input 
                  type="text" 
                  readOnly 
                  value={activeWaLead.destination} 
                  className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded font-semibold text-[#0369a1]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Travel Dates</label>
                  <input 
                    type="text" 
                    value={waTravelDates} 
                    onChange={e => setWaTravelDates(e.target.value)} 
                    className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Pilgrims (Pax)</label>
                  <input 
                    type="text" 
                    value={waPax} 
                    onChange={e => setWaPax(e.target.value)} 
                    className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Advance Received (₹)</label>
                  <input 
                    type="number" 
                    value={waAdvance} 
                    onChange={e => setWaAdvance(e.target.value)} 
                    className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded font-bold text-emerald-800"
                  />
                </div>
              </div>
            </div>

            {/* Live Message Preview */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-[11.5px] space-y-1.5 text-gray-800">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Message Preview:</span>
              <p className="font-bold text-emerald-950">🙏 ॐ नमः शिवाय | जय बद्री विशाल 🙏</p>
              <p>Dear <strong>{activeWaLead.name}</strong>, your sacred pilgrimage <strong>{activeWaLead.destination}</strong> is successfully confirmed!</p>
              <p>• Dates: <strong>{waTravelDates}</strong> | Pilgrims: <strong>{waPax}</strong></p>
              {Number(waAdvance) > 0 && <p>• Advance Received: <strong>₹{Number(waAdvance).toLocaleString("en-IN")}</strong></p>}
              <p className="text-[10px] text-gray-500">Includes 24x7 Helpline +91 82660 16066 (Mr. Gagandeep) · Traymbhkam Tour and Travels</p>
            </div>

            {/* Status / Error feedback */}
            {waResult && (
              <div className={`p-3 rounded-xl text-xs font-medium ${waResult.success ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-900 border border-amber-200"}`}>
                {waResult.message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSendMetaWhatsApp}
                disabled={waSending}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
              >
                {waSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {waSending ? "Sending via Meta Cloud..." : "Send via Meta Cloud API"}
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsAppWeb}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                title="Open WhatsApp Web with pre-formatted message"
              >
                <MessageCircle size={15} className="text-emerald-600" />
                <span>Open WhatsApp Web</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
