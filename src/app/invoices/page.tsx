"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Download, 
  Loader2, 
  MessageCircle, 
  FileText, 
  Calendar, 
  User, 
  IndianRupee, 
  RotateCcw,
  Maximize2, 
  Minimize2,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveDocumentToHub } from "@/lib/documentsHub";
import QRCode from "qrcode";

export type InvoiceType = "advance" | "receipt";

export interface InvoiceData {
  companySettings: string;
  invoiceType: InvoiceType;
  invoiceNumber: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  dateType: string;
  travelDate: string;
  bookingDate: string;
  packages: Array<{ 
    detail: string; 
    person: number; 
    rate: number; 
    amount: number; 
  }>;
  taxPercent: string;
  discount: string;
  amountPaid: string;
  advanceRequired: string;
  paymentMode: string;
  paymentRef: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  branchName: string;
  upiId: string;
  showUpiQr: boolean;
  customQrUrl: string;
  notes: string;
}

function numberToWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  let numStr = Math.floor(num).toString();
  if (numStr.length > 9) return "Amount too large";
  const n = ("000000000" + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ""; 
  let str = "";
  str += (n[1] != "00") ? (a[Number(n[1])] || b[Number(n[1][0])] + " " + a[Number(n[1][1])]) + "Crore " : "";
  str += (n[2] != "00") ? (a[Number(n[2])] || b[Number(n[2][0])] + " " + a[Number(n[2][1])]) + "Lakh " : "";
  str += (n[3] != "00") ? (a[Number(n[3])] || b[Number(n[3][0])] + " " + a[Number(n[3][1])]) + "Thousand " : "";
  str += (n[4] != "0") ? (a[Number(n[4])] || b[Number(n[4][0])] + " " + a[Number(n[4][1])]) + "Hundred " : "";
  str += (n[5] != "00") ? ((str != "") ? "and " : "") + (a[Number(n[5])] || b[Number(n[5][0])] + " " + a[Number(n[5][1])]) + "Rupees Only" : "Rupees Only";
  return str;
}

const DEFAULT_INVOICE_DATA: InvoiceData = {
  companySettings: "Traymbhkam Tour and Travels",
  invoiceType: "advance",
  invoiceNumber: "INV-2026-0001",
  guestName: "",
  guestPhone: "",
  guestEmail: "",
  dateType: "Travel Date",
  travelDate: "",
  bookingDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  packages: [
    { 
      detail: "Tour Package Booking / Chardham Yatra Service", 
      person: 1, 
      rate: 0, 
      amount: 0 
    }
  ],
  taxPercent: "5",
  discount: "0",
  amountPaid: "0",
  advanceRequired: "0",
  paymentMode: "UPI / Bank Transfer",
  paymentRef: "",
  bankName: "Central Bank of India",
  accountHolder: "Traymbhkam Tour and Travels",
  accountNumber: "5242273759",
  ifscCode: "CBIN0280274",
  accountType: "Current Account",
  branchName: "Haridwar Branch",
  upiId: "",
  showUpiQr: true,
  customQrUrl: "/qr_clean.png",
  notes: `Bank Details for Remittance:\n• Beneficiary: Traymbhkam Tour and Travels\n• Bank Name: Central Bank of India\n• Account No: 5242273759\n• IFSC Code: CBIN0280274\n\nTerms & Payment Conditions:\n• Advance payment required prior to trip commencement.\n• Rates include all applicable toll taxes, parking fees, and driver allowances.\n• Cancellation and rescheduling are governed by partner hotel & transport policies.`
};

