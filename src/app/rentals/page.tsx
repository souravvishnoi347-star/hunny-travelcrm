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
  ChevronDown,
  Pencil,
  Trash2,
  Upload,
  TrendingUp,
  DollarSign,
  Download,
  CalendarDays,
  Filter,
  BarChart3,
  AlertTriangle,
  Send,
  BellRing,
  Check,
  PhoneCall,
  PhoneForwarded,
  PhoneOutgoing
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
  callReminderDate?: string;
  callReminderTime?: string;
  callReminderNote?: string;
  callReminderStatus?: "pending" | "done";
  lastCalledAt?: string;
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
  const [activeTab, setActiveTab] = useState<"bookings" | "followup" | "reports" | "fleet" | "rates">("bookings");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Follow-up & Reports State
  const [followupFilter, setFollowupFilter] = useState<"all" | "due_today" | "overdue" | "calls_due">("all");
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendingBooking, setExtendingBooking] = useState<RentalBooking | null>(null);
  const [extendDays, setExtendDays] = useState<number>(1);
  const [extendExtraRent, setExtendExtraRent] = useState<number>(0);

  // Call Reminder State
  const [showCallReminderModal, setShowCallReminderModal] = useState(false);
  const [selectedBookingForCall, setSelectedBookingForCall] = useState<RentalBooking | null>(null);
  const [callReminderDate, setCallReminderDate] = useState<string>("");
  const [callReminderTime, setCallReminderTime] = useState<string>("17:00");
  const [callReminderNote, setCallReminderNote] = useState<string>("");

  // Revenue Report Range State
  const [reportRange, setReportRange] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [reportStartDate, setReportStartDate] = useState<string>(
    new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]
  );
  const [reportEndDate, setReportEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Modals
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<RentalVehicle | null>(null);
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

  // Open Edit Vehicle Modal
  const handleOpenEditVehicle = (veh: RentalVehicle) => {
    setEditingVehicle({ ...veh });
    setShowEditVehicleModal(true);
  };

  // Save Edited Vehicle Submit
  const handleSaveEditVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    const updatedFleet = fleet.map(v => 
      v.id === editingVehicle.id 
        ? {
            ...editingVehicle,
            plateNumber: editingVehicle.plateNumber.toUpperCase(),
            dailyRate: Number(editingVehicle.dailyRate),
            odometer: Number(editingVehicle.odometer),
            helmetsIncluded: Number(editingVehicle.helmetsIncluded || 2)
          } 
        : v
    );
    saveFleet(updatedFleet);
    setShowEditVehicleModal(false);
    setEditingVehicle(null);
  };

  // Delete Vehicle from Fleet
  const handleDeleteVehicle = (vehId: string) => {
    if (confirm("Are you sure you want to remove this vehicle from the fleet?")) {
      const updatedFleet = fleet.filter(v => v.id !== vehId);
      saveFleet(updatedFleet);
      setShowEditVehicleModal(false);
      setEditingVehicle(null);
    }
  };

  // Vehicle Photo Upload (File -> Base64 Data URL)
  const handleVehiclePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (isEdit && editingVehicle) {
        setEditingVehicle(prev => prev ? { ...prev, image: result } : null);
      } else {
        setNewVehicle(prev => ({ ...prev, image: result }));
      }
    };
    reader.readAsDataURL(file);
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

  // ----------------------------------------------------
  // FOLLOW-UP & OVERDUE TRACKING HELPERS
  // ----------------------------------------------------
  const todayStr = new Date().toISOString().split("T")[0];
  const activeBookings = bookings.filter(b => b.status === "active");

  const dueTodayBookings = activeBookings.filter(b => b.expectedEndDate === todayStr);
  const overdueBookings = activeBookings.filter(b => {
    const end = new Date(`${b.expectedEndDate}T${b.expectedEndTime || "21:00"}`);
    return new Date() > end;
  });

  // Call Reminders Tracking
  const callRemindersList = activeBookings.filter(b => b.callReminderDate && b.callReminderStatus !== "done");
  const dueTodayCalls = callRemindersList.filter(b => b.callReminderDate === todayStr);
  const overdueCalls = callRemindersList.filter(b => b.callReminderDate && b.callReminderDate < todayStr);

  const filteredFollowupBookings = activeBookings.filter(b => {
    if (followupFilter === "due_today") {
      return b.expectedEndDate === todayStr;
    }
    if (followupFilter === "overdue") {
      const end = new Date(`${b.expectedEndDate}T${b.expectedEndTime || "21:00"}`);
      return new Date() > end;
    }
    if (followupFilter === "calls_due") {
      return b.callReminderDate && b.callReminderStatus !== "done";
    }
    return true;
  }).filter(b => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.customerName.toLowerCase().includes(q) || 
             b.customerPhone.includes(q) || 
             b.plateNumber.toLowerCase().includes(q) ||
             b.vehicleName.toLowerCase().includes(q) ||
             b.id.toLowerCase().includes(q);
    }
    return true;
  });

  // Follow-up WhatsApp Sender
  const handleSendFollowUpWhatsApp = (b: RentalBooking, type: "reminder" | "overdue" | "checkin") => {
    const cleanPhone = b.customerPhone.replace(/\D/g, "");
    const waPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    let text = "";

    if (type === "overdue") {
      text = 
        `*🚨 URGENT RENTAL RETURN REMINDER - TRAYMBHKAM TRAVELS HARIDWAR*\n\n` +
        `Namaste ${b.customerName} ji!\n` +
        `Aapki vehicle *${b.vehicleName}* (${b.plateNumber}) ka scheduled return time *${b.expectedEndDate} (${b.expectedEndTime})* tha, jo abhi overdue show kar raha hai.\n\n` +
        `📍 *Return Hub:* Opp. Railway Station Gate No. 2, Haridwar\n` +
        `Kripya turant vehicle return karein ya agar aap rental extend karana chahte hain toh hume call karein.\n\n` +
        `📞 *24x7 Haridwar Rental Helpline:* +91 82660 16066 (Mr. Gagandeep)`;
    } else if (type === "reminder") {
      text = 
        `*⚠️ RENTAL RETURN DUE TODAY - TRAYMBHKAM TRAVELS HARIDWAR*\n\n` +
        `Namaste ${b.customerName} ji!\n` +
        `Aapki rental vehicle *${b.vehicleName}* (${b.plateNumber}) ka return aaj *${b.expectedEndDate}* ko sham *${b.expectedEndTime}* baje scheduled hai.\n\n` +
        `📍 *Return Hub:* Traymbhkam Tour & Travels, Opp. Railway Station Gate No. 2, Haridwar.\n` +
        `Agar aap yatra extend karna chahte hain toh kripya hume pehle hi message/call karein.\n\n` +
        `📞 *Helpline:* +91 82660 16066`;
    } else {
      text = 
        `*🛵 YATRA STATUS & FOLLOW-UP - TRAYMBHKAM TRAVELS*\n\n` +
        `Namaste ${b.customerName} ji! Kaisi chal rahi hai aapki yatra? Aapki rental vehicle *${b.vehicleName}* (${b.plateNumber}) ka scheduled return *${b.expectedEndDate} (${b.expectedEndTime})* ko hai.\n\n` +
        `Raste mai kisi bhi roadside support ya query ke liye hume contact karein.\n\n` +
        `📞 *Helpline:* +91 82660 16066`;
    }

    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Open Extension Modal
  const handleOpenExtendModal = (b: RentalBooking) => {
    setExtendingBooking(b);
    setExtendDays(1);
    setExtendExtraRent(b.dailyRate);
    setShowExtendModal(true);
  };

  // Submit Extension
  const handleExtendBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendingBooking) return;
    const addDays = Math.max(1, extendDays);
    const extraRent = extendExtraRent > 0 ? extendExtraRent : (extendingBooking.dailyRate * addDays);

    const prevEndDate = new Date(extendingBooking.expectedEndDate);
    const newEndDateObj = new Date(prevEndDate.getTime() + addDays * 86400000);
    const newExpectedEndDate = newEndDateObj.toISOString().split("T")[0];

    const updatedBookings = bookings.map(b => {
      if (b.id === extendingBooking.id) {
        return {
          ...b,
          daysCount: b.daysCount + addDays,
          expectedEndDate: newExpectedEndDate,
          totalRent: b.totalRent + extraRent,
          notes: `${b.notes ? b.notes + " | " : ""}Extended +${addDays} days (+₹${extraRent}) on ${new Date().toLocaleDateString("en-IN")}`
        };
      }
      return b;
    });

    saveBookings(updatedBookings);
    setShowExtendModal(false);
    setExtendingBooking(null);

    const cleanPhone = extendingBooking.customerPhone.replace(/\D/g, "");
    const waPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const text = `*🛵 RENTAL EXTENSION CONFIRMED - TRAYMBHKAM TRAVELS HARIDWAR*\n\nNamaste ${extendingBooking.customerName} ji!\nAapki vehicle *${extendingBooking.vehicleName}* (${extendingBooking.plateNumber}) ka rental *+${addDays} Day(s)* extend kar diya gaya hai.\n• *New Return Date:* ${newExpectedEndDate} (${extendingBooking.expectedEndTime})\n• *Additional Rent:* ₹${extraRent}\n\nSafe riding in Uttarakhand! 🙏`;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // ----------------------------------------------------
  // CALL REMINDER HANDLERS FOR ISSUED FLEET
  // ----------------------------------------------------
  const handleOpenCallReminderModal = (b: RentalBooking) => {
    setSelectedBookingForCall(b);
    setCallReminderDate(b.callReminderDate || todayStr);
    setCallReminderTime(b.callReminderTime || "17:00");
    setCallReminderNote(b.callReminderNote || "Confirm return time & location");
    setShowCallReminderModal(true);
  };

  const handleSaveCallReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForCall) return;

    const updated = bookings.map(b => {
      if (b.id === selectedBookingForCall.id) {
        return {
          ...b,
          callReminderDate,
          callReminderTime,
          callReminderNote,
          callReminderStatus: "pending" as const
        };
      }
      return b;
    });

    saveBookings(updated);
    setShowCallReminderModal(false);
    setSelectedBookingForCall(null);
  };

  const handleMarkCallDone = (bookingId: string) => {
    const timeNow = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const dateNow = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          callReminderStatus: "done" as const,
          lastCalledAt: `${timeNow}, ${dateNow}`,
          notes: (b.notes ? b.notes + "\n" : "") + `[Follow-up call completed on ${dateNow} at ${timeNow}]`
        };
      }
      return b;
    });

    saveBookings(updated);
  };

  const handleRemoveCallReminder = (bookingId: string) => {
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          callReminderDate: undefined,
          callReminderTime: undefined,
          callReminderNote: undefined,
          callReminderStatus: undefined
        };
      }
      return b;
    });

    saveBookings(updated);
  };

  // ----------------------------------------------------
  // REVENUE & REPORTS CALCULATIONS
  // ----------------------------------------------------
  const filteredReportBookings = bookings.filter(b => {
    if (reportRange === "today") {
      return b.startDate === todayStr || b.createdAt?.startsWith(todayStr);
    }
    if (reportRange === "week") {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const bDate = new Date(b.startDate || b.createdAt);
      return bDate >= weekAgo;
    }
    if (reportRange === "month") {
      const now = new Date();
      const monthAgo = new Date(now.getTime() - 30 * 86400000);
      const bDate = new Date(b.startDate || b.createdAt);
      return bDate >= monthAgo;
    }
    if (reportRange === "custom" && reportStartDate && reportEndDate) {
      return b.startDate >= reportStartDate && b.startDate <= reportEndDate;
    }
    return true;
  });

  const totalReportRevenue = filteredReportBookings.reduce((sum, b) => sum + (Number(b.totalRent) || 0), 0);
  const totalReportAdvance = filteredReportBookings.reduce((sum, b) => sum + (Number(b.advancePaid) || 0), 0);
  const totalReportDeposits = filteredReportBookings.reduce((sum, b) => sum + (Number(b.securityDeposit) || 0), 0);
  const completedCount = filteredReportBookings.filter(b => b.status === "completed").length;
  const activeCount = filteredReportBookings.filter(b => b.status === "active").length;

  // Vehicle Stats
  const vehicleStats = fleet.map(v => {
    const vBookings = filteredReportBookings.filter(b => b.vehicleId === v.id || b.plateNumber === v.plateNumber);
    const rev = vBookings.reduce((sum, b) => sum + (Number(b.totalRent) || 0), 0);
    const trips = vBookings.length;
    return {
      vehicle: v,
      trips,
      revenue: rev
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Payment Stats
  const paymentStats = {
    upi: filteredReportBookings.filter(b => b.paymentMode === "upi").reduce((sum, b) => sum + (Number(b.totalRent) || 0), 0),
    cash: filteredReportBookings.filter(b => b.paymentMode === "cash").reduce((sum, b) => sum + (Number(b.totalRent) || 0), 0),
    card: filteredReportBookings.filter(b => b.paymentMode === "card").reduce((sum, b) => sum + (Number(b.totalRent) || 0), 0)
  };

  // CSV Exporter
  const handleExportRevenueCsv = () => {
    const headers = ["Booking ID", "Date", "Customer Name", "Phone", "Vehicle", "Plate Number", "Days", "Daily Rate", "Total Rent (INR)", "Advance Paid (INR)", "Deposit (INR)", "Deposit Mode", "Status"];
    const rows = filteredReportBookings.map(b => [
      `"${b.id}"`,
      `"${b.startDate}"`,
      `"${b.customerName.replace(/"/g, '""')}"`,
      `"${b.customerPhone}"`,
      `"${b.vehicleName.replace(/"/g, '""')}"`,
      `"${b.plateNumber}"`,
      b.daysCount,
      b.dailyRate,
      b.totalRent,
      b.advancePaid,
      b.securityDeposit,
      `"${b.depositType.toUpperCase()}"`,
      `"${b.status.toUpperCase()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Traymbhkam_Rental_Revenue_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Comprehensive Rental Bookings & Issued Fleet CSV Exporter
  const handleExportBookingsCsv = (customList?: RentalBooking[], label?: string) => {
    const list = customList || bookings;
    if (list.length === 0) {
      alert("No rental bookings to export.");
      return;
    }

    const headers = [
      "Booking ID",
      "Status",
      "Customer Name",
      "Customer Phone",
      "DL Number",
      "Aadhaar Number",
      "Vehicle Name",
      "Plate Number",
      "Issue Date",
      "Issue Time",
      "Expected Return Date",
      "Expected Return Time",
      "Actual Return Date",
      "Days",
      "Daily Rate (INR)",
      "Start KM",
      "Return KM",
      "Total Rent (INR)",
      "Advance Paid (INR)",
      "Security Deposit (INR)",
      "Deposit Mode",
      "Payment Mode",
      "Call Reminder Date",
      "Call Reminder Time",
      "Call Status",
      "Call Purpose",
      "Last Called At",
      "Notes"
    ];

    const rows = list.map(b => [
      `"${b.id}"`,
      `"${b.status.toUpperCase()}"`,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${b.customerPhone || ''}"`,
      `"${b.dlNumber || ''}"`,
      `"${b.aadhaarNumber || ''}"`,
      `"${(b.vehicleName || '').replace(/"/g, '""')}"`,
      `"${b.plateNumber || ''}"`,
      `"${b.startDate || ''}"`,
      `"${b.startTime || ''}"`,
      `"${b.expectedEndDate || ''}"`,
      `"${b.expectedEndTime || ''}"`,
      `"${b.actualEndDate || ''}"`,
      b.daysCount || 1,
      b.dailyRate || 0,
      b.startKm || 0,
      b.endKm || "",
      b.totalRent || 0,
      b.advancePaid || 0,
      b.securityDeposit || 0,
      `"${(b.depositType || '').toUpperCase()}"`,
      `"${(b.paymentMode || '').toUpperCase()}"`,
      `"${b.callReminderDate || ''}"`,
      `"${b.callReminderTime || ''}"`,
      `"${b.callReminderStatus || ''}"`,
      `"${(b.callReminderNote || '').replace(/"/g, '""')}"`,
      `"${b.lastCalledAt || ''}"`,
      `"${(b.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const titleLabel = label || (activeTab === "followup" ? "Issued_OnRoad_Fleet" : "All_Bookings");
    link.setAttribute("download", `Traymbhkam_Rentals_${titleLabel}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

          <button
            onClick={() => handleExportBookingsCsv(activeTab === "followup" ? filteredFollowupBookings : filteredBookings, activeTab === "followup" ? "FollowUp_Fleet" : "All_Bookings")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-xs shadow-2xs transition cursor-pointer"
            title="Download CSV / Excel export of bookings and fleet"
          >
            <Download size={14} className="text-emerald-700" />
            <span>Export CSV</span>
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
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "bookings"
                ? "bg-[#0b1320] text-amber-300 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText size={13} />
            <span>Rental Issues ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("followup")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 relative ${
              activeTab === "followup"
                ? "bg-[#0b1320] text-amber-300 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BellRing size={13} className={overdueBookings.length > 0 ? "text-red-500 animate-pulse" : ""} />
            <span>Issued Follow-Up Desk ({activeBookings.length})</span>
            {overdueBookings.length > 0 ? (
              <span className="text-[9.5px] px-1.5 py-0.2 bg-red-500 text-white rounded-full font-black">
                {overdueBookings.length} Overdue
              </span>
            ) : dueTodayBookings.length > 0 ? (
              <span className="text-[9.5px] px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full font-bold">
                {dueTodayBookings.length} Due Today
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "reports"
                ? "bg-[#0b1320] text-amber-300 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BarChart3 size={13} />
            <span>Revenue &amp; Reports</span>
          </button>

          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "fleet"
                ? "bg-[#0b1320] text-amber-300 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Bike size={13} />
            <span>Fleet Inventory ({fleet.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("rates")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "rates"
                ? "bg-[#0b1320] text-amber-300 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Key size={13} />
            <span>Haridwar Rates &amp; Policy</span>
          </button>
        </div>

        {(activeTab === "bookings" || activeTab === "followup") && (
          <div className="flex items-center gap-2">
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
            <button
              type="button"
              onClick={() => handleExportBookingsCsv(activeTab === "followup" ? filteredFollowupBookings : filteredBookings, activeTab === "followup" ? "FollowUp_Fleet" : "Filtered_Bookings")}
              className="px-2.5 py-1 text-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1 shadow-2xs transition cursor-pointer shrink-0"
              title="Export Current Table View to CSV"
            >
              <Download size={13} className="text-emerald-600" />
              <span className="hidden sm:inline">Export</span>
            </button>
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

                      {/* Call Reminder Status badge if active */}
                      {isActive && (
                        <div className="pt-0.5">
                          {b.callReminderDate && b.callReminderStatus !== "done" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 text-[10.5px] font-bold">
                              <PhoneCall size={11} className="text-amber-700" />
                              <span>Call: {b.callReminderDate === todayStr ? "Today" : b.callReminderDate} at {b.callReminderTime}</span>
                              {b.callReminderNote && <span className="text-slate-600 font-normal">({b.callReminderNote})</span>}
                            </span>
                          ) : b.lastCalledAt ? (
                            <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-500">
                              <Check size={11} className="text-emerald-600" />
                              <span>Called: {b.lastCalledAt}</span>
                            </span>
                          ) : null}
                        </div>
                      )}
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

                        {isActive && (
                          <button
                            type="button"
                            onClick={() => handleOpenCallReminderModal(b)}
                            title="Set or reschedule call reminder"
                            className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            <PhoneCall size={12} className="text-amber-700" />
                            <span className="hidden sm:inline">Remind Call</span>
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
      {/* TAB: ISSUED VEHICLE FOLLOW-UP DESK */}
      {/* ========================================================================= */}
      {activeTab === "followup" && (
        <div className="space-y-4">
          {/* Subheader Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Status Filter:</span>
              <button
                type="button"
                onClick={() => setFollowupFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  followupFilter === "all"
                    ? "bg-[#0b1320] text-amber-300 shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>All Active on Road</span>
                <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">{activeBookings.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setFollowupFilter("due_today")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  followupFilter === "due_today"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                }`}
              >
                <span>⚠️ Due Today</span>
                <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[10px] font-black">{dueTodayBookings.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setFollowupFilter("overdue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  followupFilter === "overdue"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                }`}
              >
                <span>🚨 Overdue Attention</span>
                <span className="px-1.5 py-0.2 bg-red-200 text-red-900 rounded-full text-[10px] font-black">{overdueBookings.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setFollowupFilter("calls_due")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  followupFilter === "calls_due"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100"
                }`}
              >
                <PhoneCall size={12} />
                <span>📞 Calls Due</span>
                <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[10px] font-black">{callRemindersList.length}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {filteredFollowupBookings.length} on road
              </span>
              <button
                type="button"
                onClick={() => handleExportBookingsCsv(filteredFollowupBookings, "FollowUp_Calling_Sheet")}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="Download calling sheet for patrol and counter team"
              >
                <Download size={13} className="text-emerald-700" />
                <span>Export Calling Sheet</span>
              </button>
            </div>
          </div>

          {/* Call Reminders Hub Banner */}
          {callRemindersList.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-emerald-500/10 border border-amber-300/80 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <PhoneCall size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>Tourist Call Reminders</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
                        {callRemindersList.length} Scheduled
                      </span>
                      {dueTodayCalls.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                          {dueTodayCalls.length} Due Today
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Scheduled tourist follow-ups for return confirmation, road safety, and extension
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFollowupFilter(followupFilter === "calls_due" ? "all" : "calls_due")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    followupFilter === "calls_due"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Filter size={12} />
                  <span>{followupFilter === "calls_due" ? "Show All Vehicles" : "Filter Only Calls Due"}</span>
                </button>
              </div>

              {/* Quick Call Reminder Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {callRemindersList.map((b) => {
                  const isToday = b.callReminderDate === todayStr;
                  const isPast = b.callReminderDate && b.callReminderDate < todayStr;
                  return (
                    <div
                      key={b.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition ${
                        isPast
                          ? "bg-red-50/70 border-red-300"
                          : isToday
                          ? "bg-amber-50/80 border-amber-300 shadow-2xs"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 ${
                            isPast
                              ? "bg-red-600 text-white"
                              : isToday
                              ? "bg-amber-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            <Clock size={10} />
                            <span>
                              {isPast ? "OVERDUE CALL" : isToday ? `Today at ${b.callReminderTime}` : `${b.callReminderDate} (${b.callReminderTime})`}
                            </span>
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{b.plateNumber}</span>
                        </div>

                        <p className="text-xs font-bold text-slate-900">{b.customerName}</p>
                        <a
                          href={`tel:${b.customerPhone}`}
                          className="text-[11px] font-mono font-bold text-amber-900 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone size={11} className="text-amber-700" />
                          {b.customerPhone}
                        </a>

                        {b.callReminderNote && (
                          <p className="text-[11px] text-slate-600 bg-white/70 p-1.5 rounded-lg border border-slate-200/60 mt-1.5 line-clamp-2">
                            💬 {b.callReminderNote}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 gap-1.5">
                        <a
                          href={`tel:${b.customerPhone}`}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                          title="Call customer directly"
                        >
                          <PhoneCall size={11} />
                          <span>Call Now</span>
                        </a>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMarkCallDone(b.id)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                            title="Mark this reminder as completed"
                          >
                            <Check size={11} />
                            <span>Done</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCallReminderModal(b)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg text-[11px] cursor-pointer"
                            title="Reschedule reminder"
                          >
                            <Clock size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCallReminder(b.id)}
                            className="p-1 hover:bg-red-50 text-red-500 rounded-lg text-[11px] cursor-pointer"
                            title="Delete reminder"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredFollowupBookings.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200/70 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                {followupFilter === "overdue" 
                  ? "Great! No Overdue Rentals" 
                  : followupFilter === "due_today" 
                  ? "No Rentals Due for Return Today" 
                  : "No Vehicles Currently on Road"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {followupFilter === "all" 
                  ? "All vehicles are currently parked at Haridwar station hub ready for walk-in tourists."
                  : "All tourists are currently riding within their scheduled booking period."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredFollowupBookings.map((b) => {
                const now = new Date();
                const expectedEnd = new Date(`${b.expectedEndDate}T${b.expectedEndTime || "21:00"}`);
                const isOverdue = now > expectedEnd;
                const isDueToday = b.expectedEndDate === todayStr;
                const diffHours = Math.round((expectedEnd.getTime() - now.getTime()) / (1000 * 60 * 60));
                const vehicleObj = fleet.find(f => f.id === b.vehicleId);

                return (
                  <div
                    key={b.id}
                    className={`bg-white rounded-xl p-4 border transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      isOverdue 
                        ? "border-red-400 bg-red-50/20 ring-1 ring-red-400/40" 
                        : isDueToday 
                        ? "border-amber-300 bg-amber-50/20" 
                        : "border-slate-200"
                    }`}
                  >
                    {/* Left: Vehicle & Customer Info */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {vehicleObj?.image ? (
                        <img 
                          src={vehicleObj.image} 
                          alt={b.vehicleName} 
                          className="w-20 h-16 object-contain rounded-lg bg-slate-50 border border-slate-100 p-1 shrink-0" 
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                          <Bike size={24} />
                        </div>
                      )}

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{b.vehicleName}</span>
                          <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {b.plateNumber}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {b.id}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <User size={13} className="text-slate-400" />
                            {b.customerName}
                          </span>
                          <span className="font-mono font-semibold text-emerald-800 flex items-center gap-1">
                            <Phone size={13} className="text-emerald-600" />
                            {b.customerPhone}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            DL: {b.dlNumber}
                          </span>
                        </div>

                        {/* Dates & Urgency Status */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                          <span className="text-[11px] text-slate-500">
                            Issued: <strong>{b.startDate} ({b.startTime})</strong> &rarr; Expected: <strong>{b.expectedEndDate} ({b.expectedEndTime})</strong>
                          </span>
                          {isOverdue ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-300 rounded font-black text-[10.5px] flex items-center gap-1 animate-pulse">
                              <AlertTriangle size={12} />
                              <span>OVERDUE ({Math.abs(diffHours)} hrs past return)</span>
                            </span>
                          ) : isDueToday ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold text-[10.5px] flex items-center gap-1">
                              <Clock size={12} />
                              <span>DUE TODAY by {b.expectedEndTime}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-semibold text-[10.5px]">
                              🟢 Active on Road ({diffHours} hrs remaining)
                            </span>
                          )}
                        </div>

                        {/* Call Reminder Status badge in Followup Card */}
                        <div className="pt-1">
                          {b.callReminderDate && b.callReminderStatus !== "done" ? (
                            <div className="flex items-center gap-1.5 flex-wrap bg-amber-50/90 border border-amber-300 px-2 py-1 rounded-lg text-xs text-amber-950">
                              <PhoneCall size={12} className="text-amber-700 shrink-0" />
                              <span className="font-bold">
                                📞 Call Scheduled: {b.callReminderDate === todayStr ? "Today" : b.callReminderDate} at {b.callReminderTime}
                              </span>
                              {b.callReminderNote && <span className="text-slate-600 font-medium">({b.callReminderNote})</span>}
                              <button
                                type="button"
                                onClick={() => handleMarkCallDone(b.id)}
                                className="ml-auto text-[10.5px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 underline cursor-pointer"
                              >
                                <Check size={11} /> Mark Done
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenCallReminderModal(b)}
                                className="text-[10.5px] font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                              >
                                Reschedule
                              </button>
                            </div>
                          ) : b.lastCalledAt ? (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Check size={12} className="text-emerald-600" />
                              <span>Last Called: {b.lastCalledAt}</span>
                              <button
                                type="button"
                                onClick={() => handleOpenCallReminderModal(b)}
                                className="text-[10.5px] text-amber-700 hover:underline font-bold ml-1 cursor-pointer"
                              >
                                + Set Reminder
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Financials */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs shrink-0">
                      <div>
                        <span className="text-[9.5px] text-slate-400 block font-medium">Daily Rate</span>
                        <span className="font-bold text-slate-800">₹{b.dailyRate}/day</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-slate-400 block font-medium">Total Rent</span>
                        <span className="font-bold text-slate-900">₹{b.totalRent} ({b.daysCount}d)</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-slate-400 block font-medium">Advance Paid</span>
                        <span className="font-bold text-emerald-700">₹{b.advancePaid}</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-slate-400 block font-medium">Deposit Held</span>
                        <span className="font-bold text-amber-800">₹{b.securityDeposit}</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap self-end lg:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSendFollowUpWhatsApp(b, isOverdue ? "overdue" : isDueToday ? "reminder" : "checkin")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                          isOverdue 
                            ? "bg-red-600 hover:bg-red-700 text-white" 
                            : isDueToday 
                            ? "bg-amber-600 hover:bg-amber-700 text-white" 
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                        title="Send customized WhatsApp reminder / status check"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp Reminder</span>
                      </button>

                      <a
                        href={`tel:${b.customerPhone}`}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        title="Call Tourist Directly"
                      >
                        <Phone size={13} />
                        <span className="hidden sm:inline">Call</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleOpenCallReminderModal(b)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Set reminder to call customer"
                      >
                        <PhoneCall size={13} className="text-amber-700" />
                        <span>Remind Call</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenExtendModal(b)}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0369a1] border border-sky-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        title="Extend rental days"
                      >
                        <Plus size={13} />
                        <span>Extend</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenReturnModal(b)}
                        className="px-3 py-1.5 rounded-lg bg-[#0b1320] hover:bg-[#16233b] text-amber-300 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                        title="Check-in return and settle balance"
                      >
                        <CheckCircle2 size={13} />
                        <span>Return</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: REVENUE & REPORTS ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === "reports" && (
        <div className="space-y-5">
          {/* Filter Bar with Date Pickers */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter size={13} />
                <span>Period:</span>
              </span>
              {[
                { id: "all", label: "All Time" },
                { id: "today", label: "Today" },
                { id: "week", label: "Last 7 Days" },
                { id: "month", label: "This Month (30d)" },
                { id: "custom", label: "Custom Dates" }
              ].map(pill => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setReportRange(pill.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    reportRange === pill.id
                      ? "bg-[#0b1320] text-amber-300 shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {pill.label}
                </button>
              ))}

              {reportRange === "custom" && (
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 ml-1">
                  <span className="text-[10px] text-slate-500 font-bold px-1">From:</span>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={e => setReportStartDate(e.target.value)}
                    className="px-2 py-0.5 text-xs bg-white border border-slate-200 rounded"
                  />
                  <span className="text-[10px] text-slate-500 font-bold px-1">To:</span>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={e => setReportEndDate(e.target.value)}
                    className="px-2 py-0.5 text-xs bg-white border border-slate-200 rounded"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportRevenueCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Download CSV Spreadsheet with revenue & customer ledger"
            >
              <Download size={13} />
              <span>Export CSV Report</span>
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Rental Revenue</span>
              <p className="text-2xl font-black text-slate-900 tracking-tight mt-1 text-emerald-800">
                ₹{totalReportRevenue.toLocaleString("en-IN")}
              </p>
              <p className="text-[10.5px] text-slate-500 mt-1">Advance Collected: ₹{totalReportAdvance.toLocaleString("en-IN")}</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Trips Handled</span>
              <p className="text-2xl font-black text-slate-900 tracking-tight mt-1 text-[#0369a1]">
                {filteredReportBookings.length}
              </p>
              <p className="text-[10.5px] text-slate-500 mt-1">{completedCount} Completed &bull; {activeCount} On Road</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Deposits Held</span>
              <p className="text-2xl font-black text-amber-800 tracking-tight mt-1">
                ₹{totalReportDeposits.toLocaleString("en-IN")}
              </p>
              <p className="text-[10.5px] text-slate-500 mt-1">Refundable upon vehicle return</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Trip Value</span>
              <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                ₹{Math.round(totalReportRevenue / Math.max(1, filteredReportBookings.length)).toLocaleString("en-IN")}
              </p>
              <p className="text-[10.5px] text-slate-500 mt-1">Per vehicle rental cycle</p>
            </div>
          </div>

          {/* Vehicle Revenue Breakdown & Payment Modes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Column 1 & 2: Vehicle-wise Performance Table */}
            <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <TrendingUp size={15} className="text-amber-600" />
                  <span>Vehicle Fleet Performance &amp; Revenue Ranking</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Ranked by Total Earnings</span>
              </div>

              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50/50">
                    <tr>
                      <th className="py-2 px-2.5">Vehicle</th>
                      <th className="py-2 px-2 text-center">Category</th>
                      <th className="py-2 px-2 text-center">Trips</th>
                      <th className="py-2 px-2.5 text-right">Revenue (₹)</th>
                      <th className="py-2 px-2.5 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicleStats.map((stat, i) => {
                      const sharePct = totalReportRevenue > 0 ? Math.round((stat.revenue / totalReportRevenue) * 100) : 0;
                      return (
                        <tr key={stat.vehicle.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-2.5 px-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 block">{stat.vehicle.name}</span>
                                <span className="font-mono text-[10.5px] text-slate-500 font-semibold">{stat.vehicle.plateNumber}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize font-medium">
                              {stat.vehicle.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-slate-700">
                            {stat.trips}
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-black text-slate-900">
                            ₹{stat.revenue.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-2.5 text-right">
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {sharePct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Column 3: Payment Modes & Summary */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <DollarSign size={15} className="text-emerald-600" />
                <span>Payment Mode Breakdown</span>
              </h3>

              <div className="space-y-3">
                <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">UPI / QR Transfer</span>
                    <span className="text-[10.5px] text-emerald-700">PhonePe, GooglePay, Paytm</span>
                  </div>
                  <span className="font-black text-sm text-emerald-900">₹{paymentStats.upi.toLocaleString("en-IN")}</span>
                </div>

                <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-amber-900 block">Cash at Desk</span>
                    <span className="text-[10.5px] text-amber-700">Counter Cash Handover</span>
                  </div>
                  <span className="font-black text-sm text-amber-900">₹{paymentStats.cash.toLocaleString("en-IN")}</span>
                </div>

                <div className="bg-sky-50/60 border border-sky-200/70 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-sky-900 block">Card / POS</span>
                    <span className="text-[10.5px] text-sky-700">Debit / Credit Cards</span>
                  </div>
                  <span className="font-black text-sm text-sky-900">₹{paymentStats.card.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Station Hub Note */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
                <p className="font-bold text-slate-800">💡 Business Metric Tip:</p>
                <p className="leading-relaxed">
                  Cruisers and Himalayan adventure bikes yield 2.5x higher daily tariff than scooties, with peak demand during May-June Chardham opening.
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Ledger Table */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FileText size={15} className="text-[#0369a1]" />
                <span>Rental Transaction Ledger ({filteredReportBookings.length} Records)</span>
              </h3>
              <button
                type="button"
                onClick={handleExportRevenueCsv}
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download size={12} />
                <span>Download CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50/50">
                  <tr>
                    <th className="py-2 px-2.5">Date</th>
                    <th className="py-2 px-2">ID</th>
                    <th className="py-2 px-2.5">Customer</th>
                    <th className="py-2 px-2.5">Vehicle</th>
                    <th className="py-2 px-2 text-center">Days</th>
                    <th className="py-2 px-2.5 text-right">Rent</th>
                    <th className="py-2 px-2.5 text-right">Advance</th>
                    <th className="py-2 px-2.5 text-right">Deposit</th>
                    <th className="py-2 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReportBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2 px-2.5 font-medium text-slate-600 whitespace-nowrap">{b.startDate}</td>
                      <td className="py-2 px-2 font-mono text-[10px] text-slate-500">{b.id}</td>
                      <td className="py-2 px-2.5">
                        <span className="font-bold text-slate-900 block">{b.customerName}</span>
                        <span className="font-mono text-[10.5px] text-slate-500">{b.customerPhone}</span>
                      </td>
                      <td className="py-2 px-2.5">
                        <span className="font-bold text-slate-900 block">{b.vehicleName}</span>
                        <span className="font-mono text-[10.5px] text-amber-800 font-semibold">{b.plateNumber}</span>
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-slate-700">{b.daysCount}d</td>
                      <td className="py-2 px-2.5 text-right font-black text-slate-900">₹{b.totalRent}</td>
                      <td className="py-2 px-2.5 text-right font-semibold text-emerald-700">₹{b.advancePaid}</td>
                      <td className="py-2 px-2.5 text-right font-semibold text-amber-800">₹{b.securityDeposit}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          b.status === "active" 
                            ? "bg-amber-100 text-amber-900" 
                            : b.status === "completed" 
                            ? "bg-emerald-100 text-emerald-900" 
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: FLEET VEHICLES INVENTORY */}
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
                        {/* Status Badges & Quick Edit */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/90 backdrop-blur-xs text-slate-700 shadow-2xs border border-slate-200/60">
                            {v.type}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs shadow-2xs ${
                              isAvailable 
                                ? "bg-emerald-500/90 text-white"
                                : isRented
                                ? "bg-amber-500/90 text-white"
                                : "bg-rose-500/90 text-white"
                            }`}>
                              {isAvailable ? "● Ready" : isRented ? "● On Road" : "Service"}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditVehicle(v);
                              }}
                              className="p-1 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-amber-800 shadow-xs border border-slate-200 cursor-pointer transition"
                              title="Edit Vehicle Details"
                            >
                              <Pencil size={11} />
                            </button>
                          </div>
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
                    <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditVehicle(v)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-900 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          title="Edit vehicle details, number plate, price & picture"
                        >
                          <Pencil size={11} className="text-amber-600" />
                          <span>Edit</span>
                        </button>
                        <span className="text-[10px] text-slate-500 hidden sm:flex items-center gap-1 font-medium">
                          <ShieldCheck size={12} className="text-emerald-600" /> {v.helmetsIncluded || 2}
                        </span>
                      </div>

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
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                      <Calendar size={12} className="text-amber-600" />
                      <span>Pickup Date &amp; Time</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="date"
                        required
                        value={newBooking.startDate}
                        onChange={e => {
                          const newStart = e.target.value;
                          const startObj = new Date(newStart);
                          const endObj = new Date(startObj.getTime() + newBooking.daysCount * 86400000);
                          setNewBooking({
                            ...newBooking,
                            startDate: newStart,
                            expectedEndDate: endObj.toISOString().split("T")[0]
                          });
                        }}
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
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                      <Calendar size={12} className="text-emerald-600" />
                      <span>Drop Date &amp; Time</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="date"
                        required
                        value={newBooking.expectedEndDate}
                        onChange={e => {
                          const newEnd = e.target.value;
                          let days = newBooking.daysCount;
                          if (newBooking.startDate && newEnd) {
                            const diff = Math.round((new Date(newEnd).getTime() - new Date(newBooking.startDate).getTime()) / 86400000);
                            days = Math.max(1, diff);
                          }
                          setNewBooking({ ...newBooking, expectedEndDate: newEnd, daysCount: days });
                        }}
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

                {/* Quick Duration Shortcuts */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <CalendarDays size={12} className="text-amber-600" />
                    <span>Quick Days:</span>
                  </span>
                  {[
                    { label: "1 Day (Local)", days: 1 },
                    { label: "2 Days (Rishikesh)", days: 2 },
                    { label: "3 Days (Mussoorie)", days: 3 },
                    { label: "5 Days (Do Dham)", days: 5 },
                    { label: "7 Days (Chardham)", days: 7 },
                    { label: "10 Days (Full Circuit)", days: 10 }
                  ].map(chip => (
                    <button
                      key={chip.days}
                      type="button"
                      onClick={() => {
                        const start = new Date(newBooking.startDate || new Date());
                        const end = new Date(start.getTime() + chip.days * 86400000);
                        setNewBooking({
                          ...newBooking,
                          daysCount: chip.days,
                          expectedEndDate: end.toISOString().split("T")[0]
                        });
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                        newBooking.daysCount === chip.days
                          ? "bg-amber-600 text-white border-amber-600 font-bold shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
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

                {/* Custom Photo Upload & URL */}
                <div className="flex items-center justify-between pt-1">
                  <label className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    <Upload size={11} />
                    <span>Upload Device Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={e => handleVehiclePhotoUpload(e, false)} 
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">or enter image path / URL below</span>
                </div>
                <input
                  type="text"
                  placeholder="Custom image path or URL (e.g. /vehicles/... or https://...)"
                  value={newVehicle.image || ""}
                  onChange={e => setNewVehicle({ ...newVehicle, image: e.target.value })}
                  className="w-full text-[11px] p-2 rounded-lg border border-slate-200 bg-white"
                />

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

      {/* ========================================================================= */}
      {/* 11. MODAL: EDIT VEHICLE DETAILS */}
      {/* ========================================================================= */}
      {showEditVehicleModal && editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden my-auto animate-fade-in">
            <div className="p-4 bg-[#0b1320] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Pencil size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">Edit Vehicle Details</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{editingVehicle.name} &bull; {editingVehicle.plateNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowEditVehicleModal(false);
                  setEditingVehicle(null);
                }}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditVehicle} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Vehicle Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Vehicle Model &amp; Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Honda Activa 125 (Grey)"
                    value={editingVehicle.name}
                    onChange={e => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category / Type *</label>
                  <select
                    value={editingVehicle.type}
                    onChange={e => setEditingVehicle({ ...editingVehicle, type: e.target.value as any })}
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
                  <label className="text-xs font-semibold text-slate-700">Registration Plate (Number Plate) *</label>
                  <input
                    type="text"
                    required
                    placeholder="UK 08 AB 1122"
                    value={editingVehicle.plateNumber}
                    onChange={e => setEditingVehicle({ ...editingVehicle, plateNumber: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono uppercase bg-white font-bold text-amber-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Daily Tariff Rate (₹/day) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="500"
                    value={editingVehicle.dailyRate}
                    onChange={e => setEditingVehicle({ ...editingVehicle, dailyRate: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-bold"
                  />
                </div>
              </div>

              {/* Odometer, Fuel Level & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Odometer (KM) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingVehicle.odometer}
                    onChange={e => setEditingVehicle({ ...editingVehicle, odometer: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Fuel Level</label>
                  <select
                    value={editingVehicle.fuelLevel}
                    onChange={e => setEditingVehicle({ ...editingVehicle, fuelLevel: e.target.value as any })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Full">Full</option>
                    <option value="75%">75%</option>
                    <option value="50%">50%</option>
                    <option value="25%">25%</option>
                    <option value="Reserve">Reserve</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Vehicle Status</label>
                  <select
                    value={editingVehicle.status}
                    onChange={e => setEditingVehicle({ ...editingVehicle, status: e.target.value as any })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-semibold"
                  >
                    <option value="available">● Available / Ready</option>
                    <option value="rented">● Active / On Road</option>
                    <option value="maintenance">● In Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Helmets Included */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Helmets Included in Rent</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={editingVehicle.helmetsIncluded || 2}
                  onChange={e => setEditingVehicle({ ...editingVehicle, helmetsIncluded: Number(e.target.value) })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              {/* Choose Vehicle Photo / Cutout */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Vehicle Photo / Studio Image
                  </label>
                  <label className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Upload size={11} />
                    <span>Upload Device Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={e => handleVehiclePhotoUpload(e, true)} 
                    />
                  </label>
                </div>
                
                {/* Presets Grid */}
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
                    const isSelected = editingVehicle.image === preset.img;
                    return (
                      <button
                        type="button"
                        key={preset.img}
                        onClick={() => setEditingVehicle({ ...editingVehicle, image: preset.img })}
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

                {/* Custom Photo URL Input */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Or enter custom image URL (e.g. /vehicles/... or https://...)"
                    value={editingVehicle.image || ""}
                    onChange={e => setEditingVehicle({ ...editingVehicle, image: e.target.value })}
                    className="w-full text-[11px] p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                {/* Selected Preview Showcase */}
                {editingVehicle.image && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50/50 via-slate-50 to-white rounded-xl border border-amber-200/60 mt-2">
                    <img src={editingVehicle.image} alt="Preview" className="h-16 w-24 object-contain drop-shadow-md" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{editingVehicle.name || "Vehicle Preview"}</p>
                      <p className="text-[11px] text-amber-800 font-mono font-bold">{editingVehicle.plateNumber}</p>
                      <p className="text-[10px] text-slate-500">Daily: ₹{editingVehicle.dailyRate} &bull; Type: {editingVehicle.type} &bull; Status: {editingVehicle.status}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit / Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteVehicle(editingVehicle.id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                  title="Remove vehicle from fleet"
                >
                  <Trash2 size={13} />
                  <span>Delete Vehicle</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditVehicleModal(false);
                      setEditingVehicle(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#0b1320] hover:bg-[#16233b] text-amber-300 hover:text-white font-semibold text-xs transition cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <CheckCircle2 size={13} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extend Booking Modal */}
      {showExtendModal && extendingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-amber-200" />
                <h3 className="font-bold text-sm tracking-wide">Extend Rental Duration</h3>
              </div>
              <button
                onClick={() => {
                  setShowExtendModal(false);
                  setExtendingBooking(null);
                }}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExtendBooking} className="p-5 space-y-4">
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/70 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-950">{extendingBooking.vehicleName}</p>
                  <p className="text-[11px] font-mono font-bold text-amber-800">{extendingBooking.plateNumber}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{extendingBooking.customerName} &bull; {extendingBooking.customerPhone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Return</span>
                  <span className="text-xs font-bold text-slate-800">{extendingBooking.expectedEndDate}</span>
                  <span className="text-[10px] text-slate-500 block">{extendingBooking.expectedEndTime}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Extend By (Days)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setExtendDays(d);
                        setExtendExtraRent(d * extendingBooking.dailyRate);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                        extendDays === d
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      +{d} Day{d > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Custom Days:</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={extendDays}
                    onChange={(e) => {
                      const d = Math.max(1, parseInt(e.target.value) || 1);
                      setExtendDays(d);
                      setExtendExtraRent(d * extendingBooking.dailyRate);
                    }}
                    className="w-20 px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Additional Rent Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={extendExtraRent}
                    onChange={(e) => setExtendExtraRent(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Based on daily tariff ₹{extendingBooking.dailyRate}/day x {extendDays} days. Editable if giving discount.
                </p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-800">
                  New Return Date:{" "}
                  <span className="text-amber-700 font-bold">
                    {(() => {
                      const d = new Date(extendingBooking.expectedEndDate);
                      d.setDate(d.getDate() + (Number(extendDays) || 1));
                      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                    })()}
                  </span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Sends automated WhatsApp extension confirmation directly to customer.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowExtendModal(false);
                    setExtendingBooking(null);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send size={13} />
                  <span>Confirm & Send WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call Reminder Modal */}
      {showCallReminderModal && selectedBookingForCall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall size={18} className="text-amber-200" />
                <h3 className="font-bold text-sm tracking-wide">Schedule Tourist Call Reminder</h3>
              </div>
              <button
                onClick={() => {
                  setShowCallReminderModal(false);
                  setSelectedBookingForCall(null);
                }}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCallReminder} className="p-5 space-y-4">
              {/* Customer / Vehicle context */}
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{selectedBookingForCall.customerName}</p>
                  <a
                    href={`tel:${selectedBookingForCall.customerPhone}`}
                    className="text-xs font-mono font-bold text-emerald-800 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Phone size={12} className="text-emerald-600" />
                    {selectedBookingForCall.customerPhone}
                  </a>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {selectedBookingForCall.vehicleName} &bull; <strong className="text-amber-900 font-mono">{selectedBookingForCall.plateNumber}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected Return</span>
                  <span className="text-xs font-bold text-slate-800">{selectedBookingForCall.expectedEndDate}</span>
                  <span className="text-[10px] text-slate-500 block">{selectedBookingForCall.expectedEndTime}</span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Call Reminder Date</label>
                  <input
                    type="date"
                    required
                    value={callReminderDate}
                    onChange={(e) => setCallReminderDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Call Time</label>
                  <input
                    type="time"
                    required
                    value={callReminderTime}
                    onChange={(e) => setCallReminderTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons for Date & Time */}
              <div>
                <label className="text-[10.5px] font-semibold text-slate-500 block mb-1.5">Quick Schedule Shortcuts:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCallReminderDate(todayStr);
                      const d = new Date();
                      d.setHours(d.getHours() + 2);
                      const hh = String(d.getHours()).padStart(2, "0");
                      const mm = String(d.getMinutes()).padStart(2, "0");
                      setCallReminderTime(`${hh}:${mm}`);
                      setCallReminderNote("Highway & Rishikesh Check (2 Hrs post issue)");
                    }}
                    className="px-2 py-1 text-[11px] bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-lg font-medium text-slate-700 text-left transition cursor-pointer"
                  >
                    ⏱️ In 2 Hours (Road Check)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCallReminderDate(todayStr);
                      setCallReminderTime("17:00");
                      setCallReminderNote("Evening return & location status");
                    }}
                    className="px-2 py-1 text-[11px] bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-lg font-medium text-slate-700 text-left transition cursor-pointer"
                  >
                    🌆 Today Evening (05:00 PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setCallReminderDate(d.toISOString().split("T")[0]);
                      setCallReminderTime("10:00");
                      setCallReminderNote("Morning hill ride & fuel check");
                    }}
                    className="px-2 py-1 text-[11px] bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-lg font-medium text-slate-700 text-left transition cursor-pointer"
                  >
                    ☀️ Tomorrow (10:00 AM)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCallReminderDate(selectedBookingForCall.expectedEndDate);
                      setCallReminderTime("11:00");
                      setCallReminderNote("Return day checkout & ETA confirmation");
                    }}
                    className="px-2 py-1 text-[11px] bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-lg font-medium text-slate-700 text-left transition cursor-pointer"
                  >
                    🏁 On Return Day (11:00 AM)
                  </button>
                </div>
              </div>

              {/* Call Purpose / Reason Chips */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Reminder Purpose / Instructions</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {[
                    "Confirm Return Time",
                    "Check Highway & Traffic Status",
                    "Follow-up for Rental Extension",
                    "Overdue Notice / Location Check",
                    "Chardham Route Safety Check",
                    "Security Deposit & Balance Check"
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCallReminderNote(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                        callReminderNote === preset
                          ? "bg-amber-600 text-white border-amber-600 font-bold"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or enter custom call note..."
                  value={callReminderNote}
                  onChange={(e) => setCallReminderNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                {selectedBookingForCall.callReminderDate ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveCallReminder(selectedBookingForCall.id);
                      setShowCallReminderModal(false);
                      setSelectedBookingForCall(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                  >
                    Clear Reminder
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCallReminderModal(false);
                      setSelectedBookingForCall(null);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Save Reminder</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
