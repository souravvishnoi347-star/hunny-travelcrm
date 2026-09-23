"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bike, 
  Car, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Printer, 
  MessageSquare, 
  FileText, 
  Key, 
  Gauge, 
  Fuel, 
  MapPin, 
  ArrowRight, 
  X,
  Sparkles,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

export interface RentalVehicle {
  id: string;
  name: string;
  type: "scooty" | "cruiser" | "touring" | "commuter";
  plateNumber: string;
  dailyRate: number;
  odometer: number;
  fuelLevel: "Full" | "75%" | "50%" | "25%" | "Reserve";
  status: "available" | "rented" | "maintenance";
  helmetsIncluded: number;
  currentBookingId?: string;
  image?: string;
}

export interface RentalBooking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  plateNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  dlNumber: string;
  aadhaarNumber?: string;
  startDate: string;
  startTime: string;
  expectedEndDate: string;
  expectedEndTime: string;
  actualEndDate?: string;
  startKm: number;
  endKm?: number;
  dailyRate: number;
  daysCount: number;
  totalRent: number;
  securityDeposit: number;
  depositType: "cash" | "upi" | "original_id";
  advancePaid: number;
  paymentMode: "cash" | "upi" | "card";
  helmetsGiven: number;
  status: "active" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
}

// Haridwar Fleet (Models right outside Haridwar Railway Station Gate 2)
const DEFAULT_FLEET: RentalVehicle[] = [
  {
    id: "veh-1",
    name: "Honda Activa 125 (Grey)",
    type: "scooty",
    plateNumber: "UK 08 AB 1122",
    dailyRate: 500,
    odometer: 14250,
    fuelLevel: "Full",
    status: "available",
    helmetsIncluded: 2,
    image: "/vehicles/honda-activa-125.png"
  },
  {
    id: "veh-2",
    name: "Suzuki Access 125 (Pearl White)",
    type: "scooty",
    plateNumber: "UK 08 CD 5566",
    dailyRate: 500,
    odometer: 11400,
    fuelLevel: "Full",
    status: "available",
    helmetsIncluded: 2,
    image: "/vehicles/suzuki-access-125.png"
  },
  {
    id: "veh-3",
    name: "Suzuki Burgman Street 125",
    type: "scooty",
    plateNumber: "UK 08 BC 3344",
    dailyRate: 600,
    odometer: 8900,
    fuelLevel: "Full",
    status: "available",
    helmetsIncluded: 2,
    image: "/vehicles/suzuki-burgman-125.png"
  },
  {
    id: "veh-4",
    name: "Royal Enfield Classic 350 (Stealth Black)",
    type: "cruiser",
    plateNumber: "UK 08 DE 7788",
    dailyRate: 1200,
    odometer: 21300,
    fuelLevel: "Full",
    status: "available",
    helmetsIncluded: 2,
    image: "/vehicles/royal-enfield-classic-350.png"
  },
  {
    id: "veh-5",
    name: "Royal Enfield Hunter 350 (Dapper Ash)",
    type: "cruiser",
    plateNumber: "UK 08 FG 2233",
    dailyRate: 1100,
    odometer: 7800,
    fuelLevel: "Full",
    status: "available",
    helmetsIncluded: 2,
    image: "/vehicles/royal-enfield-hunter-350.png"
  },
  {
    id: "veh-6",
    name: "Royal Enfield Meteor 350 (Fireball Yellow)",
    type: "cruiser",
    plateNumber: "UK 08 KL 6677",
    dailyRate: 1300,
    odometer: 12100,
    fuelLevel: "Full",
    status: "available",
    helmetsIncluded: 2,
    image: "/vehicles/royal-enfield-meteor-350.png"
  },
  {
    id: "veh-7",
    name: "Royal Enfield Himalayan 450 (Kamet White)",
    type: "touring",
    plateNumber: "UK 08 EF 9900",
    dailyRate: 1600,
    odometer: 6400,
    fuelLevel: "Full",
    status: "available",
    helmetsIncluded: 2,
    image: "/vehicles/royal-enfield-himalayan-450.png"
  },
  {
    id: "veh-8",
    name: "Hero XPulse 200 4V (Trail Edition)",
    type: "touring",
    plateNumber: "UK 08 MN 8899",
    dailyRate: 1000,
    odometer: 15300,
    fuelLevel: "Full",
    status: "available",
    helmetsIncluded: 2,
    image: "/vehicles/hero-xpulse-200.png"
  },
  {
    id: "veh-9",
    name: "TVS Apache RTR 160 4V (Racing Blue)",
    type: "commuter",
    plateNumber: "UK 08 GH 4455",
    dailyRate: 800,
    odometer: 18400,
    fuelLevel: "75%",
    status: "available",
    helmetsIncluded: 2,
    image: "/vehicles/apache-rtr-160-4v.png"
  },
  {
    id: "veh-10",
    name: "Bajaj Avenger Cruise 160 (Auburn Black)",
    type: "cruiser",
    plateNumber: "UK 08 PQ 1234",
    dailyRate: 800,
    odometer: 19600,
    fuelLevel: "Full",
    status: "available",
    helmetsIncluded: 2,
    image: "/vehicles/bajaj-avenger-160.png"
  }
];

