"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Download, 
  Loader2, 
  MessageCircle, 
  Car, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ArrowDownRight,
  Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveDocumentToHub } from "@/lib/documentsHub";

// Actual Old Voucher: Chardham 10D (Bill 604 - Jayesh Bhai Patel / Innova)
const PRESET_TRANSPORT_CHARDHAM_ACTUAL = {
  date: "14 May 2026",
  exoNo: "BILL NO. 604",
  fileNo: "604",
  guestName: "Mr. Jayesh Bhai Babubhai Patel",
  managerMobile: "+91 97190 38278",
  noOfAdults: "7 Members",
  vehicleType: "01 Innova (Private Taxi)",
  arrivalDate: "14/05/2026 ~ Haridwar Railway Station",
  departureDate: "23/05/2026 ~ Haridwar Drop",
  favouringGuest: "Mr. Jayesh Bhai Patel",
  favouringPax: "7",
  favouringVehicle: "Innova",
  itinerary: [
    { date: "14/05/2026", details: "Haridwar pickup, scenic drive to Barkot & check-in", hotel: "Hotel Sarutal (7818854893)" },
    { date: "15/05/2026", details: "Barkot to Yamunotri Dham trek, Darshan & return to Barkot", hotel: "Hotel Sarutal (7818854893)" },
    { date: "16/05/2026", details: "Scenic drive from Barkot to Uttarkashi, Vishwanath temple", hotel: "Hotel Skyline (8923184251)" },
    { date: "17/05/2026", details: "Gangotri Dham Darshan via Harsil Valley & return", hotel: "Hotel Skyline (8923184251)" },
    { date: "18/05/2026", details: "Uttarkashi to Phata Kedarnath base route", hotel: "Hotel Maa Paa (9634528441)" },
    { date: "19/05/2026", details: "Transfer to Gaurikund, Kedarnath Trek & Darshan", hotel: "Bhagwari Ji (Tent Only - 9068648285)" },
    { date: "20/05/2026", details: "Trek down to Gaurikund & transfer to Phata hotel", hotel: "Hotel Maa Paa (9634528441)" },
    { date: "21/05/2026", details: "Drive Phata to Badrinath via Chopta, evening Aarti", hotel: "Hotel Dhansree (8395091744)" },
    { date: "22/05/2026", details: "Badrinath Darshan, Mana Village & drive to Pipal Koti", hotel: "Hotel Dabral (7452827619)" },
    { date: "23/05/2026", details: "Pipal Koti to Haridwar Drop, tour concludes", hotel: "Haridwar Drop" }
  ]
};

// Actual Old Voucher: Do Dham 6D (Bill 626 - Surendar Kumar Patti / Tempo Traveller)
const PRESET_TRANSPORT_DODHAM_ACTUAL = {
  date: "14 May 2026",
  exoNo: "BILL NO. 626",
  fileNo: "626",
  guestName: "Mr. Surendar Kumar Patti",
  managerMobile: "+91 97190 38278",
  noOfAdults: "24+2 Members",
  vehicleType: "01 Tempo Traveller (Hall Package)",
  arrivalDate: "14/05/2026 ~ Haridwar",
  departureDate: "19/05/2026 ~ Haridwar Drop",
  favouringGuest: "Mr. Surendar Kumar Patti",
  favouringPax: "24+2",
  favouringVehicle: "Tempo Traveller",
  itinerary: [
    { date: "14/05/2026", details: "Haridwar pickup & drive to Badashu / Guptkashi", hotel: "Hotel Omkara (8923334391)" },
    { date: "15/05/2026", details: "Transfer to Sonprayag/Gaurikund, Kedarnath Trek & Darshan", hotel: "Bhagwari Ji (Tent Only - 9068648285)" },
    { date: "16/05/2026", details: "Trek down to Gaurikund, transfer back to Badashu", hotel: "Hotel Omkara (8923334391)" },
    { date: "17/05/2026", details: "Drive Badashu to Pipal Koti / Badrinath route", hotel: "Hotel Dabral (7452827619)" },
    { date: "18/05/2026", details: "Badrinath Dham Darshan, Mana village & return to Pipal Koti", hotel: "Hotel Dabral (7452827619)" },
    { date: "19/05/2026", details: "Pipal Koti to Haridwar Drop, tour concludes", hotel: "Haridwar Drop" }
  ]
};