export default function InvoicesPage() {
  const [data, setData] = useState(DEFAULT_INVOICE_DATA);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [autoScale, setAutoScale] = useState<number>(0.55);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [fitMode, setFitMode] = useState<"screen" | "width">("screen");
  const [showQrModal, setShowQrModal] = useState(false);
  const [generatedQr, setGeneratedQr] = useState<string>("");
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waPhoneInput, setWaPhoneInput] = useState("");
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Auto-fit screen and fit-width scaling
  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const el = previewContainerRef.current;
      const padX = 40;
      const padY = 40;
      const availW = Math.max(300, el.clientWidth - padX);
      const availH = Math.max(300, el.clientHeight - padY);

      const scaleW = availW / 794;
      const scaleH = availH / 1122;

      if (fitMode === "width") {
        setAutoScale(Math.max(0.4, Math.min(1.3, Number(scaleW.toFixed(3)))));
      } else {
        const fitScale = Math.min(scaleW, scaleH);
        setAutoScale(Math.max(0.35, Math.min(0.95, Number(fitScale.toFixed(3)))));
      }
    };

    updateScale();
    const timer = setTimeout(updateScale, 150);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && previewContainerRef.current) {
      ro = new ResizeObserver(() => updateScale());
      ro.observe(previewContainerRef.current);
    }

    window.addEventListener("resize", updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScale);
      if (ro) ro.disconnect();
    };
  }, [isFormCollapsed, fitMode]);

  // Load latest invoice from Supabase Cloud or localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("traymbhkam_invoice_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.packages?.length > 0) {
            // If cached data has older mock bank details, migrate to actual Central Bank of India details
            if (!parsed.accountNumber || parsed.accountNumber === "10180000573933") {
              parsed.bankName = "Central Bank of India";
              parsed.accountHolder = "Traymbhkam Tour and Travels";
              parsed.accountNumber = "5242273759";
              parsed.ifscCode = "CBIN0280274";
              parsed.upiId = "";
            }
            if (!parsed.customQrUrl || parsed.customQrUrl === "/QR.jpg") {
              parsed.customQrUrl = "/qr_clean.png";
            }
            setData({ ...DEFAULT_INVOICE_DATA, ...parsed });
            return;
          }
        }

        // Fetch latest saved invoice from Supabase
        const fetchCloudInvoice = async () => {
          try {
            const { data: cloudInvoice } = await supabase
              .from("invoices")
              .select("document_data")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (cloudInvoice && cloudInvoice.document_data && Array.isArray((cloudInvoice.document_data as any).packages)) {
              const cloudData = cloudInvoice.document_data as any;
              if (!cloudData.accountNumber || cloudData.accountNumber === "10180000573933") {
                cloudData.bankName = "Central Bank of India";
                cloudData.accountHolder = "Traymbhkam Tour and Travels";
                cloudData.accountNumber = "5242273759";
                cloudData.ifscCode = "CBIN0280274";
                cloudData.upiId = "";
              }
              if (!cloudData.customQrUrl || cloudData.customQrUrl === "/QR.jpg") {
                cloudData.customQrUrl = "/qr_clean.png";
              }
              setData({ ...DEFAULT_INVOICE_DATA, ...cloudData });
              localStorage.setItem("traymbhkam_invoice_data", JSON.stringify(cloudData));
            }
          } catch {}
        };
        fetchCloudInvoice();
      } catch (e) {
        console.warn("Could not load invoice data:", e);
      }
    }
  }, []);

  const currentScale = manualZoom !== null ? manualZoom : autoScale;

  const handleZoomIn = () => {
    const next = Math.min(1.5, Number((currentScale + 0.1).toFixed(2)));
    setManualZoom(next);
  };

  const handleZoomOut = () => {
    const next = Math.max(0.35, Number((currentScale - 0.1).toFixed(2)));
    setManualZoom(next);
  };

  const handleSetFitMode = (mode: "screen" | "width") => {
    setFitMode(mode);
    setManualZoom(null);
  };

  const handlePackageChange = (index: number, field: string, value: string | number) => {
    const newPackages = [...data.packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    
    if (field === 'person' || field === 'rate') {
      const person = Number(newPackages[index].person) || 0;
      const rate = Number(newPackages[index].rate) || 0;
      newPackages[index].amount = person * rate;
    }
    
    setData({ ...data, packages: newPackages });
  };

  const addPackage = () => {
    setData({
      ...data,
      packages: [...data.packages, { detail: "", person: 1, rate: 0, amount: 0 }]
    });
  };

  const removePackage = (index: number) => {
    setData({
      ...data,
      packages: data.packages.filter((_, i) => i !== index)
    });
  };

  const calculations = useMemo(() => {
    const subTotal = data.packages.reduce((sum, pkg) => sum + (Number(pkg.amount) || 0), 0);
    const discount = Number(data.discount) || 0;
    const afterDiscount = Math.max(0, subTotal - discount);
    const total = Math.round(afterDiscount);

    // If advanceRequired was entered as a string/number
    let advReq = Number(data.advanceRequired) || 0;
    if (advReq === 0 && total > 0) {
      advReq = Math.round(total * 0.25); // default 25% if zero
    }
    const balanceAfterAdvance = Math.max(0, total - advReq);

    const paid = Number(data.amountPaid) || 0;
    const pending = Math.max(0, total - paid);

    return { 
      subTotal, 
      discount, 
      taxAmount: 0, 
      total, 
      paid, 
      pending, 
      advanceRequired: advReq,
      balanceAfterAdvance,
      totalWords: numberToWords(total),
      advanceWords: numberToWords(advReq),
      paidWords: numberToWords(paid)
    };
  }, [data.packages, data.discount, data.amountPaid, data.advanceRequired]);

  // Generate dynamic amount-encoded UPI QR code for Stage 1 Advance Demand
  useEffect(() => {
    if (data.invoiceType === "advance" && calculations.advanceRequired > 0) {
      const payeeVpa = data.upiId?.trim() || "20251232406374-iservuqrsbrp@cbin";
      const payeeName = encodeURIComponent(data.accountHolder || "Traymbhkam Tour and Travels");
      const note = encodeURIComponent(`Advance ${data.invoiceNumber || ""}`.trim());
      const upiUri = `upi://pay?pa=${payeeVpa}&pn=${payeeName}&am=${calculations.advanceRequired}&cu=INR&tn=${note}`;
      QRCode.toDataURL(upiUri, {
        width: 300,
        margin: 1,
        errorCorrectionLevel: "M",
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
        .then((url) => setGeneratedQr(url))
        .catch((err) => {
          console.warn("Dynamic UPI QR generation fallback:", err);
          setGeneratedQr("");
        });
    } else {
      setGeneratedQr("");
    }
  }, [data.invoiceType, calculations.advanceRequired, data.invoiceNumber, data.upiId, data.accountHolder]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const element = document.getElementById("print-invoice");
      if (!element) {
        alert("Could not find the print container.");
        setIsDownloading(false);
        return;
      }

      // Save to Supabase Cloud
      try {
        if (data.guestName) {
          let clientId = null;
          if (data.guestPhone) {
            const { data: existingClient } = await supabase.from("clients").select("id").eq("phone", data.guestPhone).single();
            if (existingClient) clientId = existingClient.id;
          }
          if (!clientId) {
            const { data: newClient } = await supabase.from("clients").insert({
              name: data.guestName,
              phone: data.guestPhone || "",
              email: data.guestEmail || ""
            }).select().single();
            clientId = newClient?.id;
          }
          await supabase.from("invoices").insert({
            invoice_number: data.invoiceNumber,
            client_id: clientId,
            total_amount: calculations.total,
            document_data: data
          });
        }
      } catch (dbError) {
        console.error("Failed to save to database:", dbError);
      }

      // Record in local Document Hub
      try {
        const isAdv = data.invoiceType === "advance";
        saveDocumentToHub({
          id: `inv-${data.invoiceNumber || Date.now()}`,
          type: "invoice",
          title: isAdv ? `Advance Invoice - ${data.guestName || "Billing"}` : `Payment Receipt - ${data.guestName || "Billing"}`,
          docNumber: data.invoiceNumber,
          guestName: data.guestName || "Valued Guest",
          guestPhone: data.guestPhone || "",
          travelDates: data.travelDate || data.bookingDate,
          amount: calculations.total,
          paidAmount: isAdv ? calculations.advanceRequired : calculations.paid,
          pendingAmount: isAdv ? calculations.balanceAfterAdvance : calculations.pending,
          detailsSummary: isAdv 
            ? `Total: ₹${calculations.total.toLocaleString("en-IN")} | Advance Req: ₹${calculations.advanceRequired.toLocaleString("en-IN")} | Balance: ₹${calculations.balanceAfterAdvance.toLocaleString("en-IN")}`
            : `Total: ₹${calculations.total.toLocaleString("en-IN")} | Advance Recd: ₹${calculations.paid.toLocaleString("en-IN")} | Due: ₹${calculations.pending.toLocaleString("en-IN")}`,
          studioUrl: "/invoices",
          rawPayload: data
        });
      } catch (hubErr) {
        console.warn("Local hub save:", hubErr);
      }

      const html2canvasModule = await import("html2canvas-pro");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.jsPDF;

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        logging: false 
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      // Add clickable PDF link annotations
      try {
        const linkEls = element.querySelectorAll("a[href], [data-pdf-link]");
        const containerRect = element.getBoundingClientRect();
        linkEls.forEach((linkNode) => {
          const rect = linkNode.getBoundingClientRect();
          const targetUrl = linkNode.getAttribute("data-pdf-link") || (linkNode as HTMLAnchorElement).href;
          if (targetUrl && rect.width > 0 && rect.height > 0 && containerRect.width > 0 && containerRect.height > 0) {
            const x = ((rect.left - containerRect.left) / containerRect.width) * pdfWidth;
            const y = ((rect.top - containerRect.top) / containerRect.height) * pdfHeight;
            const w = (rect.width / containerRect.width) * pdfWidth;
            const h = (rect.height / containerRect.height) * pdfHeight;
            pdf.link(x, y, w, h, { url: targetUrl });
          }
        });
      } catch (linkErr) {
        console.warn("Could not attach PDF link annotations:", linkErr);
      }

      const prefix = data.invoiceType === "advance" ? "Advance_Invoice" : "Payment_Receipt";
      pdf.save(`${prefix}_${data.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "_")}_${data.guestName.replace(/\s+/g, "_")}.pdf`);
    } catch (error: any) {
      console.error("PDF generation failed:", error);
      alert(`Failed to generate PDF: ${error.message || error}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const cleanWaPhone = (phoneStr: string) => {
    if (!phoneStr) return "";
    let digits = phoneStr.replace(/[^0-9]/g, "");
    if (digits.length === 10) {
      return `91${digits}`;
    } else if (digits.startsWith("0") && digits.length === 11) {
      return `91${digits.slice(1)}`;
    } else if (digits.startsWith("91") && digits.length === 12) {
      return digits;
    }
    return digits;
  };

  const getWhatsAppMessage = () => {
    if (data.invoiceType === "advance") {
      return `*📋 BOOKING ADVANCE INVOICE - TRAYMBHKAM TOUR AND TRAVELS*\n\n` +
        `Dear ${data.guestName || "Honourable Guest"},\n\n` +
        `Thank you for confirming your Uttarakhand tour itinerary! Kindly find your Booking Advance Invoice:\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `• *Invoice No:* ${data.invoiceNumber}\n` +
        `• *Invoice Date:* ${data.bookingDate}\n` +
        (data.travelDate ? `• *Travel Date:* ${data.travelDate}\n` : "") +
        `• *Total Package Cost:* ₹${calculations.total.toLocaleString("en-IN")}\n` +
        `• *👉 ADVANCE REQUIRED TO CONFIRM:* ₹${calculations.advanceRequired.toLocaleString("en-IN")}\n` +
        `• *Balance Payable on Tour:* ₹${calculations.balanceAfterAdvance.toLocaleString("en-IN")}\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `*OFFICIAL BANK & UPI DETAILS FOR PAYMENT:*\n` +
        `• Beneficiary: Traymbhkam Tour and Travels\n` +
        `• Bank: ${data.bankName || "Central Bank of India"}\n` +
        `• Account No: ${data.accountNumber || "5242273759"}\n` +
        `• IFSC Code: ${data.ifscCode || "CBIN0280274"}\n` +
        (data.upiId ? `• UPI ID: ${data.upiId}\n` : "") +
        `\n⚠️ *Note:* Please share screenshot after transferring the advance. Confirmed Payment Receipt and Hotel/Vehicle Vouchers will be issued immediately upon credit.\n\n` +
        `📞 *24x7 Helpline:* +91 82660 16066 (Mr. Gagandeep)\n` +
        `📍 Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar\n\n` +
        `Wishing you a divine and blessed journey! 🙏🛕`;
    } else {
      return `*🧾 PAYMENT RECEIPT & INVOICE - TRAYMBHKAM TOUR AND TRAVELS*\n\n` +
        `Dear ${data.guestName || "Honourable Guest"},\n\n` +
        `We have received your advance payment with thanks! Here is your official Payment Receipt & Invoice:\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `• *Invoice / Receipt No:* ${data.invoiceNumber}\n` +
        `• *Receipt Date:* ${data.bookingDate}\n` +
        (data.travelDate ? `• *Travel Date:* ${data.travelDate}\n` : "") +
        `• *Total Tour Package:* ₹${calculations.total.toLocaleString("en-IN")}\n` +
        `• *✓ ADVANCE RECEIVED:* ₹${calculations.paid.toLocaleString("en-IN")} (Received with thanks ✓)\n` +
        `• *⏳ BALANCE PENDING:* ₹${calculations.pending.toLocaleString("en-IN")} (Payable before departure)\n` +
        (data.paymentMode ? `• *Payment Mode:* ${data.paymentMode}\n` : "") +
        `━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Your booking is confirmed. Your hotel & vehicle service vouchers will be dispatched prior to travel.\n\n` +
        `📞 *24x7 Helpline:* +91 82660 16066 (Mr. Gagandeep)\n` +
        `📍 Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar\n\n` +
        `Jai Shree Kedar · Jai Badri Vishal! 🙏🛕`;
    }
  };

  const copyInvoiceAsImage = async (): Promise<boolean> => {
    try {
      const element = document.getElementById("print-invoice");
      if (!element) return false;

      const html2canvasModule = await import("html2canvas-pro");
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      return new Promise<boolean>((resolve) => {
        canvas.toBlob(async (blob) => {
          if (blob && typeof navigator !== "undefined" && navigator.clipboard && typeof ClipboardItem !== "undefined") {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
              ]);
              resolve(true);
            } catch (clipErr) {
              console.warn("Clipboard write error:", clipErr);
              resolve(false);
            }
          } else {
            resolve(false);
          }
        }, "image/png");
      });
    } catch (err) {
      console.warn("copyInvoiceAsImage error:", err);
      return false;
    }
  };

  const handleShareWhatsApp = async (customPhone?: string, mode: "pdf" | "image" | "text" = "image") => {
    const rawPhone = (typeof customPhone === "string" ? customPhone : null) ?? data.guestPhone ?? "";
    const cleanPhone = cleanWaPhone(rawPhone);

    if (!cleanPhone) {
      setWaPhoneInput(rawPhone);
      setShowWhatsAppModal(true);
      return;
    }

    if (mode === "image") {
      const copied = await copyInvoiceAsImage();
      const caption = encodeURIComponent(
        `*${data.invoiceType === "advance" ? "📋 OFFICIAL ADVANCE INVOICE" : "🧾 OFFICIAL PAYMENT RECEIPT"}*\n*Traymbhkam Tour and Travels*\n\nDear ${data.guestName || "Guest"},\nPlease find your official ${data.invoiceType === "advance" ? "Booking Advance Invoice" : "Payment Receipt"}.\n\nHelpline: +91 82660 16066\n🌐 Haridwar, Uttarakhand`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${caption}`, "_blank");
      setShowWhatsAppModal(false);
      if (copied) {
        alert("✓ Invoice image clipboard me copy ho gayi hai!\n\nWhatsApp chat khulte hi 'Ctrl + V' (Paste) dabayein — poori original invoice image aa jayegi aur Send daba dein!");
      }
      return;
    }

    if (mode === "pdf") {
      handleDownload();
      const briefMessage = `*${data.invoiceType === "advance" ? "📋 BOOKING ADVANCE INVOICE" : "🧾 PAYMENT RECEIPT"} - TRAYMBHKAM TOUR AND TRAVELS*\n\nDear ${data.guestName || "Guest"},\n\nPlease find your official ${data.invoiceType === "advance" ? "Booking Advance Invoice" : "Payment Receipt"} attached (PDF has been downloaded to attach here).\n\n📞 24x7 Helpline: +91 82660 16066 (Mr. Gagandeep)\n📍 Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar\n\nWishing you a divine and blessed journey! 🙏`;
      const encoded = encodeURIComponent(briefMessage);
      window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
      setShowWhatsAppModal(false);
      return;
    }

    const text = getWhatsAppMessage();
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    setShowWhatsAppModal(false);
  };

  // Modular Page Renderer - Perfectly proportioned to fit exactly inside 1122px with zero cutoff
  const renderInvoiceContent = (prefix: string) => (
    <div 
      id={`${prefix}-invoice`} 
      className="w-[794px] h-[1122px] min-h-[1122px] max-h-[1122px] bg-[#ffffff] shadow-2xl shrink-0 px-8 py-6 flex flex-col justify-between relative overflow-hidden text-gray-900 border-[10px] border-double border-[#0369a1]"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        
        {/* TOP SECTION */}
        <div className="space-y-3">
          {/* Header Branding */}
          <div className="flex flex-col items-center text-center pb-1.5 border-b border-gray-200">
            <img src="/logo.png" alt="Logo" className="h-24 w-auto object-contain mb-1.5 drop-shadow-xs" />
            <p className="text-[11px] uppercase tracking-widest text-[#0369a1] font-bold">Traymbhkam Tour and Travels</p>
            <h1 className="text-3xl font-serif font-black text-[#0369a1] tracking-tight mt-0.5 uppercase">
              {data.invoiceType === "advance" ? "BOOKING ADVANCE INVOICE" : "TAX INVOICE & PAYMENT RECEIPT"}
            </h1>
            <p className={`text-xs font-bold tracking-widest uppercase mt-0.5 px-2 py-0.5 rounded border ${
              data.invoiceType === "advance"
                ? "text-amber-800 bg-amber-50 border-amber-200"
                : "text-emerald-800 bg-emerald-50 border-emerald-200"
            }`}>
              {data.invoiceType === "advance" 
                ? "PROFORMA INVOICE & BOOKING ADVANCE DEMAND" 
                : "BOOKING CONFIRMATION & PAYMENT RECEIPT"}
            </p>
            <div className="text-[10px] text-gray-500 mt-1 flex flex-wrap justify-center gap-2">
              <span>Contact: <strong className="text-gray-700">+91 82660 16066</strong></span>
              <span>·</span>
              <span>Email: <strong className="text-gray-700">info@traymbhkam.com</strong></span>
              <span>·</span>
              <span>Address: <strong className="text-gray-700">Opp. Railway Station Gate No. 2, Haridwar</strong></span>
            </div>
          </div>

          {/* Metadata Line */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-lg py-1 px-3.5 text-center text-[11px] font-semibold text-gray-800 flex justify-between items-center">
            <span>{data.invoiceType === "advance" ? "Proforma No:" : "Invoice No:"} <strong className="text-[#0369a1] font-mono">{data.invoiceNumber}</strong></span>
            <span>Date: <strong className="text-gray-900">{data.bookingDate}</strong></span>
            <span>{data.dateType}: <strong className="text-gray-900">{data.travelDate || "As Confirmed"}</strong></span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              data.invoiceType === "advance"
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : calculations.pending === 0
                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                : "bg-blue-100 text-blue-900 border-blue-300"
            }`}>
              {data.invoiceType === "advance" 
                ? "⏳ ADVANCE PAYMENT DEMAND" 
                : calculations.pending === 0 
                ? "✓ FULLY SETTLED" 
                : "✓ ADVANCE RECEIVED / PARTIALLY PAID"}
            </span>
          </div>

          {/* Dual Billed To / Billed By Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border border-gray-200 rounded-lg p-2.5 bg-gray-50/60 space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Billed To (Client Particulars)</span>
              <h3 className="text-xs font-serif font-bold text-[#0369a1]">{data.guestName || "Honourable Guest"}</h3>
              {data.guestPhone && <p className="text-gray-700 text-[10px]">Phone: <strong className="text-gray-900">{data.guestPhone}</strong></p>}
              {data.guestEmail && <p className="text-gray-700 text-[10px]">Email: {data.guestEmail}</p>}
            </div>

            <div className="border border-gray-200 rounded-lg p-2.5 bg-gray-50/60 space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Billed By (Service Provider)</span>
              <h3 className="text-xs font-serif font-bold text-[#0369a1]">{data.companySettings}</h3>
              <p className="text-gray-700 text-[10px]">Registered Office: Haridwar / Dehradun, Uttarakhand</p>
              <p className="text-gray-700 text-[10px]">Helpline: +91 82660 16066</p>
            </div>
          </div>

          {/* Services & Packages Breakdown Table */}
          <div className="rounded-lg overflow-hidden border border-gray-200 text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#0369a1] text-white text-[10.5px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-2.5 py-1.5 w-[8%] text-center">#</th>
                  <th className="px-3 py-1.5 w-[64%]">Description of Tour Services & Packages</th>
                  <th className="px-2.5 py-1.5 w-[14%] text-center">Pax / Qty</th>
                  <th className="px-3 py-1.5 w-[14%] text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-[11px]">
                {data.packages.map((pkg, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <td className="px-2.5 py-1.5 text-center text-gray-500 font-medium align-top">{idx + 1}</td>
                    <td className="px-3 py-1.5 text-gray-900 leading-snug font-medium align-top">{pkg.detail || "Custom Tour Package"}</td>
                    <td className="px-2.5 py-1.5 text-center text-gray-700 align-top">{pkg.person}</td>
                    <td className="px-3 py-1.5 text-right font-bold text-gray-900 align-top font-mono">₹{Number(pkg.amount || 0).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary Box */}
          <div className="grid grid-cols-[1fr_270px] gap-3 items-start text-xs">
            {/* Left: Total in Words & Payment Badges */}
            <div className="space-y-2">
              <div className="bg-sky-50/70 border border-sky-200 rounded-lg p-2">
                <span className="text-[9px] uppercase font-bold text-sky-800 tracking-wider block">Total Amount in Words:</span>
                <p className="font-serif font-bold text-[#0369a1] text-[11px] italic mt-0.5 leading-snug">{calculations.totalWords}</p>
              </div>

              {data.invoiceType === "advance" ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-2 shadow-2xs">
                    <span className="text-[9px] uppercase font-bold text-amber-900 tracking-wider block">👉 Advance Required</span>
                    <p className="text-sm font-black text-amber-800 font-mono mt-0.5">₹{calculations.advanceRequired.toLocaleString("en-IN")}</p>
                    <p className="text-[8.5px] text-amber-700 font-medium">Pay to lock dates & stays</p>
                  </div>
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-2">
                    <span className="text-[9px] uppercase font-bold text-sky-800 tracking-wider block">Balance on Tour Start</span>
                    <p className="text-xs font-bold text-sky-700 font-mono mt-0.5">₹{calculations.balanceAfterAdvance.toLocaleString("en-IN")}</p>
                    <p className="text-[8.5px] text-gray-500">Payable before journey</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-2 shadow-2xs">
                    <span className="text-[9px] uppercase font-bold text-emerald-900 tracking-wider block">✓ Advance Received</span>
                    <p className="text-sm font-black text-emerald-700 font-mono mt-0.5">₹{calculations.paid.toLocaleString("en-IN")}</p>
                    <p className="text-[8.5px] text-emerald-700 font-medium">Received with thanks</p>
                  </div>
                  <div className="bg-rose-50 border-2 border-rose-300 rounded-lg p-2 shadow-2xs">
                    <span className="text-[9px] uppercase font-bold text-rose-900 tracking-wider block">⏳ Balance Pending</span>
                    <p className="text-sm font-black text-rose-700 font-mono mt-0.5">₹{calculations.pending.toLocaleString("en-IN")}</p>
                    <p className="text-[8.5px] text-rose-700 font-medium">Payable before departure</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Calculations Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-gray-200 text-[11px]">
                  <tr>
                    <td className="px-2.5 py-1 text-gray-600 font-medium">Subtotal:</td>
                    <td className="px-2.5 py-1 text-right font-mono font-semibold text-gray-900">₹{calculations.subTotal.toLocaleString("en-IN")}</td>
                  </tr>
                  {Number(data.discount) > 0 && (
                    <tr>
                      <td className="px-2.5 py-1 text-emerald-700 font-medium">Discount:</td>
                      <td className="px-2.5 py-1 text-right font-mono font-semibold text-emerald-700">-₹{calculations.discount.toLocaleString("en-IN")}</td>
                    </tr>
                  )}
                  <tr className="bg-[#0369a1] text-white">
                    <td className="px-2.5 py-1.5 font-bold uppercase tracking-wider text-[11px]">Total Package Cost:</td>
                    <td className="px-2.5 py-1.5 text-right font-bold text-xs font-mono">₹{calculations.total.toLocaleString("en-IN")}</td>
                  </tr>
                  {data.invoiceType === "advance" ? (
                    <>
                      <tr className="bg-amber-50 text-amber-950 font-bold border-t border-amber-200">
                        <td className="px-2.5 py-1.5 uppercase text-[10.5px]">Booking Advance Required:</td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-xs text-amber-900">₹{calculations.advanceRequired.toLocaleString("en-IN")}</td>
                      </tr>
                      <tr className="bg-slate-50 text-gray-700 border-t border-gray-200">
                        <td className="px-2.5 py-1 text-[10px]">Remaining Balance on Tour:</td>
                        <td className="px-2.5 py-1 text-right font-mono font-bold text-gray-800 text-[11px]">₹{calculations.balanceAfterAdvance.toLocaleString("en-IN")}</td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr className="bg-emerald-50 text-emerald-900 font-bold border-t border-emerald-200">
                        <td className="px-2.5 py-1.5 uppercase text-[10.5px]">Less: Advance Received:</td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-xs text-emerald-700">₹{calculations.paid.toLocaleString("en-IN")}</td>
                      </tr>
                      <tr className="bg-rose-50 text-rose-950 font-bold border-t border-rose-200">
                        <td className="px-2.5 py-1.5 uppercase text-[10.5px]">Net Balance Pending:</td>
                        <td className="px-2.5 py-1.5 text-right font-mono text-xs text-rose-700">₹{calculations.pending.toLocaleString("en-IN")}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Notice Strip */}
          {data.invoiceType === "advance" ? (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg py-1.5 px-3 flex items-center justify-between text-[10px] text-amber-950">
              <span className="font-bold flex items-center gap-1.5">
                <span className="text-amber-600 font-black">📢 ACTION REQUIRED:</span>
                <span>Please transfer booking advance of <strong>₹{calculations.advanceRequired.toLocaleString("en-IN")}</strong> to lock your vehicle & hotel reservations.</span>
              </span>
              <span className="font-semibold text-amber-800 text-[9px] bg-white px-2 py-0.5 rounded border border-amber-200 shrink-0">
                Receipt issued upon credit
              </span>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-lg py-1.5 px-3 flex items-center justify-between text-[10px] text-emerald-950">
              <span className="font-bold flex items-center gap-1.5">
                <span className="text-emerald-600 font-black">✓ PAYMENT ACKNOWLEDGED:</span>
                <span>Booking advance of <strong>₹{calculations.paid.toLocaleString("en-IN")}</strong> received with thanks. Confirmed booking receipt.</span>
              </span>
              <span className="font-semibold text-rose-800 text-[9px] bg-white px-2 py-0.5 rounded border border-rose-200 shrink-0">
                Pending: ₹{calculations.pending.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* Bank Particulars & UPI QR Code Box */}
          <div className="bg-gradient-to-r from-sky-50/60 via-blue-50/40 to-slate-50 border border-[#0369a1]/30 rounded-xl p-2.5 text-[10px] text-gray-800 flex items-center justify-between gap-3 shadow-2xs">
            {/* Left: Bank Details */}
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 pb-1 border-b border-sky-100">
                <Building2 className="w-3.5 h-3.5 text-[#0369a1]" />
                <span className="font-bold text-gray-900 uppercase tracking-wider text-[9.5px]">
                  Official Bank Remittance Details
                </span>
                <span className="text-[8.5px] px-1.5 py-0.2 bg-sky-100 text-sky-800 font-semibold rounded">
                  {data.accountType || "Current Account"}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9.5px] pt-0.5">
                <div>
                  <span className="text-gray-500">Beneficiary: </span>
                  <strong className="text-gray-900 font-semibold">{data.accountHolder || "Traymbhkam Tour and Travels"}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Bank Name: </span>
                  <strong className="text-gray-900 font-semibold">{data.bankName || "Central Bank of India"}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Account No: </span>
                  <strong className="font-mono text-gray-900 font-bold tracking-wider">{data.accountNumber || "5242273759"}</strong>
                </div>
                <div>
                  <span className="text-gray-500">IFSC Code: </span>
                  <strong className="font-mono text-gray-900 font-bold tracking-wider">{data.ifscCode || "CBIN0280274"}</strong>
                </div>
              </div>

              <div className="pt-0.5 flex items-center gap-2 text-[9px] text-gray-600 flex-wrap">
                {data.upiId && data.upiId.trim() ? (
                  <>
                    <span className="text-gray-500">UPI ID / VPA:</span>
                    <span className="font-mono font-bold text-[#0369a1] bg-white px-2 py-0.5 rounded border border-sky-200">
                      {data.upiId}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500 font-medium">
                    UPI ID: <span className="text-gray-400 italic font-mono">______________</span>
                  </span>
                )}
                <span className="text-[8.5px] text-gray-400 italic ml-auto">
                  {data.invoiceType === "advance" 
                    ? "• Advance deposit required to lock hotel & vehicle bookings" 
                    : "• Balance settlement required before start of travel"}
                </span>
              </div>
            </div>

            {/* Right: Dynamic Advance QR Code OR Payment Receipt Stamp */}
            {data.invoiceType === "advance" ? (
              data.showUpiQr !== false && (
                <div 
                  onClick={() => setShowQrModal(true)}
                  className="shrink-0 flex flex-col items-center bg-white p-1.5 rounded-xl border-2 border-amber-400 shadow-2xs cursor-pointer hover:border-amber-600 hover:shadow-md transition"
                  title="Click to enlarge QR Code (Pre-filled with advance amount)"
                >
                  <div className="w-[96px] h-[96px] relative overflow-hidden rounded-lg bg-white flex items-center justify-center p-0.5">
                    <img
                      src={generatedQr || `${data.customQrUrl || "/qr_clean.png"}?v=5`}
                      alt="Official Advance Payment QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="mt-1 text-center">
                    <p className="text-[9px] font-mono font-bold text-amber-900 leading-none">
                      ₹{calculations.advanceRequired.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[7.5px] text-amber-700 font-bold mt-0.5">Scan to Pay Advance</p>
                    <p className="text-[6.5px] text-gray-400 font-medium">Auto-Filled in UPI</p>
                  </div>
                </div>
              )
            ) : (
              /* In Stage 2 (Receipt): QR code is NOT shown ("dusre Wale mai nhi aaye advance wale mai aaye bss") */
              <div className="shrink-0 flex flex-col justify-center items-center bg-emerald-50/90 p-2 rounded-xl border border-emerald-300 min-w-[130px] text-center shadow-2xs">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-1 shadow-xs">
                  ✓
                </div>
                <span className="text-[9.5px] font-black text-emerald-950 uppercase tracking-wider">
                  Payment Receipt
                </span>
                <span className="text-[7.5px] text-emerald-700 font-bold">
                  Advance Settled & Recorded
                </span>
                <div className="mt-1 pt-1 border-t border-emerald-200/80 w-full text-left space-y-0.5">
                  <div className="text-[7.5px] text-emerald-900">
                    <span className="text-gray-500">Mode: </span>
                    <strong className="font-semibold">{data.paymentMode || "UPI / Online"}</strong>
                  </div>
                  {data.paymentRef && (
                    <div className="text-[7px] text-emerald-900 font-mono truncate max-w-[120px]">
                      <span className="text-gray-500">Ref: </span>
                      <strong>{data.paymentRef}</strong>
                    </div>
                  )}
                  <div className="text-[7.5px] text-rose-700 font-bold">
                    <span>Balance: </span>
                    <strong className="font-mono">₹{calculations.pending.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: Signatory & Page Footer */}
        <div className="space-y-2 pt-1 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="logo" className="h-11 w-auto object-contain" />
              <div>
                <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Issued By</p>
                <h4 className="text-xs font-serif font-bold text-[#0369a1]">Traymbhkam Tour and Travels</h4>
                <p className="text-[9.5px] text-gray-600 font-medium">
                  Mr. Gagandeep · +91 82660 16066 · 
                  <a 
                    href="Haridwar, Uttarakhand" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    data-pdf-link="Haridwar, Uttarakhand" 
                    className="text-[#0369a1] font-bold hover:underline ml-1"
                  >
                    Opp. Railway Station Gate No. 2, Haridwar
                  </a>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#0369a1] font-serif font-bold tracking-widest">ॐ नमः शिवाय</p>
              <p className="text-[8.5px] uppercase tracking-wider text-gray-400 mt-0.5">Authorized Signatory</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-1 flex justify-between items-center text-[9.5px] text-gray-500">
            <span>Traymbhkam Tour and Travels · +91 82660 16066</span>
            <span className="font-bold text-[#0369a1]">
              Purusharthi Market, Haridwar
            </span>
            <span>{data.invoiceType === "advance" ? "Booking Advance Invoice · Page 1 of 1" : "Tax Invoice & Payment Receipt · Page 1 of 1"}</span>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-5 w-full h-[calc(100vh-5rem)]">
      
      {/* Left Column: Form Controls */}
      {!isFormCollapsed && (
        <div className="w-full lg:w-[38%] bg-white rounded-2xl shadow-xs border border-gray-100 p-5 overflow-y-auto shrink-0 h-full space-y-4 transition-all duration-300 custom-scrollbar">
          
          {/* Header with Title & Reset Button */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Tax Invoice Studio</h1>
                <p className="text-xs text-gray-500">Traymbhkam Tour and Travels • 100% Editable</p>
              </div>
            </div>
            <button
              onClick={() => setData(DEFAULT_INVOICE_DATA)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-sky-600 bg-gray-50 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition cursor-pointer border border-gray-200"
              title="Reset to default invoice data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* INVOICE STAGE / TYPE SELECTOR */}
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 p-3 rounded-xl border border-sky-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📑</span> Invoice Stage / Type
                </span>
                <span className="text-[10px] bg-sky-200/80 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                  {data.invoiceType === "advance" ? "Stage 1: Advance Demand" : "Stage 2: Payment Receipt"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setData({ ...data, invoiceType: "advance" })}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                    data.invoiceType === "advance"
                      ? "bg-white border-amber-500 shadow-sm ring-2 ring-amber-400/30"
                      : "bg-white/70 border-gray-200 hover:bg-white text-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">1</span>
                      Advance Demand
                    </span>
                    {data.invoiceType === "advance" && (
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Demand advance to confirm booking & block vehicle/hotel.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setData({ ...data, invoiceType: "receipt" })}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                    data.invoiceType === "receipt"
                      ? "bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/30"
                      : "bg-white/70 border-gray-200 hover:bg-white text-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">2</span>
                      Payment Receipt
                    </span>
                    {data.invoiceType === "receipt" && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Official receipt showing advance received & balance pending.
                  </p>
                </button>
              </div>
            </div>

            {/* 1. Invoice Particulars */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Invoice Particulars</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Invoice No.</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-mono font-bold text-[#0369a1]" value={data.invoiceNumber} onChange={e => setData({ ...data, invoiceNumber: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Invoice Date</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.bookingDate} onChange={e => setData({ ...data, bookingDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Travel Dates</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.travelDate} onChange={e => setData({ ...data, travelDate: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 2. Client Details */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Billed To (Guest Particulars)</span>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Client / Guest Name</label>
                <input type="text" className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1]" value={data.guestName} onChange={e => setData({ ...data, guestName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Phone Number</label>
                  <input type="text" className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" value={data.guestPhone} onChange={e => setData({ ...data, guestPhone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Email</label>
                  <input type="email" className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.guestEmail} onChange={e => setData({ ...data, guestEmail: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 3. Package & Services Items */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Package Items ({data.packages.length})</span>
                <button onClick={addPackage} className="flex items-center gap-1 px-2.5 py-1 bg-sky-600 text-white text-[11px] font-semibold rounded-lg hover:bg-sky-700 transition-colors cursor-pointer">
                  <Plus size={12} /> Add Item
                </button>
              </div>
              <div className="space-y-2">
                {data.packages.map((pkg, idx) => (
                  <div key={idx} className="p-2.5 bg-white border border-gray-200 rounded-lg space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#0369a1] text-[11px]">Item {idx + 1}</span>
                      <button onClick={() => removePackage(idx)} className="text-gray-400 hover:text-rose-600 transition cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Description of Service</label>
                      <textarea rows={2} className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs leading-snug" value={pkg.detail} onChange={e => handlePackageChange(idx, 'detail', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Qty / Pax</label>
                        <input type="number" className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs" value={pkg.person} onChange={e => handlePackageChange(idx, 'person', Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Rate (₹)</label>
                        <input type="number" className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-mono font-semibold" value={pkg.rate} onChange={e => handlePackageChange(idx, 'rate', Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Amount (₹)</label>
                        <div className="w-full px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono font-bold text-gray-800">₹{pkg.amount.toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Pricing, Advance & Settlement */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  {data.invoiceType === "advance" ? "Advance Demand Settlement" : "Payment Receipt Settlement"}
                </span>
                <span className="text-[10px] font-bold text-gray-700 font-mono">
                  Total: ₹{calculations.total.toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Discount on Package (₹)</label>
                <input
                  type="number"
                  className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono"
                  value={data.discount}
                  onChange={e => setData({ ...data, discount: e.target.value })}
                  placeholder="0"
                />
              </div>

              {data.invoiceType === "advance" ? (
                <div className="space-y-2 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-amber-900">
                      Advance Required to Book (₹)
                    </label>
                    <div className="flex gap-1">
                      {[
                        { label: "25%", pct: 0.25 },
                        { label: "30%", pct: 0.30 },
                        { label: "50%", pct: 0.50 },
                        { label: "Full", pct: 1.0 },
                      ].map(item => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            const val = Math.round(calculations.total * item.pct);
                            setData({ ...data, advanceRequired: String(val) });
                          }}
                          className="px-1.5 py-0.5 text-[9px] font-bold bg-white border border-amber-300 text-amber-800 rounded hover:bg-amber-100 transition cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs font-mono font-bold text-amber-900"
                    value={data.advanceRequired || calculations.advanceRequired}
                    onChange={e => setData({ ...data, advanceRequired: e.target.value })}
                    placeholder="Enter advance required"
                  />
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-amber-200/80 text-amber-950 font-medium">
                    <div>
                      <span className="text-amber-700">Advance Demand: </span>
                      <span className="font-bold font-mono">₹{calculations.advanceRequired.toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="text-amber-700">Remaining on Tour: </span>
                      <span className="font-bold font-mono">₹{calculations.balanceAfterAdvance.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-emerald-900">
                      Advance Received / Paid Amount (₹)
                    </label>
                    <div className="flex gap-1">
                      {[
                        { label: "25%", pct: 0.25 },
                        { label: "30%", pct: 0.30 },
                        { label: "50%", pct: 0.50 },
                        { label: "Full", pct: 1.0 },
                      ].map(item => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            const val = Math.round(calculations.total * item.pct);
                            setData({ ...data, amountPaid: String(val) });
                          }}
                          className="px-1.5 py-0.5 text-[9px] font-bold bg-white border border-emerald-300 text-emerald-800 rounded hover:bg-emerald-100 transition cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    className="w-full px-2 py-1 bg-white border border-emerald-300 rounded text-xs font-mono font-bold text-emerald-700"
                    value={data.amountPaid}
                    onChange={e => setData({ ...data, amountPaid: e.target.value })}
                    placeholder="Enter received amount"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-gray-600 mb-0.5">Payment Mode</label>
                      <select
                        className="w-full px-2 py-1 bg-white border border-emerald-200 rounded text-xs font-medium"
                        value={data.paymentMode ?? "UPI / Online"}
                        onChange={e => setData({ ...data, paymentMode: e.target.value })}
                      >
                        <option value="UPI / Online">UPI / Online Transfer</option>
                        <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                        <option value="GPay / PhonePe / Paytm">GPay / PhonePe / Paytm</option>
                        <option value="Cash Deposit / Cash">Cash Deposit / Cash</option>
                        <option value="Credit / Debit Card">Credit / Debit Card</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-600 mb-0.5">UTR / Txn Ref No.</label>
                      <input
                        type="text"
                        className="w-full px-2 py-1 bg-white border border-emerald-200 rounded text-xs font-mono"
                        placeholder="e.g. UTR129840294"
                        value={data.paymentRef ?? ""}
                        onChange={e => setData({ ...data, paymentRef: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-emerald-200/80 text-emerald-950 font-medium">
                    <div>
                      <span className="text-emerald-700">Received: </span>
                      <span className="font-bold font-mono">₹{calculations.paid.toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="text-emerald-700">Balance Pending: </span>
                      <span className="font-bold font-mono text-rose-600">₹{calculations.pending.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Bank Account & UPI Payment Settings */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Bank Account & UPI QR
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={data.showUpiQr !== false}
                    onChange={e => setData({ ...data, showUpiQr: e.target.checked })}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-[11px] font-semibold text-gray-700">Show QR</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Beneficiary / Holder</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium"
                    value={data.accountHolder ?? "Traymbhkam Tour and Travels"}
                    onChange={e => setData({ ...data, accountHolder: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Bank Name</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium"
                    value={data.bankName ?? "Central Bank of India"}
                    onChange={e => setData({ ...data, bankName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Account Number</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono font-bold"
                    value={data.accountNumber ?? "5242273759"}
                    onChange={e => setData({ ...data, accountNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">IFSC Code</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono font-bold uppercase"
                    value={data.ifscCode ?? "CBIN0280274"}
                    onChange={e => setData({ ...data, ifscCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">UPI ID / VPA (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-[#0369a1] font-bold"
                    value={data.upiId ?? ""}
                    onChange={e => setData({ ...data, upiId: e.target.value })}
                    placeholder="Leave blank or enter later"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Account Type</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                    value={data.accountType ?? "Current Account"}
                    onChange={e => setData({ ...data, accountType: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">UPI QR Code Configuration</label>
                {data.invoiceType === "advance" ? (
                  <div className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-900">⚡ Dynamic Advance UPI QR:</span>
                      <span className="font-mono font-bold text-amber-800">₹{calculations.advanceRequired.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[9px] text-amber-800 leading-tight">
                      Yeh QR code automatic aapke advance demand ₹{calculations.advanceRequired.toLocaleString("en-IN")} ke sath generate ho raha hai. Customer scan karte hi amount pre-filled pay karega.
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-900">
                      <span>✓</span> QR Code Hidden on Receipt
                    </div>
                    <p className="text-[9px] text-emerald-800 leading-tight">
                      Kyunki customer advance pehle hi de chuka hai, Stage 2 (Receipt) par QR code hide rehta hai aur official verified receipt stamp show hoti hai.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Right Column: Live Centered Preview */}
      <div className={`flex flex-col gap-3 transition-all duration-300 h-full ${isFormCollapsed ? "w-full" : "w-full lg:w-[62%]"}`}>
        
        {/* Sleek Toolbar */}
        <div className="bg-white px-4 py-2.5 rounded-2xl shadow-xs border border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Left: Collapse & Zoom controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition cursor-pointer"
              title={isFormCollapsed ? "Show Edit Form" : "Expand Full Preview"}
            >
              {isFormCollapsed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={handleZoomOut}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold text-gray-700 text-[11px] min-w-[42px] text-center">
                {Math.round(currentScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Fit Mode Buttons */}
            <button
              onClick={() => handleSetFitMode("width")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                fitMode === "width" && manualZoom === null
                  ? "bg-sky-50 text-sky-700 border-sky-300 font-bold"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              title="Zoom to Fit Width (Enlarged & Easy to Read)"
            >
              Fit Width
            </button>

            <button
              onClick={() => handleSetFitMode("screen")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                fitMode === "screen" && manualZoom === null
                  ? "bg-sky-50 text-sky-700 border-sky-300 font-bold"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              title="Fit Full Page on Screen"
            >
              Fit Page
            </button>

            <div className="h-4 w-px bg-gray-200 mx-1 hidden md:block"></div>

            {/* Quick Stage Switcher */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setData(prev => ({ ...prev, invoiceType: "advance" }))}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  data.invoiceType === "advance"
                    ? "bg-amber-500 text-white font-bold shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Stage 1: Advance Demand Invoice to lock booking"
              >
                <span>📋</span>
                <span>1. Advance Demand</span>
              </button>
              <button
                type="button"
                onClick={() => setData(prev => ({ ...prev, invoiceType: "receipt" }))}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  data.invoiceType === "receipt"
                    ? "bg-emerald-600 text-white font-bold shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Stage 2: Payment Receipt & Balance Pending Invoice"
              >
                <span>🧾</span>
                <span>2. Payment Receipt</span>
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShareWhatsApp()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0369a1] hover:bg-[#025684] text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Centered Preview Viewport */}
        <div 
          ref={previewContainerRef}
          className="w-full flex-1 overflow-auto bg-slate-200/90 p-4 rounded-2xl flex flex-col items-center justify-start custom-scrollbar relative"
        >
          <div
            style={{
              width: `${Math.round(794 * currentScale)}px`,
              minHeight: `${Math.round(1122 * currentScale)}px`,
              transition: "width 0.15s ease-out, min-height 0.15s ease-out"
            }}
            className="relative shrink-0 flex flex-col items-center shadow-lg"
          >
            <div
              style={{
                transform: `scale(${currentScale})`,
                transformOrigin: "top left",
                width: "794px",
                position: "absolute",
                top: 0,
                left: 0,
                transition: "transform 0.15s ease-out"
              }}
            >
              {renderInvoiceContent("view")}
            </div>
          </div>
        </div>

      </div>

      {/* Hidden Print Container for High-Res PDF Export */}
      <div className="fixed -left-[99999px] top-0 pointer-events-none opacity-100 z-[-100]">
        {renderInvoiceContent("print")}
      </div>

      {/* Full-Size QR Scanner Modal for Instant Screen Scanning (Advance Stage Only) */}
      {showQrModal && data.invoiceType === "advance" && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-150 border-2 border-amber-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center w-full pb-2 border-b border-gray-100">
              <div className="text-left">
                <h3 className="font-bold text-gray-900 text-sm">Official Advance Payment QR</h3>
                <p className="text-xs text-amber-700 font-bold">Traymbhkam Tour and Travels</p>
              </div>
              <button 
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center text-base font-bold cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white border-2 border-amber-300 rounded-2xl shadow-inner flex items-center justify-center">
              <img
                src={generatedQr || `${data.customQrUrl || "/qr_clean.png"}?v=5`}
                alt="Full Size Advance UPI QR Code"
                className="w-64 h-64 object-contain"
              />
            </div>

            <div className="space-y-1.5 text-xs text-gray-600 w-full bg-amber-50/70 p-3 rounded-xl border border-amber-200">
              <div className="flex justify-between items-center text-amber-950 font-bold text-sm">
                <span>Advance Required:</span>
                <span className="font-mono text-base text-amber-900">₹{calculations.advanceRequired.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[11px] text-amber-800 font-medium">Exact amount pre-filled automatically on scan!</p>
              <div className="pt-2 text-[11px] text-left border-t border-amber-200 mt-2 space-y-0.5 text-gray-700">
                <p><span className="text-gray-500 font-medium">Payee VPA:</span> <span className="font-mono font-bold text-[#0369a1] select-all">{data.upiId || "20251232406374-iservuqrsbrp@cbin"}</span></p>
                <p><span className="text-gray-500 font-medium">Bank Name:</span> <strong className="text-gray-900 font-semibold">Central Bank of India</strong></p>
                <p><span className="text-gray-500 font-medium">Account No:</span> <strong className="font-mono text-gray-900 font-bold">5242273759</strong></p>
                <p><span className="text-gray-500 font-medium">IFSC Code:</span> <strong className="font-mono text-gray-900 font-bold">CBIN0280274</strong></p>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Share & Direct Delivery Modal */}
      {showWhatsAppModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowWhatsAppModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150 border border-emerald-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {data.invoiceType === "advance" ? "Share Advance Invoice on WhatsApp" : "Share Payment Receipt on WhatsApp"}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Direct chat with customer (no search needed)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowWhatsAppModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center text-sm font-bold cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Customer WhatsApp Phone Number:
              </label>
              <div className="flex gap-2">
                <span className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-600 flex items-center">
                  +91
                </span>
                <input
                  type="text"
                  placeholder="Enter 10-digit mobile number"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={waPhoneInput}
                  onChange={e => {
                    setWaPhoneInput(e.target.value);
                    setData(prev => ({ ...prev, guestPhone: e.target.value }));
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-500">
                Customer ka chat direct khulega, search karne ki koi problem nahi aayegi.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleShareWhatsApp(waPhoneInput, "image")}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <span>🖼️</span>
                <span>Send as Full Invoice Image (Paste with Ctrl+V)</span>
              </button>

              <button
                onClick={() => handleShareWhatsApp(waPhoneInput, "pdf")}
                className="w-full flex items-center justify-center gap-2 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-sky-700" />
                <span>📥 Download PDF & Open Customer WhatsApp</span>
              </button>

              <button
                onClick={() => handleShareWhatsApp(waPhoneInput, "text")}
                className="w-full flex items-center justify-center gap-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-[11px] font-medium transition cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
                <span>Open WhatsApp with Text Details Only</span>
              </button>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[10px] text-amber-900 leading-snug">
              💡 <strong>Instant Image Tip:</strong> First button par click karein, WhatsApp chat khulte hi <strong>Ctrl + V</strong> dabayein — poori original color invoice image automatically paste ho jayegi!
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