export default function TwoWheelerRentalsPage() {
  const [fleet, setFleet] = useState<RentalVehicle[]>([]);
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [activeTab, setActiveTab] = useState<"bookings" | "fleet" | "rates">("bookings");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBookingForReturn, setSelectedBookingForReturn] = useState<RentalBooking | null>(null);
  const [viewAgreementBooking, setViewAgreementBooking] = useState<RentalBooking | null>(null);

  // New Vehicle Form State
  const [newVehicle, setNewVehicle] = useState<{
    name: string;
    type: "scooty" | "cruiser" | "touring" | "commuter";
    plateNumber: string;
    dailyRate: number;
    odometer: number;
    fuelLevel: "Full" | "75%" | "50%" | "25%" | "Reserve";
    image: string;
  }>({
    name: "",
    type: "scooty",
    plateNumber: "UK 08 ",
    dailyRate: 500,
    odometer: 5000,
    fuelLevel: "Full",
    image: "/vehicles/honda-activa-125.png"
  });

  // New Booking Form State
  const [newBooking, setNewBooking] = useState<{
    vehicleId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    dlNumber: string;
    aadhaarNumber: string;
    startDate: string;
    startTime: string;
    expectedEndDate: string;
    expectedEndTime: string;
    startKm: number;
    dailyRate: number;
    daysCount: number;
    securityDeposit: number;
    depositType: "cash" | "upi" | "original_id";
    advancePaid: number;
    paymentMode: "cash" | "upi" | "card";
    helmetsGiven: number;
    notes: string;
  }>({
    vehicleId: "",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    dlNumber: "",
    aadhaarNumber: "",
    startDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    expectedEndDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    expectedEndTime: "21:00",
    startKm: 0,
    dailyRate: 500,
    daysCount: 1,
    securityDeposit: 1000,
    depositType: "cash",
    advancePaid: 500,
    paymentMode: "upi",
    helmetsGiven: 2,
    notes: "Local Rishikesh / Haridwar Darshan"
  });

  // Return Inspection Form
  const [returnKm, setReturnKm] = useState<number>(0);
  const [returnFuel, setReturnFuel] = useState<string>("Full");
  const [damageCharge, setDamageCharge] = useState<number>(0);
  const [extraHoursCharge, setExtraHoursCharge] = useState<number>(0);
  const [depositRefunded, setDepositRefunded] = useState<number>(0);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedFleet = localStorage.getItem("traymbhkam_rental_fleet");
      if (savedFleet) {
        const parsed: RentalVehicle[] = JSON.parse(savedFleet);
        // If stored fleet has no images or fewer than 10 vehicles, update with new default fleet
        const hasImages = parsed.some(v => v.image);
        if (!hasImages || parsed.length < DEFAULT_FLEET.length) {
          setFleet(DEFAULT_FLEET);
          localStorage.setItem("traymbhkam_rental_fleet", JSON.stringify(DEFAULT_FLEET));
        } else {
          setFleet(parsed);
        }
      } else {
        setFleet(DEFAULT_FLEET);
        localStorage.setItem("traymbhkam_rental_fleet", JSON.stringify(DEFAULT_FLEET));
      }

      const savedBookings = localStorage.getItem("traymbhkam_rental_bookings");
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      }
    } catch (e) {
      setFleet(DEFAULT_FLEET);
    }
  }, []);

  // Save Fleet
  const saveFleet = (newFleet: RentalVehicle[]) => {
    setFleet(newFleet);
    localStorage.setItem("traymbhkam_rental_fleet", JSON.stringify(newFleet));
  };

  // Save Bookings
  const saveBookings = (newBookings: RentalBooking[]) => {
    setBookings(newBookings);
    localStorage.setItem("traymbhkam_rental_bookings", JSON.stringify(newBookings));
  };

  // Open New Booking for specific vehicle
  const handleStartBooking = (vId?: string) => {
    const targetVeh = vId ? fleet.find(f => f.id === vId) : fleet.find(f => f.status === "available");
    if (targetVeh) {
      setNewBooking(prev => ({
        ...prev,
        vehicleId: targetVeh.id,
        dailyRate: targetVeh.dailyRate,
        startKm: targetVeh.odometer,
        securityDeposit: targetVeh.type === "scooty" ? 1000 : 2000,
        advancePaid: targetVeh.dailyRate
      }));
    }
    setShowNewBookingModal(true);
  };

  // Create Booking Submit
  const handleCreateBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedVeh = fleet.find(f => f.id === newBooking.vehicleId);
    if (!selectedVeh) return;

    const bookingId = `TRV-RENT-${Date.now().toString().slice(-6)}`;
    const totalRent = newBooking.dailyRate * Math.max(1, newBooking.daysCount);

    const bookingEntry: RentalBooking = {
      id: bookingId,
      vehicleId: selectedVeh.id,
      vehicleName: selectedVeh.name,
      plateNumber: selectedVeh.plateNumber,
      customerName: newBooking.customerName,
      customerPhone: newBooking.customerPhone,
      customerAddress: newBooking.customerAddress,
      dlNumber: newBooking.dlNumber,
      aadhaarNumber: newBooking.aadhaarNumber,
      startDate: newBooking.startDate,
      startTime: newBooking.startTime,
      expectedEndDate: newBooking.expectedEndDate,
      expectedEndTime: newBooking.expectedEndTime,
      startKm: Number(newBooking.startKm) || selectedVeh.odometer,
      dailyRate: Number(newBooking.dailyRate),
      daysCount: Number(newBooking.daysCount),
      totalRent,
      securityDeposit: Number(newBooking.securityDeposit),
      depositType: newBooking.depositType,
      advancePaid: Number(newBooking.advancePaid),
      paymentMode: newBooking.paymentMode,
      helmetsGiven: Number(newBooking.helmetsGiven),
      status: "active",
      notes: newBooking.notes,
      createdAt: new Date().toISOString()
    };

    // Update vehicle status
    const updatedFleet = fleet.map(v => 
      v.id === selectedVeh.id 
        ? { ...v, status: "rented" as const, currentBookingId: bookingId } 
        : v
    );

    saveFleet(updatedFleet);
    saveBookings([bookingEntry, ...bookings]);
    setShowNewBookingModal(false);
    setViewAgreementBooking(bookingEntry);
  };

  // Add Vehicle Submit
  const handleCreateVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicleId = `veh-${Date.now().toString().slice(-4)}`;
    const vehicleEntry: RentalVehicle = {
      id: vehicleId,
      name: newVehicle.name,
      type: newVehicle.type,
      plateNumber: newVehicle.plateNumber.toUpperCase(),
      dailyRate: Number(newVehicle.dailyRate),
      odometer: Number(newVehicle.odometer),
      fuelLevel: newVehicle.fuelLevel,
      status: "available",
      helmetsIncluded: 2,
      image: newVehicle.image
    };
    saveFleet([vehicleEntry, ...fleet]);
    setShowAddVehicleModal(false);
    setNewVehicle({
      name: "",
      type: "scooty",
      plateNumber: "UK 08 ",
      dailyRate: 500,
      odometer: 5000,
      fuelLevel: "Full",
      image: "/vehicles/honda-activa-125.png"
    });
  };

  // Open Return Modal
  const handleOpenReturnModal = (b: RentalBooking) => {
    setSelectedBookingForReturn(b);
    setReturnKm(b.startKm + 50);
    setDamageCharge(0);
    setExtraHoursCharge(0);
    setDepositRefunded(b.securityDeposit);
    setShowReturnModal(true);
  };

  // Complete Return Submit
  const handleProcessReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReturn) return;

    const b = selectedBookingForReturn;
    const updatedBookings = bookings.map(item => 
      item.id === b.id 
        ? {
            ...item,
            status: "completed" as const,
            actualEndDate: new Date().toLocaleDateString("en-GB"),
            endKm: returnKm,
            notes: (item.notes ? item.notes + " | " : "") + `Returned at ${returnKm} KM. Deposit refunded: ₹${depositRefunded}. Damage: ₹${damageCharge}.`
          }
        : item
    );

    const updatedFleet = fleet.map(v => 
      v.id === b.vehicleId 
        ? { 
            ...v, 
            status: "available" as const, 
            odometer: Math.max(v.odometer, returnKm),
            fuelLevel: returnFuel as any,
            currentBookingId: undefined 
          } 
        : v
    );

    saveBookings(updatedBookings);
    saveFleet(updatedFleet);
    setShowReturnModal(false);
    setSelectedBookingForReturn(null);
  };

  // Instant WhatsApp message builder
  const handleSendWhatsAppSlip = (b: RentalBooking) => {
    const cleanPhone = b.customerPhone.replace(/\D/g, "");
    const waPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    
    const text = 
      `*🛵 TWO-WHEELER RENTAL CONFIRMATION - TRAYMBHKAM TRAVELS*\n\n` +
      `Namaste ${b.customerName} ji! Warm greetings from *Traymbhkam Tour & Travels, Haridwar*.\n\n` +
      `Your two-wheeler rental booking has been successfully issued:\n` +
      `• *Booking ID:* ${b.id}\n` +
      `• *Vehicle:* ${b.vehicleName}\n` +
      `• *Registration Plate:* ${b.plateNumber}\n` +
      `• *Pickup Date & Time:* ${b.startDate} (${b.startTime})\n` +
      `• *Drop-off Expected:* ${b.expectedEndDate} (${b.expectedEndTime})\n` +
      `• *Odometer Start:* ${b.startKm} KM\n` +
      `• *Helmets Provided:* ${b.helmetsGiven} Nos (Mandatory on Uttarakhand roads)\n` +
      `• *Security Deposit Held:* ₹${b.securityDeposit} (${b.depositType.toUpperCase()})\n` +
      `• *Rent Charged:* ₹${b.totalRent} (${b.daysCount} Day(s))\n\n` +
      `📍 *Pickup / Return Location:*\n` +
      `Traymbhkam Tour & Travels, Purusharthi Market, Opp. Railway Station Gate No. 2, Near Bus Stand, Haridwar\n\n` +
      `📞 *24x7 Roadside & Rental Helpline:* +91 82660 16066 (Mr. Gagandeep)\n\n` +
      `_Safe riding in Devbhoomi Uttarakhand! Please wear your helmet at all times._ 🙏`;

    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Fleet Counts
  const totalFleetCount = fleet.length;
  const onRentCount = fleet.filter(v => v.status === "rented").length;
  const availableCount = fleet.filter(v => v.status === "available").length;
  const activeDepositsTotal = bookings
    .filter(b => b.status === "active")
    .reduce((sum, b) => sum + (Number(b.securityDeposit) || 0), 0);
  const totalRevenueToday = bookings
    .reduce((sum, b) => sum + (Number(b.totalRent) || 0), 0);

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.customerName.toLowerCase().includes(q) || 
             b.customerPhone.includes(q) || 
             b.plateNumber.toLowerCase().includes(q) ||
             b.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* ========================================================================= */}
      {/* 1. LUXURY HEADER BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 uppercase tracking-wider text-[10px]">
              Haridwar Fleet Desk
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">Opp. Railway Station Gate 2</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Bike className="text-amber-600" size={24} />
            Two-Wheeler Rental Management Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Scooty, Royal Enfield Cruiser &amp; Touring Bike Fleet &bull; Booking Slips &bull; Check-in &amp; Odometer Tracker
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleStartBooking()}
            disabled={availableCount === 0}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs shadow-sm transition cursor-pointer ${
              availableCount > 0
                ? "bg-[#0b1320] hover:bg-[#16233b] text-white border border-slate-800"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Plus size={14} className="text-amber-400" />
            <span>+ New Rental Issue</span>
          </button>

          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-xs shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition cursor-pointer"
          >
            <Key size={14} className="text-slate-500" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REFINED KPI METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Total Fleet */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Fleet</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Bike size={15} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{totalFleetCount}</p>
          <p className="text-[10.5px] text-slate-500 mt-1">Bikes &amp; Scooties Registered</p>
        </div>

        {/* On Road / Rented */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On Road (Rented)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={15} />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700 tracking-tight">{onRentCount}</p>
          <p className="text-[10.5px] text-slate-500 mt-1">Currently Out with Tourists</p>
        </div>

        {/* Available at Hub */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ready at Hub</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 tracking-tight">{availableCount}</p>
          <p className="text-[10.5px] text-emerald-700 font-medium mt-1">Available for Walk-ins</p>
        </div>

        {/* Deposits Held */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security Deposit Held</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShieldCheck size={15} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">₹{activeDepositsTotal.toLocaleString("en-IN")}</p>
          <p className="text-[10.5px] text-slate-500 mt-1">Refundable on Return</p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. TABS NAVIGATION */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "bookings"
                ? "bg-[#0b1320] text-amber-300 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Rental Issues &amp; Check-in Desk ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "fleet"
                ? "bg-[#0b1320] text-amber-300 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Fleet Inventory ({fleet.length})
          </button>
          <button
            onClick={() => setActiveTab("rates")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "rates"
                ? "bg-[#0b1320] text-amber-300 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Haridwar Rates &amp; Policy
          </button>
        </div>

        {activeTab === "bookings" && (
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, DL, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200/80 bg-white focus:outline-none focus:border-amber-400"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. TAB 1: RENTAL BOOKINGS LIST */}
      {/* ========================================================================= */}
      {activeTab === "bookings" && (
        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200/70 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Bike size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Rental Bookings Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Issue your first bike or scooty to a tourist arriving at Haridwar. Collect DL, security deposit, and generate an instant WhatsApp receipt.
              </p>
              <button
                onClick={() => handleStartBooking()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b1320] hover:bg-[#16233b] text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Plus size={14} className="text-amber-400" />
                Issue First Rental
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredBookings.map((b) => {
                const isActive = b.status === "active";
                return (
                  <div
                    key={b.id}
                    className={`bg-white rounded-xl p-4 border transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isActive ? "border-amber-300/80 bg-amber-50/10" : "border-slate-200/70"
                    }`}
                  >
                    {/* Left: Customer & Vehicle Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10.5px] font-bold text-slate-500">
                          {b.id}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isActive 
                            ? "bg-amber-100 text-amber-800 border border-amber-300/80" 
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {isActive ? "● On Road / Active" : "✓ Returned"}
                        </span>
                        <span className="text-[11px] text-slate-400">&bull;</span>
                        <span className="text-xs font-semibold text-slate-600">
                          {b.daysCount} Day(s)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{b.customerName}</h3>
                        <a 
                          href={`tel:${b.customerPhone}`}
                          className="text-xs text-amber-700 font-mono font-semibold hover:underline flex items-center gap-1"
                        >
                          <Phone size={12} /> {b.customerPhone}
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Bike size={13} className="text-amber-600" />
                          {b.vehicleName} ({b.plateNumber})
                        </span>
                        <span>&bull;</span>
                        <span>DL: <strong className="text-slate-700">{b.dlNumber || "Verified"}</strong></span>
                        <span>&bull;</span>
                        <span>Start: <strong>{b.startKm} KM</strong></span>
                        {b.endKm && (
                          <span>&bull; Return: <strong>{b.endKm} KM</strong> ({b.endKm - b.startKm} KM driven)</span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Pickup: {b.startDate} {b.startTime}</span>
                        <span>&rarr;</span>
                        <span>Drop Expected: {b.expectedEndDate} {b.expectedEndTime}</span>
                      </div>
                    </div>

                    {/* Right: Financials & Action Triggers */}
                    <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <div className="text-xs font-bold text-slate-900">
                          Rent: ₹{b.totalRent} <span className="text-[10px] text-slate-400">(@ ₹{b.dailyRate}/day)</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Deposit: <strong className="text-amber-700">₹{b.securityDeposit}</strong> ({b.depositType.toUpperCase()})
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive && (
                          <button
                            onClick={() => handleOpenReturnModal(b)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <CheckCircle2 size={13} />
                            <span>Check-in Return</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleSendWhatsAppSlip(b)}
                          title="Send WhatsApp Booking Slip"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          <MessageSquare size={13} />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>

                        <button
                          onClick={() => setViewAgreementBooking(b)}
                          title="Print Rental Agreement"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                        >
                          <Printer size={13} />
                          <span className="hidden sm:inline">Slip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 2: FLEET VEHICLES INVENTORY */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 5. TAB 2: FLEET VEHICLES INVENTORY */}
      {/* ========================================================================= */}
      {activeTab === "fleet" && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All Fleet", count: fleet.length },
                { id: "scooty", label: "Scooty (110-125cc)", count: fleet.filter(v => v.type === "scooty").length },
                { id: "cruiser", label: "Royal Enfield & Cruisers", count: fleet.filter(v => v.type === "cruiser").length },
                { id: "touring", label: "Adventure & Touring", count: fleet.filter(v => v.type === "touring").length },
                { id: "commuter", label: "Commuters & Sports", count: fleet.filter(v => v.type === "commuter").length },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterType(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    filterType === cat.id
                      ? "bg-[#0b1320] text-amber-300 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterType === cat.id ? "bg-amber-400/20 text-amber-300" : "bg-slate-200/70 text-slate-600"
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Plus size={13} />
              <span>Add Vehicle</span>
            </button>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {fleet
              .filter(v => filterType === "all" || v.type === filterType)
              .map((v) => {
                const isAvailable = v.status === "available";
                const isRented = v.status === "rented";

                return (
                  <div 
                    key={v.id} 
                    className="luxury-card bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between group transition-all duration-300"
                  >
                    <div>
                      {/* Vehicle Studio Image Container */}
                      <div className="relative h-44 w-full bg-gradient-to-b from-slate-50 via-slate-100/50 to-amber-50/10 p-3 flex items-center justify-center border-b border-slate-100 overflow-hidden">
                        {/* Status Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/90 backdrop-blur-xs text-slate-700 shadow-2xs border border-slate-200/60">
                            {v.type}
                          </span>
                          <span className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs shadow-2xs ${
                            isAvailable 
                              ? "bg-emerald-500/90 text-white"
                              : isRented
                              ? "bg-amber-500/90 text-white"
                              : "bg-rose-500/90 text-white"
                          }`}>
                            {isAvailable ? "● Ready" : isRented ? "● On Road" : "Service"}
                          </span>
                        </div>

                        {/* Transparent PNG Cutout */}
                        {v.image ? (
                          <img
                            src={v.image}
                            alt={v.name}
                            className="max-h-36 max-w-[90%] object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Bike size={32} />
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                              {v.name}
                            </h3>
                            <div className="inline-block mt-1 font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {v.plateNumber}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 block font-medium">Daily Tariff</span>
                            <span className="text-base font-black text-slate-900 tracking-tight">₹{v.dailyRate}</span>
                            <span className="text-[10px] text-slate-500">/day</span>
                          </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                          <div className="bg-slate-50/70 p-1.5 rounded-lg border border-slate-100">
                            <span className="text-[9.5px] text-slate-400 block">Odometer</span>
                            <span className="font-bold text-slate-800 text-[11px]">{v.odometer.toLocaleString("en-IN")} KM</span>
                          </div>
                          <div className="bg-slate-50/70 p-1.5 rounded-lg border border-slate-100">
                            <span className="text-[9.5px] text-slate-400 block">Fuel Level</span>
                            <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                              <Fuel size={11} className="text-amber-600" /> {v.fuelLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                        <ShieldCheck size={12} className="text-emerald-600" /> {v.helmetsIncluded || 2} Helmets Incl.
                      </span>

                      {isAvailable ? (
                        <button
                          onClick={() => handleStartBooking(v.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#0b1320] hover:bg-[#16233b] text-amber-300 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <span>Issue Rent</span>
                          <ArrowRight size={12} />
                        </button>
                      ) : isRented ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Active on Road
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Under Service</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 3: HARIDWAR RATES & RENTAL GUIDELINES */}
      {/* ========================================================================= */}
      {activeTab === "rates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Rate Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/70 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Key size={16} className="text-amber-600" /> Standard Haridwar Rental Tariff Card
            </h2>
            <p className="text-xs text-slate-500">Competitive tariff for Haridwar Station Gate 2 tourist footfall</p>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Honda Activa 6G / TVS Jupiter</p>
                  <p className="text-[10.5px] text-slate-400">110cc-125cc Automatic Scooty &bull; Local &amp; Rishikesh</p>
                </div>
                <span className="font-bold text-slate-900 text-sm">₹500 / 24 hrs</span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Royal Enfield Classic 350</p>
                  <p className="text-[10.5px] text-slate-400">Reborn 350cc Cruiser &bull; Rishikesh / Mussoorie / Hills</p>
                </div>
                <span className="font-bold text-slate-900 text-sm">₹1,200 / 24 hrs</span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Royal Enfield Himalayan 411</p>
                  <p className="text-[10.5px] text-slate-400">Adventure Touring &bull; Chardham Circuit &amp; Chopta</p>
                </div>
                <span className="font-bold text-slate-900 text-sm">₹1,500 / 24 hrs</span>
              </div>

              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Bajaj Pulsar 150 / FZ</p>
                  <p className="text-[10.5px] text-slate-400">150cc Sports Commuter</p>
                </div>
                <span className="font-bold text-slate-900 text-sm">₹700 / 24 hrs</span>
              </div>
            </div>
          </div>

          {/* Legal Terms & Mandatory Rules */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/70 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" /> Mandatory Rental Terms (Uttarakhand RTA)
            </h2>
            <p className="text-xs text-slate-500">Requirements to protect vehicle safety and client liability</p>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Original Driving License (DL) &amp; Aadhaar Card</strong> must be verified prior to vehicle handover.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Helmet Mandatory:</strong> Two ISI-approved helmets provided with each rental. Rider and pillion must wear them at all times.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Hill Speed Limit (40 km/h):</strong> Strictly obey mountain traffic speed limits between Haridwar, Rishikesh, and Devprayag.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Security Deposit:</strong> ₹1,000 for Scooty, ₹2,000 for Royal Enfield held until return inspection.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Fuel Policy:</strong> Same to same return. Any fuel shortfall adjusted against deposit.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: CREATE NEW RENTAL BOOKING */}
      {/* ========================================================================= */}
      {showNewBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl border border-slate-200 shadow-2xl overflow-hidden my-auto">
            <div className="p-4 bg-[#0b1320] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-amber-300">Issue Two-Wheeler Rental</h3>
                <p className="text-[10px] text-slate-400">Traymbhkam Tour &amp; Travels &bull; Haridwar Station Desk</p>
              </div>
              <button 
                onClick={() => setShowNewBookingModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBookingSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Vehicle Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Select Available Vehicle *</label>
                <select
                  required
                  value={newBooking.vehicleId}
                  onChange={(e) => {
                    const selected = fleet.find(f => f.id === e.target.value);
                    if (selected) {
                      setNewBooking(prev => ({
                        ...prev,
                        vehicleId: selected.id,
                        dailyRate: selected.dailyRate,
                        startKm: selected.odometer,
                        securityDeposit: selected.type === "scooty" ? 1000 : 2000,
                        advancePaid: selected.dailyRate
                      }));
                    }
                  }}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">-- Choose a Vehicle --</option>
                  {fleet.filter(f => f.status === "available" || f.id === newBooking.vehicleId).map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.plateNumber}) - ₹{v.dailyRate}/day [Odo: {v.odometer} KM]
                    </option>
                  ))}
                </select>

                {(() => {
                  const selected = fleet.find(f => f.id === newBooking.vehicleId);
                  if (!selected) return null;
                  return (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50/60 to-slate-50 rounded-xl border border-amber-200/70 mt-2">
                      {selected.image ? (
                        <img
                          src={selected.image}
                          alt={selected.name}
                          className="h-14 w-20 object-contain drop-shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Bike size={20} />
                        </div>
                      )}
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">{selected.name}</p>
                        <p className="font-mono text-slate-600 font-semibold">{selected.plateNumber}</p>
                        <p className="text-[11px] text-amber-800 font-medium">
                          Tariff: ₹{selected.dailyRate}/day &bull; Odometer: {selected.odometer} KM &bull; Fuel: {selected.fuelLevel}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newBooking.customerName}
                    onChange={e => setNewBooking({ ...newBooking, customerName: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">WhatsApp Mobile No *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={newBooking.customerPhone}
                    onChange={e => setNewBooking({ ...newBooking, customerPhone: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              {/* Identity Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Driving License (DL) No *</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-0820210012345"
                    value={newBooking.dlNumber}
                    onChange={e => setNewBooking({ ...newBooking, dlNumber: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Aadhaar No (Optional)</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012"
                    value={newBooking.aadhaarNumber}
                    onChange={e => setNewBooking({ ...newBooking, aadhaarNumber: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Dates & Duration */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Pickup Date &amp; Time</label>
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      required
                      value={newBooking.startDate}
                      onChange={e => setNewBooking({ ...newBooking, startDate: e.target.value })}
                      className="w-full text-xs p-1.5 rounded border border-slate-200 bg-white"
                    />
                    <input
                      type="time"
                      value={newBooking.startTime}
                      onChange={e => setNewBooking({ ...newBooking, startTime: e.target.value })}
                      className="w-24 text-xs p-1.5 rounded border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Drop Date &amp; Time</label>
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      required
                      value={newBooking.expectedEndDate}
                      onChange={e => setNewBooking({ ...newBooking, expectedEndDate: e.target.value })}
                      className="w-full text-xs p-1.5 rounded border border-slate-200 bg-white"
                    />
                    <input
                      type="time"
                      value={newBooking.expectedEndTime}
                      onChange={e => setNewBooking({ ...newBooking, expectedEndTime: e.target.value })}
                      className="w-24 text-xs p-1.5 rounded border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Deposit */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Days Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBooking.daysCount}
                    onChange={e => setNewBooking({ ...newBooking, daysCount: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Daily Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={newBooking.dailyRate}
                    onChange={e => setNewBooking({ ...newBooking, dailyRate: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Total Rent (₹)</label>
                  <div className="text-xs font-bold text-slate-900 p-2 bg-slate-100 rounded-lg">
                    ₹{newBooking.dailyRate * Math.max(1, newBooking.daysCount)}
                  </div>
                </div>
              </div>

              {/* Security Deposit & Odometer */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Security Deposit (₹)</label>
                  <input
                    type="number"
                    required
                    value={newBooking.securityDeposit}
                    onChange={e => setNewBooking({ ...newBooking, securityDeposit: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Start Odometer (KM)</label>
                  <input
                    type="number"
                    required
                    value={newBooking.startKm}
                    onChange={e => setNewBooking({ ...newBooking, startKm: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Helmets Given</label>
                  <select
                    value={newBooking.helmetsGiven}
                    onChange={e => setNewBooking({ ...newBooking, helmetsGiven: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="1">1 Helmet</option>
                    <option value="2">2 Helmets</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0b1320] hover:bg-[#16233b] text-white font-semibold text-xs transition cursor-pointer"
                >
                  Confirm &amp; Issue Rental
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: PROCESS RETURN / CHECK-IN */}
      {/* ========================================================================= */}
      {showReturnModal && selectedBookingForReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-amber-300">Process Vehicle Check-in</h3>
                <p className="text-[10px] text-slate-400">{selectedBookingForReturn.vehicleName} ({selectedBookingForReturn.plateNumber})</p>
              </div>
              <button 
                onClick={() => setShowReturnModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProcessReturnSubmit} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1">
                <p><strong>Customer:</strong> {selectedBookingForReturn.customerName} ({selectedBookingForReturn.customerPhone})</p>
                <p><strong>Start Reading:</strong> {selectedBookingForReturn.startKm} KM</p>
                <p><strong>Security Deposit Held:</strong> ₹{selectedBookingForReturn.securityDeposit}</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Ending Odometer Reading (KM) *</label>
                <input
                  type="number"
                  required
                  min={selectedBookingForReturn.startKm}
                  value={returnKm}
                  onChange={e => setReturnKm(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
                <span className="text-[10px] text-slate-500">
                  Total Run: <strong>{returnKm - selectedBookingForReturn.startKm} KM</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Fuel Level on Return</label>
                  <select
                    value={returnFuel}
                    onChange={e => setReturnFuel(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Full">Full</option>
                    <option value="75%">75%</option>
                    <option value="50%">50%</option>
                    <option value="25%">25%</option>
                    <option value="Reserve">Reserve</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Damage / Fuel Penalty (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={damageCharge}
                    onChange={e => {
                      const dmg = Number(e.target.value);
                      setDamageCharge(dmg);
                      setDepositRefunded(Math.max(0, selectedBookingForReturn.securityDeposit - dmg));
                    }}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <label className="font-bold text-amber-900 block">Security Deposit to Refund (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={depositRefunded}
                  onChange={e => setDepositRefunded(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-amber-300 bg-white font-bold text-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer"
                >
                  Confirm Return &amp; Release Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: PRINTABLE RENTAL SLIP / AGREEMENT */}
      {/* ========================================================================= */}
      {viewAgreementBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <span className="text-xs font-bold text-amber-300">Official Two-Wheeler Rental Slip</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  onClick={() => setViewAgreementBooking(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Slip Content */}
            <div className="p-6 sm:p-8 space-y-5 text-slate-800 text-xs font-sans">
              {/* Slip Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Traymbhkam Travels" className="h-12 w-auto object-contain" />
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight">TRAYMBHKAM TOUR &amp; TRAVELS</h2>
                    <p className="text-[10px] font-semibold text-amber-700">TWO-WHEELER RENTAL DESK &bull; HARIDWAR</p>
                    <p className="text-[9px] text-slate-500">Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-slate-900">{viewAgreementBooking.id}</div>
                  <div className="text-[9px] text-slate-400">Date: {viewAgreementBooking.startDate}</div>
                  <div className="text-[9px] text-emerald-700 font-bold">UTDB Reg: UTTR/HARIDWAR/08-2022/004983</div>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Customer Details</div>
                  <div className="font-bold text-slate-900">{viewAgreementBooking.customerName}</div>
                  <div>Phone: <strong>{viewAgreementBooking.customerPhone}</strong></div>
                  <div>DL No: <strong className="font-mono">{viewAgreementBooking.dlNumber}</strong></div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Allocated</div>
                  <div className="font-bold text-slate-900">{viewAgreementBooking.vehicleName}</div>
                  <div>Reg Plate: <strong className="font-mono text-amber-800">{viewAgreementBooking.plateNumber}</strong></div>
                  <div>Start Odometer: <strong>{viewAgreementBooking.startKm} KM</strong></div>
                  <div>Helmets Provided: <strong>{viewAgreementBooking.helmetsGiven} Nos</strong></div>
                </div>
              </div>

              {/* Rental Schedule & Commercials */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-2">Description</th>
                      <th className="p-2">Duration / Period</th>
                      <th className="p-2">Rate</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-semibold">{viewAgreementBooking.vehicleName} Rental</td>
                      <td className="p-2">{viewAgreementBooking.startDate} ({viewAgreementBooking.startTime}) to {viewAgreementBooking.expectedEndDate} ({viewAgreementBooking.expectedEndTime})</td>
                      <td className="p-2">₹{viewAgreementBooking.dailyRate}/day</td>
                      <td className="p-2 text-right font-bold">₹{viewAgreementBooking.totalRent}</td>
                    </tr>
                    <tr className="bg-amber-50/50">
                      <td className="p-2 font-semibold text-amber-900" colSpan={3}>Refundable Security Deposit Held</td>
                      <td className="p-2 text-right font-bold text-amber-900">₹{viewAgreementBooking.securityDeposit}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms & Conditions Snippet */}
              <div className="p-3 bg-slate-50 rounded text-[9px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">Rental Agreement Terms:</p>
                <p>1. The hirer accepts vehicle in roadworthy condition and agrees to return with same fuel level.</p>
                <p>2. Helmet is mandatory for rider and pillion under Uttarakhand Motor Vehicles Act.</p>
                <p>3. In case of damage, challans, or mechanical breakdown due to negligence, charges will be deducted from security deposit.</p>
                <p>4. Helpline for emergency support: +91 82660 16066 (Mr. Gagandeep).</p>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between items-center text-xs">
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <span className="text-[10px] font-semibold text-slate-600">Customer Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <span className="text-[10px] font-semibold text-slate-600">For Traymbhkam Travels</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. MODAL: ADD NEW VEHICLE TO FLEET */}
      {/* ========================================================================= */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden my-auto animate-fade-in">
            <div className="p-4 bg-[#0b1320] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Key size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">Add Vehicle to Haridwar Fleet</h3>
                  <p className="text-[10px] text-slate-400">Traymbhkam Tour &amp; Travels &bull; Fleet Registry</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddVehicleModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVehicleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Vehicle Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Vehicle Model &amp; Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Enfield Classic 350"
                    value={newVehicle.name}
                    onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category / Type *</label>
                  <select
                    value={newVehicle.type}
                    onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value as any })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="scooty">Scooty (Automatic 110-125cc)</option>
                    <option value="cruiser">Royal Enfield / Cruiser</option>
                    <option value="touring">Adventure / Touring</option>
                    <option value="commuter">Commuter / Sports Bike</option>
                  </select>
                </div>
              </div>

              {/* Registration Plate & Daily Tariff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Registration Plate *</label>
                  <input
                    type="text"
                    required
                    placeholder="UK 08 AB 1234"
                    value={newVehicle.plateNumber}
                    onChange={e => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono uppercase bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Daily Tariff Rate (₹/day) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="500"
                    value={newVehicle.dailyRate}
                    onChange={e => setNewVehicle({ ...newVehicle, dailyRate: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Odometer & Fuel Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Current Odometer (KM) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="12000"
                    value={newVehicle.odometer}
                    onChange={e => setNewVehicle({ ...newVehicle, odometer: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Fuel Level</label>
                  <select
                    value={newVehicle.fuelLevel}
                    onChange={e => setNewVehicle({ ...newVehicle, fuelLevel: e.target.value as any })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Full">Full</option>
                    <option value="75%">75%</option>
                    <option value="50%">50%</option>
                    <option value="25%">25%</option>
                    <option value="Reserve">Reserve</option>
                  </select>
                </div>
              </div>

              {/* Choose Vehicle Photo / Cutout */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block">
                  Select Studio Cutout Photo (Background-Free)
                </label>
                
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: "Activa 125", img: "/vehicles/honda-activa-125.png" },
                    { label: "Access 125", img: "/vehicles/suzuki-access-125.png" },
                    { label: "Burgman", img: "/vehicles/suzuki-burgman-125.png" },
                    { label: "Classic 350", img: "/vehicles/royal-enfield-classic-350.png" },
                    { label: "Hunter 350", img: "/vehicles/royal-enfield-hunter-350.png" },
                    { label: "Meteor 350", img: "/vehicles/royal-enfield-meteor-350.png" },
                    { label: "Himalayan 450", img: "/vehicles/royal-enfield-himalayan-450.png" },
                    { label: "Hero XPulse", img: "/vehicles/hero-xpulse-200.png" },
                    { label: "Apache RTR", img: "/vehicles/apache-rtr-160-4v.png" },
                    { label: "Avenger 160", img: "/vehicles/bajaj-avenger-160.png" },
                  ].map((preset) => {
                    const isSelected = newVehicle.image === preset.img;
                    return (
                      <button
                        type="button"
                        key={preset.img}
                        onClick={() => setNewVehicle({ ...newVehicle, image: preset.img })}
                        className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer text-center ${
                          isSelected
                            ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/30"
                            : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300"
                        }`}
                      >
                        <img src={preset.img} alt={preset.label} className="h-10 w-full object-contain" />
                        <span className="text-[9px] font-medium text-slate-700 line-clamp-1">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Preview Showcase */}
                {newVehicle.image && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50/50 via-slate-50 to-white rounded-xl border border-amber-200/60 mt-2">
                    <img src={newVehicle.image} alt="Preview" className="h-16 w-24 object-contain drop-shadow-md" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{newVehicle.name || "New Vehicle Preview"}</p>
                      <p className="text-[11px] text-amber-800 font-mono font-bold">{newVehicle.plateNumber || "UK 08 ..."}</p>
                      <p className="text-[10px] text-slate-500">Daily: ₹{newVehicle.dailyRate} &bull; Type: {newVehicle.type}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit / Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0b1320] hover:bg-[#16233b] text-amber-300 hover:text-white font-semibold text-xs transition cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Save Vehicle to Fleet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