const PRESET_TRANSPORT_12P_10D = {
  date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  exoNo: "UK-TR-12P2026",
  fileNo: "12P-01",
  guestName: "12 Pax Pilgrimage Group",
  managerMobile: "+91 97190 38278",
  noOfAdults: "12 Persons",
  vehicleType: "01 Luxury 12-Seater Tempo Traveller",
  arrivalDate: "Day 1 ~ Haridwar / Rishikesh / Dehradun",
  departureDate: "Day 10 ~ Haridwar / Dehradun Drop",
  favouringGuest: "12 Pax Group",
  favouringPax: "12",
  favouringVehicle: "Tempo Traveller",
  itinerary: [
    { date: "Day 1", details: "Haridwar/Dehradun pickup, drive to Barkot via Kempty Falls", hotel: "Barkot Deluxe Hotel" },
    { date: "Day 2", details: "Drive to Janki Chatti, Yamunotri Dham trek, Darshan & return to Barkot", hotel: "Barkot Deluxe Hotel" },
    { date: "Day 3", details: "Scenic drive from Barkot to Uttarkashi, Vishwanath Temple", hotel: "Uttarkashi Deluxe Hotel" },
    { date: "Day 4", details: "Gangotri Dham Darshan via beautiful Harsil Valley & back to Uttarkashi", hotel: "Uttarkashi Deluxe Hotel" },
    { date: "Day 5", details: "Scenic mountain transfer from Uttarkashi to Phata / Rampur / Guptkashi", hotel: "Phata / Rampur Resort" },
    { date: "Day 6", details: "Transfer to Sonprayag/Gaurikund, Kedarnath Trek & Holy Darshan", hotel: "Kedarnath (Tent Only)" },
    { date: "Day 7", details: "Morning trek down to Gaurikund, transfer to Sitapur / Phata hotel", hotel: "Phata / Sitapur Resort" },
    { date: "Day 8", details: "Drive to Badrinath via Chopta alpine hill station, evening Aarti", hotel: "Badrinath Deluxe Hotel" },
    { date: "Day 9", details: "Badrinath Darshan, Mana Village, Vyas Gufa, drive to Pipalkoti", hotel: "Pipalkoti Deluxe Hotel" },
    { date: "Day 10", details: "Enroute Maa Dhari Devi & Devprayag, Rishikesh drop / Haridwar drop", hotel: "Tour Concludes" }
  ]
};


const DEFAULT_TRANSPORT_DATA = {
  date: "15 May 2026",
  exoNo: "UK-TR-2026",
  fileNo: "01",
  guestName: "Valued Guest & Family",
  managerMobile: "+91 97190 38278",
  noOfAdults: "04 Adults",
  vehicleType: "01 Innova Crysta (Non-AC in Hills)",
  arrivalDate: "15 May 2026 ~ Haridwar / Dehradun",
  departureDate: "24 May 2026 ~ Haridwar / Dehradun",
  favouringGuest: "Valued Guest",
  favouringPax: "04",
  favouringVehicle: "01 Innova Crysta (Non-AC in Hills)",
  itinerary: [
    { 
      date: "Day 1", 
      details: "Haridwar / Dehradun pickup, scenic drive to Barkot & hotel check-in", 
      hotel: "Hotel / Camp, Barkot" 
    },
    { 
      date: "Day 2", 
      details: "Barkot to Yamunotri Dham trek & darshan, evening return transfer", 
      hotel: "Hotel / Camp, Barkot" 
    },
    { 
      date: "Day 3", 
      details: "Drive to Uttarkashi, Kashi Vishwanath temple darshan", 
      hotel: "Hotel / Resort, Uttarkashi" 
    },
    { 
      date: "Day 4", 
      details: "Gangotri Dham darshan, Harsil Valley scenic drive & return", 
      hotel: "Hotel / Resort, Uttarkashi" 
    },
    { 
      date: "Day 5", 
      details: "Scenic transfer from Uttarkashi to Guptkashi / Sitapur", 
      hotel: "Hotel / Resort, Guptkashi" 
    },
    { 
      date: "Day 6", 
      details: "Transfer to Sonprayag / Helipad for holy Kedarnath Dham darshan", 
      hotel: "Kedarnath Base / Sitapur" 
    },
    { 
      date: "Day 7", 
      details: "Morning darshan, return transfer & scenic drive to Badrinath Dham", 
      hotel: "Hotel, Badrinath" 
    },
    { 
      date: "Day 8", 
      details: "Badrinath Dham darshan, Mana village, Vyas Gufa & drive to Pipalkoti", 
      hotel: "Hotel, Pipalkoti" 
    },
    { 
      date: "Day 9", 
      details: "Drive from Pipalkoti to Rishikesh, evening Ganga Aarti at Triveni Ghat", 
      hotel: "Hotel / Resort, Rishikesh" 
    },
    { 
      date: "Day 10", 
      details: "Morning check-out, Rishikesh local sightseeing & airport/station drop", 
      hotel: "Tour Concludes" 
    },
  ]
};

