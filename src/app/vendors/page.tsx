"use client";

import { useState, useEffect } from "react";
import { Plus, Building2, Car, IndianRupee, MapPin, Phone, User, CheckCircle2, Circle, Pencil, Trash2, X, Loader2, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { exportToCsv } from "@/lib/exportCsv";

type Vendor = {
  id: string;
  name: string;
  type: string;
  contact_person: string;
  phone: string;
  location: string;
  notes: string;
};

type Payable = {
  id: string;
  vendor_id: string;
  description: string;
  amount: number;
  status: string;
  due_date: string;
  vendors?: { name: string; type: string };
};

const emptyVendor = { name: "", type: "hotel", contact_person: "", phone: "", location: "", notes: "" };
const emptyPayable = { vendor_id: "", description: "", amount: "", due_date: "" };

const DEFAULT_VENDORS: Vendor[] = [];
const DEFAULT_PAYABLES: Payable[] = [];

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState<"vendors" | "payables">("vendors");
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showPayableForm, setShowPayableForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [vendorForm, setVendorForm] = useState(emptyVendor);
  const [editVendorId, setEditVendorId] = useState<string | null>(null);

  const [payableForm, setPayableForm] = useState(emptyPayable);

  // Initialize from localStorage first, then sync with Supabase
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedVendors = localStorage.getItem("traymbhkam_vendors");
        if (savedVendors) {
          const parsed = JSON.parse(savedVendors);
          if (Array.isArray(parsed)) {
            const isMock = parsed.length > 0 && parsed.every((v: any) => v.id && v.id.startsWith("v-"));
            if (isMock) {
              setVendors([]);
              localStorage.setItem("traymbhkam_vendors", JSON.stringify([]));
            } else {
              setVendors(parsed);
            }
          }
        } else {
          localStorage.setItem("traymbhkam_vendors", JSON.stringify([]));
        }

        const savedPayables = localStorage.getItem("traymbhkam_payables");
        if (savedPayables) {
          const parsed = JSON.parse(savedPayables);
          if (Array.isArray(parsed)) {
            const isMock = parsed.length > 0 && parsed.every((p: any) => p.id && p.id.startsWith("p-"));
            if (isMock) {
              setPayables([]);
              localStorage.setItem("traymbhkam_payables", JSON.stringify([]));
            } else {
              setPayables(parsed);
            }
          }
        } else {
          localStorage.setItem("traymbhkam_payables", JSON.stringify([]));
        }
      } catch (e) {
        console.warn("Could not load vendors/payables from localStorage:", e);
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vRes, pRes] = await Promise.allSettled([
        supabase.from("vendors").select("*").order("name"),
        supabase.from("payables").select("*, vendors(name, type)").order("due_date", { ascending: true })
      ]);

      if (vRes.status === "fulfilled" && vRes.value.data && vRes.value.data.length > 0) {
        setVendors(vRes.value.data);
        if (typeof window !== "undefined") {
          localStorage.setItem("traymbhkam_vendors", JSON.stringify(vRes.value.data));
        }
      }
      if (pRes.status === "fulfilled" && pRes.value.data && pRes.value.data.length > 0) {
        setPayables(pRes.value.data);
        if (typeof window !== "undefined") {
          localStorage.setItem("traymbhkam_payables", JSON.stringify(pRes.value.data));
        }
      }
    } catch (err) {
      console.warn("Background vendors sync:", err);
    }
  };

  // Vendor actions
  const handleSaveVendor = async () => {
    if (!vendorForm.name.trim()) return;
    setSaving(true);

    let updatedVendors: Vendor[] = [];
    if (editVendorId) {
      updatedVendors = vendors.map(v => v.id === editVendorId ? { ...v, ...vendorForm } : v);
    } else {
      const newVendor: Vendor = {
        id: `v-${Date.now()}`,
        name: vendorForm.name.trim(),
        type: vendorForm.type || "hotel",
        contact_person: vendorForm.contact_person || "",
        phone: vendorForm.phone || "",
        location: vendorForm.location || "",
        notes: vendorForm.notes || ""
      };
      updatedVendors = [newVendor, ...vendors];
    }

    // Instant local state & localStorage update
    setVendors(updatedVendors);
    if (typeof window !== "undefined") {
      localStorage.setItem("traymbhkam_vendors", JSON.stringify(updatedVendors));
    }

    setSaving(false);
    setShowVendorForm(false);

    // Background Supabase sync
    try {
      if (editVendorId) {
        await supabase.from("vendors").update(vendorForm).eq("id", editVendorId);
      } else {
        await supabase.from("vendors").insert(vendorForm);
      }
    } catch (err) {
      console.warn("Supabase vendor sync failed, saved locally:", err);
    }
  };

  const openNewVendor = () => {
    setEditVendorId(null);
    setVendorForm(emptyVendor);
    setShowVendorForm(true);
  };

  const openEditVendor = (v: Vendor) => {
    setEditVendorId(v.id);
    setVendorForm({ name: v.name, type: v.type, contact_person: v.contact_person || "", phone: v.phone || "", location: v.location || "", notes: v.notes || "" });
    setShowVendorForm(true);
  };

  const handleDeleteVendor = async (id: string) => {
    if (!confirm("Delete this vendor? This will also delete their payables.")) return;
    const updatedVendors = vendors.filter(v => v.id !== id);
    const updatedPayables = payables.filter(p => p.vendor_id !== id);

    setVendors(updatedVendors);
    setPayables(updatedPayables);
    if (typeof window !== "undefined") {
      localStorage.setItem("traymbhkam_vendors", JSON.stringify(updatedVendors));
      localStorage.setItem("traymbhkam_payables", JSON.stringify(updatedPayables));
    }

    try {
      await supabase.from("vendors").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase vendor delete failed:", err);
    }
  };

  // Payable actions
  const handleSavePayable = async () => {
    if (!payableForm.vendor_id || !payableForm.amount || !payableForm.description) return;
    setSaving(true);

    const matchedVendor = vendors.find(v => v.id === payableForm.vendor_id);
    const newPayable: Payable = {
      id: `p-${Date.now()}`,
      vendor_id: payableForm.vendor_id,
      description: payableForm.description.trim(),
      amount: Number(payableForm.amount),
      status: "pending",
      due_date: payableForm.due_date || new Date().toISOString().split("T")[0],
      vendors: matchedVendor ? { name: matchedVendor.name, type: matchedVendor.type } : undefined
    };

    const updatedPayables = [newPayable, ...payables];
    setPayables(updatedPayables);
    if (typeof window !== "undefined") {
      localStorage.setItem("traymbhkam_payables", JSON.stringify(updatedPayables));
    }

    setSaving(false);
    setShowPayableForm(false);

    try {
      await supabase.from("payables").insert({
        vendor_id: payableForm.vendor_id,
        description: payableForm.description,
        amount: Number(payableForm.amount),
        due_date: payableForm.due_date || null
      });
    } catch (err) {
      console.warn("Supabase payable sync failed, saved locally:", err);
    }
  };

  const handleMarkPaid = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "paid" ? "pending" : "paid";
    const updatedPayables = payables.map(p => p.id === id ? { ...p, status: newStatus } : p);

    // Instant local state & localStorage update
    setPayables(updatedPayables);
    if (typeof window !== "undefined") {
      localStorage.setItem("traymbhkam_payables", JSON.stringify(updatedPayables));
    }

    try {
      await supabase.from("payables").update({ status: newStatus }).eq("id", id);
    } catch (err) {
      console.warn("Supabase mark paid sync failed, updated locally:", err);
    }
  };

  const handleDeletePayable = async (id: string) => {
    if (!confirm("Delete this payable entry?")) return;
    const updatedPayables = payables.filter(p => p.id !== id);

    setPayables(updatedPayables);
    if (typeof window !== "undefined") {
      localStorage.setItem("traymbhkam_payables", JSON.stringify(updatedPayables));
    }

    try {
      await supabase.from("payables").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase payable delete failed:", err);
    }
  };

  const handleExportVendorsCsv = () => {
    const headers = ["Vendor Name", "Service Type", "Contact Person", "Phone", "Location", "Notes"];
    const rows = vendors.map(v => [
      v.name,
      v.type === "hotel" ? "Hotel Partner" : "Transport Partner",
      v.contact_person || "",
      v.phone || "",
      v.location || "",
      v.notes || ""
    ]);
    exportToCsv(`Travel_to_Uttarakhand_Vendors_${new Date().toISOString().split("T")[0]}`, headers, rows);
  };

  const handleExportPayablesCsv = () => {
    const headers = ["Vendor Name", "Category", "Description", "Amount (INR)", "Status", "Due Date"];
    const rows = payables.map(p => [
      p.vendors?.name || "Unknown Vendor",
      p.vendors?.type || "",
      p.description,
      p.amount,
      p.status === "paid" ? "Paid" : "Outstanding / Pending",
      p.due_date || ""
    ]);
    exportToCsv(`Travel_to_Uttarakhand_Payables_${new Date().toISOString().split("T")[0]}`, headers, rows);
  };

  const totalPending = payables.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = payables.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-6rem)] w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-sky-600" size={26} /> Vendors & Payables
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your suppliers and track outstanding payments.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab("vendors")}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'vendors' ? 'border-orange-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Vendor Directory
        </button>
        <button 
          onClick={() => setActiveTab("payables")}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payables' ? 'border-orange-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Accounts Payable
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-sky-600" size={40} />
        </div>
      ) : (
        <>
          {/* Vendors Tab Content */}
          {activeTab === "vendors" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-800">All Suppliers ({vendors.length})</h2>
                <div className="flex items-center gap-2">
                  <button onClick={handleExportVendorsCsv} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer">
                    <Download size={14} className="text-emerald-600" /> Export CSV
                  </button>
                  <button onClick={openNewVendor} className="flex items-center gap-2 px-3 py-1.5 bg-sky-100 text-sky-600 rounded-lg text-sm font-medium hover:bg-sky-200 transition-colors cursor-pointer">
                    <Plus size={16} /> Add Vendor
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="border-b border-gray-100 text-sm text-gray-500 bg-gray-50">
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium">Contact Person</th>
                      <th className="p-4 font-medium">Phone</th>
                      <th className="p-4 font-medium">Location</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {vendors.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-500">No vendors added yet.</td></tr>
                    ) : vendors.map((v) => (
                      <tr key={v.id} className="border-b border-gray-50 hover:bg-sky-50/30 transition-colors group">
                        <td className="p-4 font-semibold text-gray-900">{v.name}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${v.type === 'hotel' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'}`}>
                            {v.type === 'hotel' ? <Building2 size={12}/> : <Car size={12}/>}
                            {v.type.charAt(0).toUpperCase() + v.type.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {v.contact_person ? (
                            <div className="flex items-center gap-2"><User size={14} className="text-gray-400"/> {v.contact_person}</div>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="p-4 text-gray-600">
                          {v.phone ? (
                            <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {v.phone}</div>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="p-4 text-gray-600">
                          {v.location ? (
                            <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400"/> {v.location}</div>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditVendor(v)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16}/></button>
                            <button onClick={() => handleDeleteVendor(v.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payables Tab Content */}
          {activeTab === "payables" && (
            <div className="flex flex-col gap-6 flex-1">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-red-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Total Outstanding</p>
                    <p className="text-3xl font-bold text-gray-900">₹{totalPending.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                    <IndianRupee size={24} />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 mb-1">Total Paid</p>
                    <p className="text-3xl font-bold text-gray-900">₹{totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={24} />
                  </div>
                </div>
              </div>

              {/* Payables Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h2 className="font-semibold text-gray-800">Payment Entries ({payables.length})</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={handleExportPayablesCsv} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer">
                      <Download size={14} className="text-emerald-600" /> Export CSV
                    </button>
                    <button onClick={() => { setPayableForm(emptyPayable); setShowPayableForm(true); }} className="flex items-center gap-2 px-3 py-1.5 bg-sky-100 text-sky-600 rounded-lg text-sm font-medium hover:bg-sky-200 transition-colors cursor-pointer">
                      <Plus size={16} /> Add Payable
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse min-w-max">
                    <thead>
                      <tr className="border-b border-gray-100 text-sm text-gray-500 bg-gray-50">
                        <th className="p-4 font-medium">Vendor</th>
                        <th className="p-4 font-medium">Description</th>
                        <th className="p-4 font-medium">Due Date</th>
                        <th className="p-4 font-medium">Amount</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {payables.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">No payment entries added yet.</td></tr>
                      ) : payables.map((p) => (
                        <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors group ${p.status === 'paid' ? 'opacity-75' : ''}`}>
                          <td className="p-4">
                            <div className="font-semibold text-gray-900">{p.vendors?.name || "Unknown"}</div>
                            <div className="text-xs text-gray-500 capitalize">{p.vendors?.type}</div>
                          </td>
                          <td className="p-4 text-gray-700">{p.description}</td>
                          <td className="p-4 text-gray-600">
                            {p.due_date ? new Date(p.due_date).toLocaleDateString('en-IN') : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="p-4 font-bold text-gray-900">₹{Number(p.amount).toLocaleString()}</td>
                          <td className="p-4">
                            <button 
                              onClick={() => handleMarkPaid(p.id, p.status)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                p.status === 'paid' 
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              }`}
                            >
                              {p.status === 'paid' ? <CheckCircle2 size={14}/> : <Circle size={14}/>}
                              {p.status === 'paid' ? 'Paid' : 'Mark as Paid'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleDeletePayable(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Vendor Form Modal */}
      {showVendorForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowVendorForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">{editVendorId ? "Edit Vendor" : "Add New Vendor"}</h2>
              <button onClick={() => setShowVendorForm(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company/Vendor Name *</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={vendorForm.name} onChange={e => setVendorForm({...vendorForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={vendorForm.type} onChange={e => setVendorForm({...vendorForm, type: e.target.value})}>
                  <option value="hotel">Hotel</option>
                  <option value="transport">Transport</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={vendorForm.contact_person} onChange={e => setVendorForm({...vendorForm, contact_person: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={vendorForm.phone} onChange={e => setVendorForm({...vendorForm, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={vendorForm.location} onChange={e => setVendorForm({...vendorForm, location: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowVendorForm(false)} className="flex-1 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleSaveVendor} disabled={saving || !vendorForm.name.trim()} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 disabled:opacity-50 cursor-pointer">
                {saving ? <Loader2 size={16} className="animate-spin" /> : (editVendorId ? "Update" : "Save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payable Form Modal */}
      {showPayableForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowPayableForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Add Payable Entry</h2>
              <button onClick={() => setShowPayableForm(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor *</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={payableForm.vendor_id} onChange={e => setPayableForm({...payableForm, vendor_id: e.target.value})}>
                  <option value="">-- Select Vendor --</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (e.g. Booking Ref) *</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={payableForm.description} onChange={e => setPayableForm({...payableForm, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={payableForm.amount} onChange={e => setPayableForm({...payableForm, amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={payableForm.due_date} onChange={e => setPayableForm({...payableForm, due_date: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPayableForm(false)} className="flex-1 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleSavePayable} disabled={saving || !payableForm.vendor_id || !payableForm.amount || !payableForm.description} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 disabled:opacity-50 cursor-pointer">
                {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