export default function TransportVouchers() {
  const [data, setData] = useState(DEFAULT_TRANSPORT_DATA);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [autoScale, setAutoScale] = useState<number>(0.55);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [fitMode, setFitMode] = useState<"screen" | "width">("screen");
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

  // Load saved transport voucher from localStorage or sync with itinerary
  const [hasSavedItinerary, setHasSavedItinerary] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTransport = localStorage.getItem("traymbhkam_transport_voucher_data");
        if (savedTransport) {
          const parsed = JSON.parse(savedTransport);
          if (parsed && parsed.itinerary && parsed.itinerary.length > 0) {
            setData(parsed);
          }
        } else {
          // Fetch latest saved transport voucher from Supabase Cloud
          const fetchCloudTransport = async () => {
            try {
              const { data: cloudVoucher } = await supabase
                .from("vouchers")
                .select("document_data")
                .eq("voucher_type", "transport")
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

              if (cloudVoucher && cloudVoucher.document_data && Array.isArray((cloudVoucher.document_data as any).itinerary)) {
                setData(cloudVoucher.document_data as typeof DEFAULT_TRANSPORT_DATA);
                localStorage.setItem("traymbhkam_transport_voucher_data", JSON.stringify(cloudVoucher.document_data));
              }
            } catch {}
          };
          fetchCloudTransport();
        }

        // Check if an itinerary was prepared in Itinerary Builder
        const storedItinerary = localStorage.getItem("traymbhkam_current_itinerary");
        if (storedItinerary) {
          setHasSavedItinerary(true);
        }
      } catch (e) {
        console.warn("Could not load stored transport voucher:", e);
      }
    }
  }, []);

  // Update data and automatically save to localStorage
  const updateData = (newData: typeof DEFAULT_TRANSPORT_DATA) => {
    setData(newData);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("traymbhkam_transport_voucher_data", JSON.stringify(newData));
      } catch (e) {}
    }
  };

  // Import directly from the customer's itinerary builder
  const handleImportFromItinerary = () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("traymbhkam_current_itinerary");
      if (!stored) {
        alert("No itinerary found in Itinerary Builder. Please create or open an itinerary first!");
        return;
      }

      const itin = JSON.parse(stored);
      if (!itin || !Array.isArray(itin.days) || itin.days.length === 0) {
        alert("The current itinerary has no days to import.");
        return;
      }

      // Convert day-by-day itinerary to transport voucher format
      const transportSchedule = itin.days.map((d: any, idx: number) => {
        const activitiesText = Array.isArray(d.activities) && d.activities.length > 0
          ? " — " + d.activities.join("; ")
          : "";
        return {
          date: `Day ${d.dayNumber || idx + 1}`,
          details: `${d.route || "Transit & Sightseeing"}${activitiesText}`,
          hotel: d.overnightStay ? `Hotel / Camp, ${d.overnightStay}` : "Hotel / Camp"
        };
      });

      const importedData = {
        date: itin.travelDates || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        exoNo: `UK-TR-${new Date().getFullYear()}`,
        fileNo: "01",
        guestName: itin.preparedFor || "Valued Guest",
        managerMobile: itin.contactPhone || "+91 97190 38278",
        noOfAdults: "04 Adults",
        vehicleType: "01 Innova Crysta / Tempo Traveller (Non-AC in Hills)",
        arrivalDate: itin.travelDates ? `${itin.travelDates} ~ ${itin.startingPoint || "Haridwar / Dehradun"}` : "Haridwar / Dehradun",
        departureDate: itin.travelDates ? `${itin.travelDates} ~ Tour Concludes` : "Tour Concludes",
        favouringGuest: itin.preparedFor || "Valued Guest",
        favouringPax: "04",
        favouringVehicle: "01 Innova Crysta / Tempo Traveller (Non-AC in Hills)",
        itinerary: transportSchedule
      };

      updateData(importedData);
      setImportNotification(`✓ Successfully imported ${transportSchedule.length} days from Itinerary: "${itin.title || itin.preparedFor || 'Customer Tour'}"`);
      setTimeout(() => setImportNotification(null), 4500);
    } catch (err) {
      console.error("Failed to import itinerary:", err);
      alert("Failed to import itinerary.");
    }
  };

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

  const handleItineraryChange = (index: number, field: string, value: string) => {
    const newItinerary = [...data.itinerary];
    newItinerary[index] = { ...newItinerary[index], [field]: value };
    updateData({ ...data, itinerary: newItinerary });
  };

  const addDay = () => {
    updateData({
      ...data,
      itinerary: [...data.itinerary, { date: `Day ${data.itinerary.length + 1}`, details: "", hotel: "" }]
    });
  };

  const removeDay = (index: number) => {
    updateData({
      ...data,
      itinerary: data.itinerary.filter((_, i) => i !== index)
    });
  };

  // High-Resolution PDF Download
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const element = document.getElementById("print-transport-voucher");
      if (!element) {
        alert("Could not find the print container.");
        setIsDownloading(false);
        return;
      }

      // Save to Supabase Cloud
      try {
        if (data.guestName) {
          await supabase.from("vouchers").insert({
            voucher_type: "transport",
            guest_name: data.guestName,
            document_data: data
          });
        }
      } catch (dbError) {
        console.error("Failed to save to database:", dbError);
      }

      // Record in local Document Hub
      try {
        saveDocumentToHub({
          id: `transport-${data.exoNo || data.fileNo || Date.now()}`,
          type: "transport_voucher",
          title: `Transport Voucher - ${data.guestName || "Guest"}`,
          docNumber: `${data.exoNo || "EXO"}/${data.fileNo || "01"}`,
          guestName: data.guestName || "Valued Guest",
          travelDates: `${data.arrivalDate || ""} – ${data.departureDate || ""}`.trim() || data.date,
          paxCount: data.noOfAdults || "",
          detailsSummary: `Vehicle: ${data.vehicleType || "Fleet Vehicle"} | Schedule: ${data.itinerary.length} Days`,
          studioUrl: "/transport",
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
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaled dimensions to ensure 100% fit on a single A4 page without cutting
      const rawPdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const fitScale = rawPdfHeight > pageHeight ? (pageHeight / rawPdfHeight) : 1;
      const finalPdfWidth = pdfWidth * fitScale;
      const finalPdfHeight = rawPdfHeight * fitScale;
      const xOffset = (pdfWidth - finalPdfWidth) / 2;
      
      pdf.addImage(imgData, "JPEG", xOffset, 0, finalPdfWidth, finalPdfHeight);

      // Add clickable PDF link annotations
      try {
        const linkEls = element.querySelectorAll("a[href], [data-pdf-link]");
        const containerRect = element.getBoundingClientRect();
        linkEls.forEach((linkNode) => {
          const rect = linkNode.getBoundingClientRect();
          const targetUrl = linkNode.getAttribute("data-pdf-link") || (linkNode as HTMLAnchorElement).href;
          if (targetUrl && rect.width > 0 && rect.height > 0 && containerRect.width > 0 && containerRect.height > 0) {
            const x = xOffset + ((rect.left - containerRect.left) / containerRect.width) * finalPdfWidth;
            const y = ((rect.top - containerRect.top) / containerRect.height) * finalPdfHeight;
            const w = (rect.width / containerRect.width) * finalPdfWidth;
            const h = (rect.height / containerRect.height) * finalPdfHeight;
            pdf.link(x, y, w, h, { url: targetUrl });
          }
        });
      } catch (linkErr) {
        console.warn("Could not attach PDF link annotations:", linkErr);
      }
      
      pdf.save(`Transport_Voucher_${data.guestName.replace(/\s+/g, "_")}.pdf`);
    } catch (error: any) {
      console.error("PDF generation failed:", error);
      alert(`Failed to generate PDF: ${error.message || error}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const rawPhone = (data as any).guestMobile || (data as any).guestPhone || "";
    let cleanPhone = rawPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
    else if (cleanPhone.startsWith("0") && cleanPhone.length === 11) cleanPhone = `91${cleanPhone.slice(1)}`;
    
    if (!cleanPhone) {
      const input = prompt("Enter Customer WhatsApp 10-digit Mobile Number:", "");
      if (!input) return;
      cleanPhone = input.replace(/[^0-9]/g, "");
      if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
    }

    const message = `*TRANSPORT SERVICE VOUCHER - TRAYMBHKAM TOUR AND TRAVELS*\n\nDear ${data.guestName},\n\nPlease find your transport booking voucher.\n• Vehicle: ${data.vehicleType}\n• Fleet Helpline: ${data.managerMobile}\n• Arrival: ${data.arrivalDate}\n• Departure: ${data.departureDate}\n\nThank you for choosing Traymbhkam Tour and Travels!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
  };

  // Modular Page Renderer - Exactly 1 A4 Page (1122px height) matching Hotel Voucher
  const renderVoucherContent = (prefix: string) => (
    <div 
      id={`${prefix}-transport-voucher`} 
      className="w-[794px] h-[1122px] min-h-[1122px] max-h-[1122px] bg-[#fcfbf9] shadow-2xl shrink-0 px-8 py-6 flex flex-col justify-between relative overflow-hidden text-slate-900 border border-amber-300/70"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        
        {/* TOP CONTENT SECTION */}
        <div className="space-y-2.5">
          
          {/* Top Decorative Chevron Band */}
          <div className="w-full flex items-center justify-between gap-2 mb-1">
            <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-[#0f2744] rounded-full" />
            <span className="text-[9.5px] font-display font-black uppercase tracking-[0.25em] text-amber-700">✦ OFFICIAL FLEET SERVICE VOUCHER ✦</span>
            <div className="h-1 flex-1 bg-gradient-to-r from-[#0f2744] via-amber-400 to-amber-500 rounded-full" />
          </div>

          {/* Luxury 2-Row Brand & Operations Header */}
          <div className="border-b-2 border-amber-200/80 pb-2.5 space-y-2">
            {/* ROW 1: Brand & Badge */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img src="/logo.png" alt="Traymbhkam Tour and Travels" className="h-14 w-auto object-contain shrink-0 drop-shadow-xs" />
                <div className="min-w-0">
                  <h2 className="text-[19px] font-serif-luxury font-black tracking-tight text-[#0f2744] leading-tight uppercase">
                    Traymbhkam Tour and Travels
                  </h2>
                  <p className="text-[10px] font-display font-bold text-amber-700 tracking-wider uppercase">
                    Spiritual Pilgrimage &amp; Dedicated Chardham Mountain Fleet
                  </p>
                  <p className="text-[9px] text-gray-500 font-semibold tracking-wide">
                    Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2022/004983 · 010/RTA/23
                  </p>
                </div>
              </div>

              {/* Official Voucher Badge */}
              <div className="shrink-0 text-right">
                <div className="bg-gradient-to-r from-[#0a192f] via-[#0f2744] to-[#0a192f] text-amber-300 border border-amber-400/40 px-4 py-1.5 rounded-xl shadow-xs text-center">
                  <span className="text-[11.5px] font-display font-black uppercase tracking-wider block">
                    ✦ TRANSPORT SERVICE VOUCHER ✦
                  </span>
                  <span className="text-[8px] font-display uppercase tracking-widest text-slate-300 block mt-0.5">
                    CONFIRMED VEHICLE ALLOCATION
                  </span>
                </div>
              </div>
            </div>

            {/* ROW 2: Address & Spacious 24/7 Fleet Operations Helpline Card */}
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <div className="flex items-center gap-2 text-[10.5px] text-slate-700 font-medium min-w-0">
                <span className="font-bold text-[#0f2744] flex items-center gap-1 shrink-0">
                  📍 Booking Office:
                </span>
                <span className="truncate">Shop 38, Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar</span>
              </div>

              {/* Generous Helpline Card with Plenty of Padding */}
              <div className="shrink-0 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border border-amber-300/80 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="text-right">
                  <div className="text-[8.5px] uppercase font-display font-bold text-amber-900 tracking-wider">
                    24x7 Fleet Helpline
                  </div>
                  <div className="text-[12px] font-display font-black text-[#0f2744] tracking-tight leading-tight">
                    {data.managerMobile || "+91 82660 16066"} <span className="font-normal text-[9.5px] text-amber-800">(Mr. Gagandeep)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Meta Bar */}
          <div className="bg-gradient-to-r from-amber-50/80 via-slate-50 to-amber-50/60 border border-amber-200/80 rounded-lg py-1 px-3.5 text-[12px] text-slate-800 flex justify-between items-center font-medium">
            <span>Date: <strong className="text-amber-800 font-bold text-[12.5px]">{data.date || "N/A"}</strong></span>
            <span>E.X.O. No: <strong className="text-slate-900 font-bold text-[12.5px]">{data.exoNo || "UK-TR-2026"}</strong></span>
            <span>File No: <strong className="text-slate-900 font-bold text-[12.5px]">{data.fileNo || "01"}</strong></span>
          </div>

          {/* Transfer & Vehicle Details Table */}
          <div className="border border-slate-200 rounded-lg py-1.5 px-3 bg-slate-50/80 grid grid-cols-2 gap-2.5 text-[12px]">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-slate-600 font-medium">Guest Name:</span>
                <span className="font-bold text-slate-900 text-[12.5px]">{data.guestName || "Valued Guest"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-slate-600 font-medium">Assigned Vehicle:</span>
                <span className="font-bold text-amber-800 text-[12.5px]">{data.vehicleType}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-slate-600 font-medium">Arrival:</span>
                <span className="font-semibold text-slate-800 text-[11.5px] truncate">{data.arrivalDate}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-slate-600 font-medium">Passengers:</span>
                <span className="font-bold text-slate-800 text-[12px]">{data.noOfAdults}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-slate-600 font-medium">Fleet Contact:</span>
                <span className="font-bold text-emerald-800 text-[12px]">{data.managerMobile}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-slate-600 font-medium">Departure:</span>
                <span className="font-semibold text-slate-800 text-[11.5px] truncate">{data.departureDate}</span>
              </div>
            </div>
          </div>

          {/* Favouring Banner */}
          <div className="bg-gradient-to-r from-amber-50/70 via-slate-50 to-white border border-amber-200/80 rounded-lg py-1 px-3 text-xs flex items-center justify-between font-medium">
            <div className="flex items-center gap-2">
              <span className="font-bold font-display text-amber-800 uppercase tracking-wider text-[10px]">FAVOURING:</span>
              <span className="font-bold text-slate-900 text-[11.5px]">{data.favouringGuest}</span>
              <span className="text-slate-300">|</span>
              <span className="font-bold text-amber-900 text-[11.5px]">{data.favouringPax} Pax</span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded border border-slate-200">{data.favouringVehicle}</span>
          </div>

          {/* Day-by-Day Schedule Table */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-[12.5px] uppercase tracking-wider text-[#0b1320] flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-600" />
                <span>Day-by-Day Transport Schedule ({data.itinerary.length} Legs / Days)</span>
              </h3>
              <span className="text-[10.5px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                100% Confirmed
              </span>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-[#0b1320] text-amber-300 font-display text-[11px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-1.5 px-3 w-[18%]">Date &amp; Day</th>
                    <th className="py-1.5 px-3 w-[52%]">Transfers &amp; Sightseeing Route</th>
                    <th className="py-1.5 px-3 w-[30%]">Night Stay / Dropping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.itinerary.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50/25"}>
                      <td className="py-1.5 px-3 font-bold text-amber-800 align-top">
                        <div className="text-[12px] font-bold text-amber-800 leading-tight">{item.date || `Day ${idx + 1}`}</div>
                      </td>
                      <td className="py-1.5 px-3 text-slate-800 align-top">
                        <div className="text-[11.5px] font-medium leading-snug">{item.details}</div>
                      </td>
                      <td className="py-1.5 px-3 align-top">
                        <div className="text-[11.5px] font-bold text-slate-900 leading-snug">{item.hotel}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transport Guidelines */}
          <div className="space-y-0.5">
            <h4 className="font-bold font-display text-slate-900 uppercase text-[11px] tracking-wider">
              Transport Guidelines &amp; Operational Inclusions:
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10.5px] text-slate-800 space-y-0.5 leading-snug font-medium">
              <p className="flex items-start gap-1">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>All toll taxes, interstate permits, parking fees, and driver night allowances are included in the package.</span>
              </p>
              <p className="flex items-start gap-1">
                <span className="text-amber-600 font-bold shrink-0">ℹ</span>
                <span>Vehicle air conditioning does not operate in hill areas/steep ghat climbs as per mountain regulations. Dedicated vehicle operates Non-AC on hill sectors.</span>
              </p>
              <p className="flex items-start gap-1">
                <span className="text-amber-600 font-bold shrink-0">ℹ</span>
                <span>Night driving in high-altitude mountain sectors is strictly restricted after 8:00 PM per government road safety guidelines.</span>
              </p>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Compact Footer Bar */}
        <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-[10.5px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-slate-800 font-bold">Traymbhkam Tour and Travels</span>
            <span>·</span>
            <span>Pilgrimage Transport Fleet</span>
          </div>
          <div className="text-center font-serif-luxury font-black text-amber-800 text-xs tracking-wider">
            ॐ नमः शिवाय
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Opp. Railway Station Gate No. 2, Haridwar
            </span>
            <span>·</span>
            <span className="font-semibold text-slate-700">Page 1 of 1</span>
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
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Transport Studio</h1>
                <p className="text-xs text-gray-500">Traymbhkam Tour and Travels • 100% Editable</p>
              </div>
            </div>
            <button
              onClick={() => updateData(DEFAULT_TRANSPORT_DATA)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-sky-600 bg-gray-50 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition cursor-pointer border border-gray-200"
              title="Reset to default voucher data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Quick Presets Bar */}
          <div className="flex items-center gap-1.5 flex-wrap -mt-2">
            <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mr-1">Quick Load:</span>
            <button
              type="button"
              onClick={() => updateData(PRESET_TRANSPORT_CHARDHAM_ACTUAL)}
              className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
              title="Client Voucher: Chardham 10D (Bill 604 - Mr. Jayesh Patel / Innova)"
            >
              ★ Chardham 10D (Bill 604)
            </button>
            <button
              type="button"
              onClick={() => updateData(PRESET_TRANSPORT_DODHAM_ACTUAL)}
              className="px-2.5 py-1 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
              title="Client Voucher: Do Dham 6D (Bill 626 - Mr. Surendar Patti / Tempo Traveller)"
            >
              ★ Do Dham 6D (Bill 626)
            </button>
            <button
              type="button"
              onClick={() => updateData(PRESET_TRANSPORT_12P_10D)}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="10 Days Chardham 12 Pax Tempo Traveller (Haridwar to Haridwar)"
            >
              10D Chardham (12 Pax Tempo)
            </button>

            <button
              type="button"
              onClick={() => updateData(DEFAULT_TRANSPORT_DATA)}
              className="px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-300 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              10D Chardham (Innova)
            </button>
          </div>

          {/* Quick Import from Itinerary Banner */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50/70 to-sky-50 p-3 rounded-xl border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Sync with Customer Itinerary
              </span>
              <span className="text-[10px] text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full font-semibold">
                Auto-Fill
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-snug">
              Agar customer ko Itinerary bana ke di hai, toh yahan ek click me Guest name, date aur Day-wise schedule auto-import kar lijiye:
            </p>
            <button
              type="button"
              onClick={handleImportFromItinerary}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Import Itinerary Schedule & Details</span>
            </button>
            {importNotification && (
              <p className="text-[10.5px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-1.5 rounded font-semibold">
                {importNotification}
              </p>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Voucher Particulars */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Voucher Reference</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Date</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.date} onChange={e => updateData({ ...data, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">E.X.O. No.</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" value={data.exoNo} onChange={e => updateData({ ...data, exoNo: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">File No.</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.fileNo} onChange={e => updateData({ ...data, fileNo: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 2. Guest & Vehicle */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Guest & Vehicle Details</span>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Guest / Group Name</label>
                <input type="text" className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1]" value={data.guestName} onChange={e => updateData({ ...data, guestName: e.target.value, favouringGuest: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Vehicle Type</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" value={data.vehicleType} onChange={e => updateData({ ...data, vehicleType: e.target.value, favouringVehicle: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Fleet Manager Phone</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-mono" value={data.managerMobile} onChange={e => updateData({ ...data, managerMobile: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Total Passengers (Pax)</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-sky-800" 
                    placeholder="e.g. 04 Adults / 06 Pax" 
                    value={data.noOfAdults} 
                    onChange={e => updateData({ 
                      ...data, 
                      noOfAdults: e.target.value, 
                      favouringPax: e.target.value.replace(/[^0-9]/g, "") || e.target.value 
                    })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Favouring Banner Pax Count</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                    placeholder="e.g. 04" 
                    value={data.favouringPax} 
                    onChange={e => updateData({ ...data, favouringPax: e.target.value })} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Arrival Transfer</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.arrivalDate} onChange={e => updateData({ ...data, arrivalDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Departure Transfer</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.departureDate} onChange={e => updateData({ ...data, departureDate: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 3. Schedule Table CRUD */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Transport Schedule ({data.itinerary.length} Legs)</span>
                <button onClick={addDay} className="flex items-center gap-1 px-2.5 py-1 bg-sky-600 text-white text-[11px] font-semibold rounded-lg hover:bg-sky-700 transition-colors cursor-pointer">
                  <Plus size={12} /> Add Day
                </button>
              </div>
              <div className="space-y-2">
                {data.itinerary.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-white border border-gray-200 rounded-lg space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#0369a1] text-[11px]">Leg / Day {idx + 1}</span>
                      <button onClick={() => removeDay(idx)} className="text-gray-400 hover:text-rose-600 transition cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Date</label>
                        <input type="text" className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs" value={item.date} onChange={e => handleItineraryChange(idx, 'date', e.target.value)} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[10px] text-gray-500">Night Stay / Drop</label>
                          <button
                            type="button"
                            onClick={() => {
                              const current = item.hotel || "";
                              if (!current.includes("Tent Only")) {
                                handleItineraryChange(idx, 'hotel', current ? `${current.replace(/\(Tent.*?\)/i, "").trim()} (Tent Only)` : "Kedarnath (Tent Only)");
                              }
                            }}
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold transition cursor-pointer ${
                              item.hotel?.includes("Tent Only")
                                ? "bg-amber-600 text-white"
                                : "text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                            }`}
                            title="Set Tent Only"
                          >
                            ⛺ Tent Only
                          </button>
                        </div>
                        <input type="text" className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold" value={item.hotel} onChange={e => handleItineraryChange(idx, 'hotel', e.target.value)} />
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleItineraryChange(idx, 'hotel', "Kedarnath (Tent Only)")}
                            className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
                          >
                            Kedarnath (Tent Only)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItineraryChange(idx, 'hotel', "Hotel Stay")}
                            className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
                          >
                            Hotel Stay
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItineraryChange(idx, 'hotel', "Haridwar Drop")}
                            className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
                          >
                            Drop Off
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Route & Sightseeing Details</label>
                      <textarea rows={2} className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs leading-tight" value={item.details} onChange={e => handleItineraryChange(idx, 'details', e.target.value)} />
                    </div>
                  </div>
                ))}
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
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
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
              {renderVoucherContent("view")}
            </div>
          </div>
        </div>

      </div>

      {/* Hidden Print Container for High-Res PDF Export */}
      <div className="fixed -left-[99999px] top-0 pointer-events-none opacity-100 z-[-100]">
        {renderVoucherContent("print")}
      </div>

    </div>
  );
}
