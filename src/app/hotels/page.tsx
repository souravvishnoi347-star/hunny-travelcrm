"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Download, 
  Loader2, 
  MessageCircle, 
  Building2, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  FileText, 
  CheckCircle2, 
  RotateCcw,
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut,
  Copy,
  ArrowUp,
  ArrowDown,
  Bed,
  Utensils,
  Clock,
  BedDouble,
  Users,
  FileSpreadsheet,
  Upload,
  Car,
  Hash,
  ShieldCheck
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveDocumentToHub } from "@/lib/documentsHub";

export interface HotelStay {
  id: string;
  nightsLabel: string; // e.g. "Night 1 (15 May)" or "Day 1-2"
  city: string;
  hotelName: string;
  hotelAddress: string;
  contactNo: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomType: string;
  noOfRooms: string;
  mealPlan: string; // "EP" | "CP" | "MAP" | "AP"
  confirmationNo: string;
  specialRequest?: string;
}

export interface HotelVoucherData {
  voucherNo: string;
  tripDates?: string;
  bookingId?: string;
  dateOfIssue: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  totalPax: string;
  totalRooms: string;
  tripDuration: string;
  specialInstructions: string;
  inclusions: string;
  emergencyContact: string;
  stays: HotelStay[];
}

// ----------------------------------------------------
// GROUP TRAVEL / MULTI-GROUP ALLOCATION VOUCHER MODELS
// ----------------------------------------------------
export interface GroupMemberAllocation {
  id: string;
  sNo: number;
  billNo: string;
  member: string; // e.g. "4 Pax"
  bedroom: string; // e.g. "1 FOUR BEDROOM"
  name: string; // e.g. "VIJAY KUMAR"
  mobileNo: string; // e.g. "8294655064"
}

export interface GroupHotelSchedule {
  id: string;
  date: string; // e.g. "28/04/2026"
  place: string; // e.g. "BARKOT"
  hotelName: string; // e.g. "HOTEL TRISHUL"
  hotelMobile: string; // e.g. "8392932020"
}

export interface GroupTravelVoucherData {
  voucherTitle: string; // "TRAYMBHKAM TOUR AND TRAVELS (reg.)"
  subTitle: string; // "CHARDHAM YATRA GROUP PACKAGE 10 DAYS"
  officeAddress: string;
  contactEmail: string;
  contactPhones: string;
  transportType: string; // "TEMPO TRAVELLER (Non-AC in Hills)"
  yatraDates: string; // "28 APRIL TO 07 MAY"
  carNumber: string; // "UK 07 TA 4821"
  driverName: string; // "Dharmendra Singh"
  driverMobile: string; // "9411582310"
  remarks: string;
  allocations: GroupMemberAllocation[];
  hotelSchedules: GroupHotelSchedule[];
}

export const PRESET_GROUP_CHARDHAM_28APRIL: GroupTravelVoucherData = {
  voucherTitle: "TRAYMBHKAM TOUR AND TRAVELS (reg.)",
  subTitle: "CHARDHAM YATRA GROUP PACKAGE 10 DAYS",
  officeAddress: "OPP RAILWAY STATION GATE NO.2 HARIDWAR",
  contactEmail: "info@traymbhkam.com",
  contactPhones: "MR. GAGANDEEP: +91 82660 16066",
  transportType: "TEMPO TRAVELLER (Non-AC in Hills)",
  yatraDates: "28 APRIL TO 07 MAY 2026",
  carNumber: "UK 07 TA 4821",
  driverName: "Dharmendra Singh",
  driverMobile: "9411582310",
  remarks: "• Non-AC vehicle operates in hill and mountain terrains as per safety regulations.\n• Kedarnath accommodation is in camps/tents on a sharing basis as per high altitude norms.\n• All guests must carry valid original Government Photo ID (Aadhaar / Voter ID) at each check-in.\n• Group members must adhere to the morning departure timings announced by your tour manager/driver.",
  allocations: [
    { id: "ga-1", sNo: 1, billNo: "Bill 528", member: "4 Pax", bedroom: "1 FOUR BEDROOM", name: "VIJAY KUMAR", mobileNo: "8294655064" },
    { id: "ga-2", sNo: 2, billNo: "Bill 533", member: "2 Pax", bedroom: "1 DOUBLE BEDROOM", name: "LAXMAN DARYANI", mobileNo: "9828468846" },
    { id: "ga-3", sNo: 3, billNo: "Bill 527", member: "2 Pax", bedroom: "1 DOUBLE BEDROOM", name: "MAHESH KUMAR", mobileNo: "9861014590" },
    { id: "ga-4", sNo: 4, billNo: "Bill 526", member: "2 Pax", bedroom: "1 DOUBLE BEDROOM", name: "SOHAN ARORA", mobileNo: "9414088688" },
    { id: "ga-5", sNo: 5, billNo: "Bill 516", member: "5 Pax", bedroom: "1 DOUBLE AND 1 TRIPLE BED", name: "PARSHANT SINGH", mobileNo: "6355673714" },
    { id: "ga-6", sNo: 6, billNo: "Bill 514", member: "2 Pax", bedroom: "1 DOUBLE BEDROOM", name: "PRASAD TARE", mobileNo: "9820541233" },
    { id: "ga-7", sNo: 7, billNo: "Bill 515", member: "4+1 Pax", bedroom: "1 FOUR BEDROOM", name: "RANIT RANA", mobileNo: "9734589012" },
    { id: "ga-8", sNo: 8, billNo: "Bill 518", member: "1 Pax", bedroom: "1 DOUBLE BEDROOM", name: "SUNITA LIMBOO", mobileNo: "9818765432" }
  ],
  hotelSchedules: [
    { id: "gh-1", date: "28/04/2026", place: "BARKOT", hotelName: "HOTEL TRISHUL", hotelMobile: "8392932020" },
    { id: "gh-2", date: "29/04/2026", place: "BARKOT", hotelName: "HOTEL TRISHUL", hotelMobile: "8392932020" },
    { id: "gh-3", date: "30/04/2026", place: "UTTARKASHI HINA", hotelName: "HOTEL KAILASHA", hotelMobile: "9718640101" },
    { id: "gh-4", date: "01/05/2026", place: "UTTARKASHI HINA", hotelName: "HOTEL KAILASHA", hotelMobile: "9718640101" },
    { id: "gh-5", date: "02/05/2026", place: "PHATA", hotelName: "HOTEL MAA PAA", hotelMobile: "9634528441" },
    { id: "gh-6", date: "03/05/2026", place: "KEDARNATH", hotelName: "BHAGWARI JI (Camps / Tents)", hotelMobile: "9068648285" },
    { id: "gh-7", date: "04/05/2026", place: "PHATA", hotelName: "HOTEL MAA PAA", hotelMobile: "9634528441" },
    { id: "gh-8", date: "05/05/2026", place: "PIPALKOTI", hotelName: "HOTEL DABRAL", hotelMobile: "7452827619" },
    { id: "gh-9", date: "06/05/2026", place: "PIPALKOTI", hotelName: "HOTEL DABRAL", hotelMobile: "7452827619" }
  ]
};

export const BLANK_GROUP_VOUCHER: GroupTravelVoucherData = {
  voucherTitle: "TRAYMBHKAM TOUR AND TRAVELS (reg.)",
  subTitle: "CHARDHAM YATRA GROUP PACKAGE 10 DAYS",
  officeAddress: "OPP RAILWAY STATION GATE NO.2 HARIDWAR",
  contactEmail: "info@traymbhkam.com",
  contactPhones: "MR. GAGANDEEP: +91 82660 16066",
  transportType: "TEMPO TRAVELLER (Non-AC in Hills)",
  yatraDates: "",
  carNumber: "",
  driverName: "",
  driverMobile: "",
  remarks: "• Non-AC vehicle operates in hill and mountain terrains as per safety regulations.\n• Kedarnath accommodation is in camps/tents on a sharing basis as per high altitude norms.\n• All guests must carry valid original Government Photo ID (Aadhaar / Voter ID).",
  allocations: [
    { id: "ga-1", sNo: 1, billNo: "Bill 001", member: "2 Pax", bedroom: "1 DOUBLE BEDROOM", name: "", mobileNo: "" }
  ],
  hotelSchedules: [
    { id: "gh-1", date: "", place: "", hotelName: "", hotelMobile: "" }
  ]
};

function parseExcelSerialDate(val: any): string {
  if (!val && val !== 0) return "";
  if (typeof val === "number" && val > 30000 && val < 60000) {
    const jsDate = new Date(Math.round((val - 25569) * 86400 * 1000));
    const d = String(jsDate.getDate()).padStart(2, "0");
    const m = String(jsDate.getMonth() + 1).padStart(2, "0");
    const y = jsDate.getFullYear();
    return `${d}/${m}/${y}`;
  }
  return String(val).trim();
}

// Actual Old Voucher: Chardham 10 Days (Bill No. 604 - Mr. Jayesh Bhai Patel)
const PRESET_CHARDHAM_ACTUAL_VOUCHER: HotelVoucherData = {
  voucherNo: "BILL NO. 604",
  tripDates: "14/05/2026 TO 22/05/2026",
  bookingId: "CH-2026-604",
  dateOfIssue: "14 May 2026",
  guestName: "Mr. Jayesh Bhai Babubhai Patel",
  guestPhone: "7984641303",
  guestEmail: "traveltouttarakhand38@gmail.com",
  totalPax: "7 Members",
  totalRooms: "Family Rooms (Innova)",
  tripDuration: "Chardham Yatra Package 10 Days 2026",
  emergencyContact: "Mr. Gagandeep: +91 82660 16066",
  specialInstructions: "• Please present this original voucher with government photo ID at check-in.\n• Standard check-in time 12:00 PM, check-out 10:00 AM.\n• Pure vegetarian meals served across all destinations.\n• Non-AC rooms in mountain sectors.",
  inclusions: "• Confirmed Hotel accommodation across Barkot, Uttarkashi, Phata, Kedarnath (Tent Only), Badrinath & Pipalkoti.\n• Dedicated Innova with driver Haridwar to Haridwar.\n• All tolls, parking, interstate taxes included.",
  stays: [
    {
      id: "stay-act-1",
      nightsLabel: "Night 1 & 2 (14-15 May)",
      city: "Barkot / Yamunotri",
      hotelName: "Hotel Sarutal",
      hotelAddress: "Barkot, Yamunotri Road",
      contactNo: "7818854893",
      checkIn: "14/05/2026 (12:00 PM)",
      checkOut: "16/05/2026 (08:00 AM)",
      nights: 2,
      roomType: "Standard Rooms",
      noOfRooms: "Family Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-SAR-604",
      specialRequest: "Early breakfast for Yamunotri trek"
    },
    {
      id: "stay-act-2",
      nightsLabel: "Night 3 & 4 (16-17 May)",
      city: "Uttarkashi / Gangotri",
      hotelName: "Hotel Skyline",
      hotelAddress: "Uttarkashi, Gangotri Highway",
      contactNo: "8923184251",
      checkIn: "16/05/2026 (01:00 PM)",
      checkOut: "18/05/2026 (07:30 AM)",
      nights: 2,
      roomType: "Standard Rooms",
      noOfRooms: "Family Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-SKY-604",
      specialRequest: "Kashi Vishwanath Darshan & Gangotri trip"
    },
    {
      id: "stay-act-3",
      nightsLabel: "Night 5 (18 May)",
      city: "Phata / Guptkashi",
      hotelName: "Hotel Maa Paa",
      hotelAddress: "Phata, Kedarnath Route",
      contactNo: "9634528441",
      checkIn: "18/05/2026 (02:00 PM)",
      checkOut: "19/05/2026 (06:00 AM)",
      nights: 1,
      roomType: "Standard Rooms",
      noOfRooms: "Family Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-MP-604",
      specialRequest: "Early morning transfer to Sonprayag / Gaurikund"
    },
    {
      id: "stay-act-4",
      nightsLabel: "Night 6 (19 May)",
      city: "Kedarnath Base / Top",
      hotelName: "Bhagwari Ji (Kedarnath Tent Only)",
      hotelAddress: "Near Shri Kedarnath Temple",
      contactNo: "9068648285",
      checkIn: "19/05/2026 (04:00 PM)",
      checkOut: "20/05/2026 (07:00 AM)",
      nights: 1,
      roomType: "Tent Only",
      noOfRooms: "Group Sharing",
      mealPlan: "Room Only",
      confirmationNo: "CONF-BHAG-604",
      specialRequest: "Evening Aarti & Darshan assistance"
    },
    {
      id: "stay-act-5",
      nightsLabel: "Night 7 (20 May)",
      city: "Phata / Guptkashi",
      hotelName: "Hotel Maa Paa",
      hotelAddress: "Phata, Kedarnath Route",
      contactNo: "9634528441",
      checkIn: "20/05/2026 (02:00 PM)",
      checkOut: "21/05/2026 (08:00 AM)",
      nights: 1,
      roomType: "Standard Rooms",
      noOfRooms: "Family Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-MP-604B",
      specialRequest: "Hot dinner after Kedarnath descent"
    },
    {
      id: "stay-act-6",
      nightsLabel: "Night 8 (21 May)",
      city: "Badrinath Dham",
      hotelName: "Hotel Dhansree",
      hotelAddress: "Near Badrinath Temple",
      contactNo: "8395091744",
      checkIn: "21/05/2026 (02:00 PM)",
      checkOut: "22/05/2026 (08:30 AM)",
      nights: 1,
      roomType: "Standard Rooms",
      noOfRooms: "Family Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-DHAN-604",
      specialRequest: "Evening Aarti & Mana Village visit"
    },
    {
      id: "stay-act-7",
      nightsLabel: "Night 9 (22 May)",
      city: "Pipal Koti",
      hotelName: "Hotel Dabral",
      hotelAddress: "Pipal Koti, Badrinath Highway",
      contactNo: "7452827619",
      checkIn: "22/05/2026 (03:00 PM)",
      checkOut: "23/05/2026 (08:00 AM)",
      nights: 1,
      roomType: "Standard Rooms",
      noOfRooms: "Family Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-DAB-604",
      specialRequest: "Next day Haridwar drop"
    }
  ]
};

// Actual Old Voucher: Do Dham 6 Days (Bill No. 626 - Mr. Surendar Kumar Patti)
const PRESET_DODHAM_ACTUAL_VOUCHER: HotelVoucherData = {
  voucherNo: "BILL NO. 626",
  tripDates: "14/05/2026 TO 19/05/2026",
  bookingId: "DD-2026-626",
  dateOfIssue: "14 May 2026",
  guestName: "Mr. Surendar Kumar Patti",
  guestPhone: "9777765675",
  guestEmail: "traveltouttarakhand38@gmail.com",
  totalPax: "24+2 Members",
  totalRooms: "Hall Package (Tempo)",
  tripDuration: "Do Dham Yatra Hall Package 6 Days 2026",
  emergencyContact: "Mr. Gagandeep: +91 82660 16066",
  specialInstructions: "• Please carry valid photo ID at all hotels.\n• Hall package accommodation confirmed for group.\n• Early morning departure for Kedarnath & Badrinath Darshan.",
  inclusions: "• Hotel accommodation at Badashu, Kedarnath (Tent Only) & Pipal Koti.\n• Dedicated Tempo Traveller Haridwar to Haridwar.\n• Tolls, parking and driver charges included.",
  stays: [
    {
      id: "stay-dd-1",
      nightsLabel: "Night 1 (14 May)",
      city: "Badashu / Guptkashi",
      hotelName: "Hotel Omkara",
      hotelAddress: "Badashu, Kedarnath Route",
      contactNo: "8923334391",
      checkIn: "14/05/2026 (02:00 PM)",
      checkOut: "15/05/2026 (06:00 AM)",
      nights: 1,
      roomType: "Hall / Group Rooms",
      noOfRooms: "Hall Basis",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-OM-626",
      specialRequest: "Early transfer to Sonprayag"
    },
    {
      id: "stay-dd-2",
      nightsLabel: "Night 2 (15 May)",
      city: "Kedarnath Base / Top",
      hotelName: "Bhagwari Ji (Kedarnath Tent Only)",
      hotelAddress: "Near Kedarnath Temple",
      contactNo: "9068648285",
      checkIn: "15/05/2026 (04:00 PM)",
      checkOut: "16/05/2026 (07:00 AM)",
      nights: 1,
      roomType: "Tent Only",
      noOfRooms: "Group Sharing",
      mealPlan: "Room Only",
      confirmationNo: "CONF-BHAG-626",
      specialRequest: "Evening Aarti & Darshan"
    },
    {
      id: "stay-dd-3",
      nightsLabel: "Night 3 (16 May)",
      city: "Badashu / Guptkashi",
      hotelName: "Hotel Omkara",
      hotelAddress: "Badashu, Kedarnath Route",
      contactNo: "8923334391",
      checkIn: "16/05/2026 (02:00 PM)",
      checkOut: "17/05/2026 (07:30 AM)",
      nights: 1,
      roomType: "Hall / Group Rooms",
      noOfRooms: "Hall Basis",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-OM-626B",
      specialRequest: "Hot meals on arrival after descent"
    },
    {
      id: "stay-dd-4",
      nightsLabel: "Night 4 & 5 (17-18 May)",
      city: "Pipal Koti / Badrinath Sector",
      hotelName: "Hotel Dabral",
      hotelAddress: "Pipal Koti, Badrinath Highway",
      contactNo: "7452827619",
      checkIn: "17/05/2026 (03:00 PM)",
      checkOut: "19/05/2026 (08:00 AM)",
      nights: 2,
      roomType: "Hall / Group Rooms",
      noOfRooms: "Hall Basis",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-DAB-626",
      specialRequest: "Badrinath Darshan & 19th May Haridwar drop"
    }
  ]
};

const PRESET_CHARDHAM_12P_10D: HotelVoucherData = {
  voucherNo: "TV-2026-CH12P",
  tripDates: "May – Oct 2026",
  bookingId: "BKG-CH-12P2026",
  dateOfIssue: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  guestName: "12 Pax Pilgrimage Group",
  guestPhone: "+91 97190 38278",
  guestEmail: "traymbhkamtravels@gmail.com",
  totalPax: "12 Persons",
  totalRooms: "Family Basis Standard Rooms",
  tripDuration: "10 Days / 09 Nights Chardham Tour",
  emergencyContact: "Mr. Gagandeep · +91 82660 16066 (24x7 Chardham Helpline)",
  specialInstructions: "• Please present this original voucher with government photo ID at check-in.\n• Kedarnath Night Stay is Tent Only without food (as per yatra norms).\n• Food arrangements are done at hotel; please reach dining hall on time.\n• Non-AC rooms in all hill areas as per mountain terrain norms.\n• Room sharing is on 2 / 3 / 4 / 6 bed family basis as confirmed.",
  inclusions: "• Confirmed Standard Clean Hotel Accommodation across Barkot, Uttarkashi, Phata, Badrinath & Pipalkoti.\n• Meal Plan: MAP (Breakfast and Dinner at hotels only).\n• Dedicated 12-Pax Tempo Traveller Haridwar to Haridwar.\n• All Interstate Taxes, Tolls, Driver Allowance and Parking included.",
  stays: [
    {
      id: "stay-1",
      nightsLabel: "Night 1 & 2",
      city: "Barkot / Yamunotri Sector",
      hotelName: "Hotel / Camp Standard Clean Resort",
      hotelAddress: "Barkot - Kharadi, Yamunotri Highway",
      contactNo: "+91 97190 38278",
      checkIn: "Day 1 (12:00 PM)",
      checkOut: "Day 3 (08:00 AM)",
      nights: 2,
      roomType: "Standard Rooms",
      noOfRooms: "Family Basis Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-BR-12P",
      specialRequest: "Early morning breakfast before Janki Chatti / Yamunotri trek"
    },
    {
      id: "stay-2",
      nightsLabel: "Night 3 & 4",
      city: "Uttarkashi / Gangotri Sector",
      hotelName: "Hotel Bhagirathi Standard Clean",
      hotelAddress: "Gangotri Road, Uttarkashi",
      contactNo: "+91 97190 38278",
      checkIn: "Day 3 (01:00 PM)",
      checkOut: "Day 5 (07:30 AM)",
      nights: 2,
      roomType: "Standard Rooms",
      noOfRooms: "Family Basis Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-UK-12P",
      specialRequest: "Visit Kashi Vishwanath Temple & Harsil Valley enroute"
    },
    {
      id: "stay-3",
      nightsLabel: "Night 5 & 7",
      city: "Phata / Rampur / Guptkashi",
      hotelName: "Kedar Valley Standard Comfort Resort",
      hotelAddress: "Phata / Sitapur / Guptkashi Road",
      contactNo: "+91 97190 38278",
      checkIn: "Day 5 (02:00 PM)",
      checkOut: "Day 8 (07:00 AM)",
      nights: 2,
      roomType: "Standard Rooms",
      noOfRooms: "Family Basis Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-PH-12P",
      specialRequest: "Base camp transfer to Sonprayag / Gaurikund"
    },
    {
      id: "stay-4",
      nightsLabel: "Night 6",
      city: "Shri Kedarnath Dham",
      hotelName: "Kedarnath Bhawan / Camp Stay",
      hotelAddress: "Near Shri Kedarnath Ji Temple",
      contactNo: "+91 97190 38278",
      checkIn: "Day 6 (04:00 PM)",
      checkOut: "Day 7 (07:00 AM)",
      nights: 1,
      roomType: "Tent Only",
      noOfRooms: "Sharing Basis",
      mealPlan: "Room Only (Without Food)",
      confirmationNo: "CONF-KD-12P",
      specialRequest: "Darshan assistance & warm bedding arranged"
    },
    {
      id: "stay-5",
      nightsLabel: "Night 8",
      city: "Shri Badrinath Dham",
      hotelName: "Hotel Badri Kedar Standard Clean",
      hotelAddress: "Near Badrinath Temple & Alaknanda River",
      contactNo: "+91 97190 38278",
      checkIn: "Day 8 (02:00 PM)",
      checkOut: "Day 9 (09:00 AM)",
      nights: 1,
      roomType: "Standard Rooms",
      noOfRooms: "Family Basis Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-BD-12P",
      specialRequest: "Taptkund holy bath, Brahma Kamal & Mana Village visit"
    },
    {
      id: "stay-6",
      nightsLabel: "Night 9",
      city: "Pipalkoti / Karanprayag / Rudraprayag",
      hotelName: "Hotel Alaknanda / Similar Standard Clean",
      hotelAddress: "Badrinath - Rishikesh Highway, Pipalkoti",
      contactNo: "+91 97190 38278",
      checkIn: "Day 9 (03:00 PM)",
      checkOut: "Day 10 (07:30 AM)",
      nights: 1,
      roomType: "Standard Rooms",
      noOfRooms: "Family Basis Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-PK-12P",
      specialRequest: "Panch Prayag & Maa Dhari Devi Darshan on way to Haridwar"
    }
  ]
};

const PRESET_CHARDHAM_10D: HotelVoucherData = {
  voucherNo: "TV-2026-CH01",
  tripDates: "12 Sep 2026 to 20 Sep 2026",
  bookingId: "12 Sep 2026 to 20 Sep 2026",
  dateOfIssue: "10 May 2026",
  guestName: "Guest & Family",
  guestPhone: "+91 ",
  guestEmail: "",
  totalPax: "04 Adults",
  totalRooms: "02 Double Rooms",
  tripDuration: "10 Days / 09 Nights Chardham Tour",
  emergencyContact: "Mr. Gagandeep · +91 82660 16066 (24x7 Chardham Helpline)",
  specialInstructions: "• Please present this original voucher with government photo ID at each hotel check-in.\n• Standard check-in time is 12:00 PM and check-out is 10:00 AM.\n• Early check-in is strictly subject to room availability upon arrival.\n• Pure vegetarian meals served across all destinations.",
  inclusions: "• Accommodation on twin sharing basis as per selected categories.\n• Meal Plan: MAP (Daily Bed Tea, Buffet Breakfast & Dinner).\n• All applicable hotel taxes and service charges included.\n• 24x7 on-call ground tour assistance.",
  stays: [
    {
      id: "stay-1",
      nightsLabel: "Night 1",
      city: "Haridwar",
      hotelName: "Hotel Ganga Regency / Similar",
      hotelAddress: "Haridwar Bypass, Near Railway Station",
      contactNo: "+91 98765 43210",
      checkIn: "15 May 2026 (12:00 PM)",
      checkOut: "16 May 2026 (10:00 AM)",
      nights: 1,
      roomType: "Deluxe Room",
      noOfRooms: "02 Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-HW-101",
      specialRequest: "Ground or 1st floor rooms preferred"
    },
    {
      id: "stay-2",
      nightsLabel: "Night 2 & 3",
      city: "Barkot / Yamunotri",
      hotelName: "Camp & Resort Shivalik Heights",
      hotelAddress: "Kharadi, Yamunotri Highway",
      contactNo: "+91 94120 55678",
      checkIn: "16 May 2026 (01:00 PM)",
      checkOut: "18 May 2026 (08:00 AM)",
      nights: 2,
      roomType: "Luxury Cottage",
      noOfRooms: "02 Cottages",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-BR-204",
      specialRequest: "Pack early breakfast for Yamunotri trek"
    },
    {
      id: "stay-3",
      nightsLabel: "Night 4 & 5",
      city: "Uttarkashi / Gangotri",
      hotelName: "Hotel Bhagirathi View",
      hotelAddress: "Netala, Gangotri Road, Uttarkashi",
      contactNo: "+91 97190 11223",
      checkIn: "18 May 2026 (02:00 PM)",
      checkOut: "20 May 2026 (07:00 AM)",
      nights: 2,
      roomType: "River View Executive Room",
      noOfRooms: "02 Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-UK-305",
      specialRequest: ""
    },
    {
      id: "stay-4",
      nightsLabel: "Night 6 & 7",
      city: "Guptkashi / Sitapur",
      hotelName: "Kedar River Retreat",
      hotelAddress: "Sitapur, Near Kedarnath Helipad / Phata",
      contactNo: "+91 98371 44556",
      checkIn: "20 May 2026 (03:00 PM)",
      checkOut: "22 May 2026 (06:00 AM)",
      nights: 2,
      roomType: "Super Deluxe Room",
      noOfRooms: "02 Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-GK-408",
      specialRequest: "Early morning cab transfer to helipad"
    },
    {
      id: "stay-5",
      nightsLabel: "Night 8",
      city: "Badrinath / Pipalkoti",
      hotelName: "Hotel Badri Kedar Haven",
      hotelAddress: "Main Temple Road, Badrinath Dham",
      contactNo: "+91 94111 88990",
      checkIn: "22 May 2026 (02:00 PM)",
      checkOut: "23 May 2026 (09:00 AM)",
      nights: 1,
      roomType: "Heated Premium Deluxe",
      noOfRooms: "02 Rooms",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "CONF-BD-509",
      specialRequest: "Room heaters arranged"
    },
    {
      id: "stay-6",
      nightsLabel: "Night 9",
      city: "Rishikesh",
      hotelName: "Divine Ganga Cottage",
      hotelAddress: "Tapovan, Luxman Jhula Road, Rishikesh",
      contactNo: "+91 135 243 1234",
      checkIn: "23 May 2026 (01:00 PM)",
      checkOut: "24 May 2026 (11:00 AM)",
      nights: 1,
      roomType: "Ganga View Deluxe",
      noOfRooms: "02 Rooms",
      mealPlan: "CP (Breakfast Only)",
      confirmationNo: "CONF-RK-601",
      specialRequest: "Late evening Ganga Aarti timing guidance"
    }
  ]
};

const PRESET_DODHAM_5D: HotelVoucherData = {
  voucherNo: "TV-2026-DD01",
  bookingId: "BKG-DD-5021",
  dateOfIssue: "10 May 2026",
  guestName: "Guest & Family",
  guestPhone: "+91 ",
  guestEmail: "",
  totalPax: "02 Adults",
  totalRooms: "01 Double Room",
  tripDuration: "05 Days / 04 Nights Do Dham Tour (Kedarnath & Badrinath)",
  emergencyContact: "Mr. Gagandeep · +91 82660 16066 (24x7 Chardham Helpline)",
  specialInstructions: "• Please carry valid original government ID.\n• Kedarnath base camp check-in requires biometric yatra pass.\n• Mountain weather can be chilly; warm woolens recommended.",
  inclusions: "• Accommodation in clean deluxe hotels and hill camps.\n• Meal Plan: MAP (Daily Breakfast & Dinner).\n• All local taxes included.",
  stays: [
    {
      id: "stay-1",
      nightsLabel: "Night 1",
      city: "Haridwar / Rishikesh",
      hotelName: "Hotel Ganga Heritage",
      hotelAddress: "Haridwar, Uttarakhand",
      contactNo: "+91 98765 12345",
      checkIn: "15 May 2026 (12:00 PM)",
      checkOut: "16 May 2026 (07:00 AM)",
      nights: 1,
      roomType: "Deluxe Room",
      noOfRooms: "01 Room",
      mealPlan: "MAP",
      confirmationNo: "CONF-HW-51",
      specialRequest: ""
    },
    {
      id: "stay-2",
      nightsLabel: "Night 2 & 3",
      city: "Guptkashi / Sitapur",
      hotelName: "Kedar Valley Camp & Resort",
      hotelAddress: "Sitapur, Near Kedarnath Road",
      contactNo: "+91 98371 99887",
      checkIn: "16 May 2026 (02:00 PM)",
      checkOut: "18 May 2026 (07:00 AM)",
      nights: 2,
      roomType: "Deluxe Room",
      noOfRooms: "01 Room",
      mealPlan: "MAP",
      confirmationNo: "CONF-GK-52",
      specialRequest: ""
    },
    {
      id: "stay-3",
      nightsLabel: "Night 4",
      city: "Pipalkoti / Joshimath",
      hotelName: "Hotel Alaknanda View",
      hotelAddress: "Pipalkoti, Badrinath Highway",
      contactNo: "+91 94120 44332",
      checkIn: "18 May 2026 (03:00 PM)",
      checkOut: "19 May 2026 (08:00 AM)",
      nights: 1,
      roomType: "Super Deluxe Room",
      noOfRooms: "01 Room",
      mealPlan: "MAP",
      confirmationNo: "CONF-PK-53",
      specialRequest: ""
    }
  ]
};

const BLANK_VOUCHER: HotelVoucherData = {
  voucherNo: "TV-2026-001",
  bookingId: "BKG-2026-",
  dateOfIssue: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  guestName: "",
  guestPhone: "",
  guestEmail: "",
  totalPax: "",
  totalRooms: "",
  tripDuration: "",
  emergencyContact: "Mr. Gagandeep · +91 82660 16066 (24x7 Chardham Helpline)",
  specialInstructions: "• Please present this original voucher with government photo ID at each hotel check-in.\n• Standard check-in time is 12:00 PM and check-out is 10:00 AM.\n• Early check-in is strictly subject to room availability upon arrival.",
  inclusions: "• Hotel accommodation as per confirmed room categories.\n• Meals as per specified meal plans (EP/CP/MAP/AP).\n• All applicable hotel taxes included.",
  stays: [
    {
      id: "stay-1",
      nightsLabel: "Night 1",
      city: "",
      hotelName: "",
      hotelAddress: "",
      contactNo: "",
      checkIn: "",
      checkOut: "",
      nights: 1,
      roomType: "",
      noOfRooms: "01 Room",
      mealPlan: "MAP",
      confirmationNo: "",
      specialRequest: ""
    }
  ]
};

export default function HotelVouchersPage() {
  const [activeTab, setActiveTab] = useState<"single" | "group">("group");
  const [data, setData] = useState<HotelVoucherData>(PRESET_CHARDHAM_10D);
  const [groupData, setGroupData] = useState<GroupTravelVoucherData>(PRESET_GROUP_CHARDHAM_28APRIL);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [autoScale, setAutoScale] = useState<number>(0.55);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [fitMode, setFitMode] = useState<"screen" | "width">("screen");
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waPhoneInput, setWaPhoneInput] = useState("");
  const [waRecipientName, setWaRecipientName] = useState("");
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Load saved voucher from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTab = localStorage.getItem("traymbhkam_hotel_active_tab");
        if (savedTab === "single" || savedTab === "group") {
          setActiveTab(savedTab);
        }

        const savedGroup = localStorage.getItem("traymbhkam_group_hotel_voucher");
        if (savedGroup) {
          const parsedGroup = JSON.parse(savedGroup);
          if (parsedGroup && Array.isArray(parsedGroup.allocations) && parsedGroup.allocations.length > 0) {
            setGroupData(parsedGroup);
          }
        }

        const saved = localStorage.getItem("traymbhkam_multi_hotel_voucher");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.stays) && parsed.stays.length > 0) {
            setData(parsed);
            return;
          }
        }

        // Fetch latest saved voucher from Supabase Cloud if available
        const fetchCloudVoucher = async () => {
          try {
            const { data: cloudVoucher } = await supabase
              .from("vouchers")
              .select("document_data")
              .eq("voucher_type", "hotel_tour")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (cloudVoucher && cloudVoucher.document_data && Array.isArray((cloudVoucher.document_data as any).stays)) {
              setData(cloudVoucher.document_data as HotelVoucherData);
              localStorage.setItem("traymbhkam_multi_hotel_voucher", JSON.stringify(cloudVoucher.document_data));
            }
          } catch {}
        };
        fetchCloudVoucher();
      } catch (err) {
        console.warn("Could not load stored hotel voucher:", err);
      }
    }
  }, []);

  // Save changes to localStorage
  const updateData = (newData: HotelVoucherData) => {
    setData(newData);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("traymbhkam_multi_hotel_voucher", JSON.stringify(newData));
      } catch (e) {}
    }
  };

  const updateGroupData = (newData: GroupTravelVoucherData) => {
    setGroupData(newData);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("traymbhkam_group_hotel_voucher", JSON.stringify(newData));
      } catch (e) {}
    }
  };

  const handleTabChange = (tab: "single" | "group") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("traymbhkam_hotel_active_tab", tab);
      } catch (e) {}
    }
  };

  // Group Allocations CRUD
  const addGroupAllocation = () => {
    const nextSno = groupData.allocations.length + 1;
    const newAlloc: GroupMemberAllocation = {
      id: `ga-${Date.now()}`,
      sNo: nextSno,
      billNo: `Bill ${500 + nextSno}`,
      member: "2 Pax",
      bedroom: "1 DOUBLE BEDROOM",
      name: "",
      mobileNo: ""
    };
    updateGroupData({ ...groupData, allocations: [...groupData.allocations, newAlloc] });
  };

  const updateGroupAllocation = (index: number, updated: Partial<GroupMemberAllocation>) => {
    const updatedAllocs = [...groupData.allocations];
    updatedAllocs[index] = { ...updatedAllocs[index], ...updated };
    updateGroupData({ ...groupData, allocations: updatedAllocs });
  };

  const removeGroupAllocation = (index: number) => {
    if (groupData.allocations.length <= 1) {
      alert("At least one booking allocation must be present.");
      return;
    }
    const updatedAllocs = groupData.allocations.filter((_, i) => i !== index).map((row, i) => ({ ...row, sNo: i + 1 }));
    updateGroupData({ ...groupData, allocations: updatedAllocs });
  };

  const moveGroupAllocation = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === groupData.allocations.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...groupData.allocations];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    const reindexed = updated.map((row, i) => ({ ...row, sNo: i + 1 }));
    updateGroupData({ ...groupData, allocations: reindexed });
  };

  // Group Hotel Schedules CRUD
  const addGroupHotel = () => {
    const newHotel: GroupHotelSchedule = {
      id: `gh-${Date.now()}`,
      date: "",
      place: "",
      hotelName: "",
      hotelMobile: ""
    };
    updateGroupData({ ...groupData, hotelSchedules: [...groupData.hotelSchedules, newHotel] });
  };

  const updateGroupHotel = (index: number, updated: Partial<GroupHotelSchedule>) => {
    const updatedHotels = [...groupData.hotelSchedules];
    updatedHotels[index] = { ...updatedHotels[index], ...updated };
    updateGroupData({ ...groupData, hotelSchedules: updatedHotels });
  };

  const removeGroupHotel = (index: number) => {
    if (groupData.hotelSchedules.length <= 1) {
      alert("At least one hotel schedule must be present.");
      return;
    }
    const updatedHotels = groupData.hotelSchedules.filter((_, i) => i !== index);
    updateGroupData({ ...groupData, hotelSchedules: updatedHotels });
  };

  const moveGroupHotel = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === groupData.hotelSchedules.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...groupData.hotelSchedules];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updateGroupData({ ...groupData, hotelSchedules: updated });
  };

  // Excel (.xlsx) File Importer
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      let parsedTitle = "TRAYMBHKAM TOUR AND TRAVELS (reg.)";
      let parsedSubtitle = "CHARDHAM YATRA GROUP PACKAGE 10 DAYS";
      let parsedTransport = "TEMPO TRAVELLER (Non-AC in Hills)";
      let parsedDates = "";
      let parsedAddress = "OPP RAILWAY STATION GATE NO.2 HARIDWAR";
      let parsedEmail = "info@traymbhkam.com";
      let parsedPhones = "MR. GAGANDEEP: +91 82660 16066";
      let parsedCar = "";
      let parsedDriver = "";
      let parsedDriverMobile = "";
      let parsedRemarks = "• Non-AC vehicle operates in hill and mountain terrains as per safety regulations.\n• Kedarnath accommodation is in camps/tents on a sharing basis as per high altitude norms.\n• All guests must carry valid original Government Photo ID (Aadhaar / Voter ID) at each check-in.\n• Group members must adhere to the morning departure timings announced by your tour manager/driver.";

      const allocations: GroupMemberAllocation[] = [];
      const hotelSchedules: GroupHotelSchedule[] = [];

      let inAllocationTable = false;
      let inHotelTable = false;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const firstCell = String(row[0] || "").trim();
        const rowText = row.map(c => String(c || "")).join(" ");

        if (i === 0 && firstCell) {
          parsedTitle = firstCell;
        }
        if (rowText.includes("CHARDHAM") || rowText.includes("YATRA GROUP PACKAGE")) {
          parsedSubtitle = firstCell || rowText.trim();
        }

        if (rowText.includes("TRANSPORTATION") || rowText.includes("YATRA DATE")) {
          const transMatch = rowText.match(/TRANSPORTATION\s*:\s*([^Y]+)/i);
          if (transMatch) parsedTransport = transMatch[1].trim() + " (Non-AC in Hills)";
          const dateMatch = rowText.match(/YATRA DATE\s*:\s*(.+)/i);
          if (dateMatch) parsedDates = dateMatch[1].trim();
        }

        if (row.some(c => String(c).includes("BILLNO") || String(c).includes("BILL NO"))) {
          inAllocationTable = true;
          inHotelTable = false;
          continue;
        }

        if (rowText.includes("TOTAL MEMBER") || rowText.includes("HOTEL DETAILS")) {
          inAllocationTable = false;
        }

        if (row.some(c => String(c).includes("HOTEL NAME"))) {
          inHotelTable = true;
          inAllocationTable = false;
          continue;
        }

        if (rowText.includes("CAR NUMBER")) {
          inHotelTable = false;
          const m = rowText.match(/CAR NUMBER\s*:\s*(.*)/i);
          if (m && m[1].trim()) parsedCar = m[1].trim();
        }
        if (rowText.includes("DRIVER NAME")) {
          const m = rowText.match(/DRIVER NAME\s*:\s*(.*)/i);
          if (m && m[1].trim()) parsedDriver = m[1].trim();
        }
        if (rowText.includes("DRIVER MOBILE")) {
          const m = rowText.match(/DRIVER MOBILE\s*(?:NO\.?)?\s*:\s*(.*)/i);
          if (m && m[1].trim()) parsedDriverMobile = m[1].trim();
        }
        if (rowText.includes("REMARK")) {
          const m = rowText.match(/REMARK\s*:\s*(.*)/i);
          if (m && m[1].trim()) parsedRemarks = m[1].trim() + "\n" + parsedRemarks;
        }

        if (inAllocationTable) {
          const sNo = Number(row[0]) || allocations.length + 1;
          const rawBill = row[1] !== undefined ? String(row[1]).trim() : "";
          const billNo = rawBill ? `Bill ${rawBill}`.replace(/Bill\s*Bill/i, "Bill") : "";
          const rawMember = row[2] !== undefined ? String(row[2]).trim() : "";
          const member = rawMember ? (rawMember.toLowerCase().includes("pax") ? rawMember : `${rawMember} Pax`) : "";
          const bedroom = String(row[3] || "").trim();
          const name = String(row[4] || "").trim();
          const mob = String(row[5] || "").trim();

          if (bedroom || name || billNo) {
            allocations.push({
              id: `ga-${Date.now()}-${allocations.length}`,
              sNo,
              billNo,
              member,
              bedroom,
              name,
              mobileNo: mob
            });
          }
        }

        if (inHotelTable) {
          const dateVal = parseExcelSerialDate(row[0]);
          const place = String(row[1] || "").trim();
          const hotelName = String(row[2] || "").trim();
          const hotelMobile = String(row[3] || "").trim();

          if (place || hotelName || dateVal) {
            hotelSchedules.push({
              id: `gh-${Date.now()}-${hotelSchedules.length}`,
              date: dateVal,
              place,
              hotelName,
              hotelMobile
            });
          }
        }
      }

      const updatedGroupData: GroupTravelVoucherData = {
        voucherTitle: parsedTitle || groupData.voucherTitle,
        subTitle: parsedSubtitle || groupData.subTitle,
        officeAddress: parsedAddress,
        contactEmail: parsedEmail,
        contactPhones: parsedPhones,
        transportType: parsedTransport || groupData.transportType,
        yatraDates: parsedDates || groupData.yatraDates,
        carNumber: parsedCar || groupData.carNumber,
        driverName: parsedDriver || groupData.driverName,
        driverMobile: parsedDriverMobile || groupData.driverMobile,
        remarks: parsedRemarks || groupData.remarks,
        allocations: allocations.length > 0 ? allocations : groupData.allocations,
        hotelSchedules: hotelSchedules.length > 0 ? hotelSchedules : groupData.hotelSchedules
      };

      updateGroupData(updatedGroupData);
      alert(`✓ Successfully imported Excel file!\nLoaded ${allocations.length} sub-group bookings and ${hotelSchedules.length} hotel stays.`);
    } catch (err) {
      alert("Could not parse Excel file: " + (err as Error).message);
    } finally {
      e.target.value = "";
    }
  };

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
  }, [isFormCollapsed, fitMode, data.stays.length]);

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

  // Stay List Management
  const addStay = () => {
    const nextNight = data.stays.length + 1;
    const newStay: HotelStay = {
      id: `stay-${Date.now()}`,
      nightsLabel: `Night ${nextNight}`,
      city: "",
      hotelName: "",
      hotelAddress: "",
      contactNo: "",
      checkIn: "",
      checkOut: "",
      nights: 1,
      roomType: "Standard Room",
      noOfRooms: "01 Room",
      mealPlan: "MAP (Breakfast + Dinner)",
      confirmationNo: "",
      specialRequest: ""
    };
    updateData({ ...data, stays: [...data.stays, newStay] });
  };

  const updateStay = (index: number, updated: Partial<HotelStay>) => {
    const updatedStays = [...data.stays];
    updatedStays[index] = { ...updatedStays[index], ...updated };
    updateData({ ...data, stays: updatedStays });
  };

  const removeStay = (index: number) => {
    if (data.stays.length <= 1) {
      alert("A voucher must have at least one hotel/hostel stay.");
      return;
    }
    const updatedStays = data.stays.filter((_, i) => i !== index);
    updateData({ ...data, stays: updatedStays });
  };

  const duplicateStay = (index: number) => {
    const source = data.stays[index];
    const cloned: HotelStay = {
      ...source,
      id: `stay-${Date.now()}`,
      nightsLabel: `Night ${index + 2}`
    };
    const updatedStays = [...data.stays];
    updatedStays.splice(index + 1, 0, cloned);
    updateData({ ...data, stays: updatedStays });
  };

  const moveStay = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === data.stays.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updatedStays = [...data.stays];
    const temp = updatedStays[index];
    updatedStays[index] = updatedStays[targetIndex];
    updatedStays[targetIndex] = temp;
    updateData({ ...data, stays: updatedStays });
  };

  const totalGroupMembers = groupData.allocations.reduce((sum, item) => {
    const match = item.member ? item.member.match(/(\d+)/) : null;
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);

  // High-Resolution 1-Page PDF Download (Clean A4 without splitting)
  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const elementId = activeTab === "group" ? "print-group-hotel-voucher" : "print-multi-hotel-voucher";
      const element = document.getElementById(elementId);
      if (!element) {
        alert("Could not find the print voucher container.");
        setIsDownloading(false);
        return;
      }

      if (activeTab === "group") {
        try {
          saveDocumentToHub({
            id: `group-hotel-${Date.now()}`,
            type: "hotel_voucher",
            title: `Group Voucher - ${groupData.subTitle || "Chardham Group"}`,
            docNumber: `GRP-${groupData.yatraDates ? groupData.yatraDates.split(" ")[0] : "2026"}`,
            guestName: `${groupData.allocations.length} Sub-Groups (${totalGroupMembers} Pax)`,
            guestPhone: groupData.driverMobile || groupData.contactPhones,
            travelDates: groupData.yatraDates,
            paxCount: `${totalGroupMembers} Pax · ${groupData.allocations.length} Rooms`,
            detailsSummary: `${groupData.transportType} | ${groupData.hotelSchedules.length} Hotels: ${groupData.hotelSchedules.map(h => h.place).filter(Boolean).join(", ")}`,
            studioUrl: "/hotels",
            rawPayload: groupData
          });
        } catch (hubErr) {
          console.warn("Local hub save:", hubErr);
        }
      } else {
        // Record in Supabase if online
        try {
          if (data.guestName) {
            await supabase.from("vouchers").insert({
              voucher_type: "hotel_tour",
              guest_name: data.guestName,
              document_data: data
            });
          }
        } catch (dbError) {
          console.warn("Cloud backup notice:", dbError);
        }

        // Record in local Document Hub
        try {
          saveDocumentToHub({
            id: `hotel-${data.voucherNo || Date.now()}`,
            type: "hotel_voucher",
            title: `Hotel Voucher - ${data.guestName || "Tour"}`,
            docNumber: data.voucherNo || "TV-2026",
            guestName: data.guestName || "Valued Guest",
            guestPhone: data.guestPhone || "",
            travelDates: data.tripDates || data.bookingId || "",
            paxCount: data.totalPax || "",
            detailsSummary: `${data.stays.length} Hotel/Camp Stay(s): ${data.stays.map(s => s.city || s.hotelName).filter(Boolean).join(", ")}`,
            studioUrl: "/hotels",
            rawPayload: data
          });
        } catch (hubErr) {
          console.warn("Local hub save:", hubErr);
        }
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
      
      if (activeTab === "group") {
        const safeDates = groupData.yatraDates ? groupData.yatraDates.replace(/[^a-zA-Z0-9]/g, "_") : "Group";
        pdf.save(`Group_Hotel_Allocation_Voucher_${safeDates}.pdf`);
      } else {
        const safeName = data.guestName ? data.guestName.replace(/[^a-zA-Z0-9]/g, "_") : "Tour";
        pdf.save(`Hotel_Stay_Voucher_${safeName}_${data.voucherNo || "Doc"}.pdf`);
      }
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

  const getVoucherWhatsAppMessage = () => {
    if (activeTab === "group") {
      let message = `*TRAYMBHKAM TOUR AND TRAVELS (reg.)*\n`;
      message += `*GROUP HOTEL & ROOM ALLOCATION VOUCHER*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📋 *Tour:* ${groupData.subTitle}\n`;
      message += `🚌 *Vehicle:* ${groupData.transportType}\n`;
      message += `🗓 *Yatra Dates:* ${groupData.yatraDates}\n`;
      message += `🚗 *Car No:* ${groupData.carNumber || "To be assigned"}\n`;
      message += `👤 *Chauffeur:* ${groupData.driverName || "Assigned Driver"} (${groupData.driverMobile || "Will be shared"})\n\n`;

      message += `*🏨 CONFIRMED HOTEL STAYS:*\n`;
      groupData.hotelSchedules.forEach(h => {
        message += `• ${h.date} (${h.place}): *${h.hotelName}* | Ph: ${h.hotelMobile || "—"}\n`;
      });

      message += `\n*👥 ROOM ALLOCATIONS (${groupData.allocations.length} Rooms / ${totalGroupMembers} Pax):*\n`;
      groupData.allocations.forEach(a => {
        message += `${a.sNo}. ${a.billNo} - *${a.name}* (${a.member}) → ${a.bedroom}${a.mobileNo ? ` [Ph: ${a.mobileNo}]` : ""}\n`;
      });

      message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📞 *Operations Helpline:* ${groupData.contactPhones}\n`;
      message += `📍 *Office:* Opp. Railway Station Gate No. 2, Haridwar\n\n`;
      message += `Wishing everyone a safe, comfortable and divine yatra! 🙏`;
      return message;
    } else {
      let message = `*🏨 HOTEL & STAY SERVICE VOUCHER*\n`;
      message += `*Traymbhkam Tour and Travels*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📋 *Voucher No:* ${data.voucherNo || "N/A"}\n`;
      message += `👤 *Guest Name:* ${data.guestName || "Guest"}\n`;
      message += `👥 *Total Pax:* ${data.totalPax || "N/A"} (${data.totalRooms || "N/A"})\n`;
      message += `🗓 *Duration:* ${data.tripDuration || "Tour Stay"}\n\n`;
      message += `*CONFIRMED HOTEL / HOSTEL STAYS:*\n`;

      data.stays.forEach((stay, idx) => {
        message += `\n📍 *${stay.nightsLabel || `Stop ${idx + 1}`}: ${stay.city || "Destination"}*\n`;
        message += `• *Hotel:* ${stay.hotelName || "Hotel / Resort"}\n`;
        message += `• *Room Category:* ${stay.roomType || "Standard/Deluxe"}\n`;
        message += `• *Check-in:* ${stay.checkIn || "As per itinerary"} | *Check-out:* ${stay.checkOut || "Morning"}\n`;
        message += `• *Meal Plan:* ${stay.mealPlan || "MAP (Breakfast + Dinner)"}\n`;
        if (stay.contactNo) message += `• *Hotel Contact:* ${stay.contactNo}\n`;
      });

      message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📞 *24x7 Operations Helpline:* ${data.emergencyContact || "+91 82660 16066"}\n`;
      message += `📍 *Address:* Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar\n\n`;
      message += `Wishing you a spiritually enriching and divine journey! 🙏🛕`;
      return message;
    }
  };

  const copyVoucherAsImage = async (): Promise<boolean> => {
    try {
      const elementId = activeTab === "group" ? "print-group-hotel-voucher" : "print-multi-hotel-voucher";
      const element = document.getElementById(elementId);
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
      console.warn("copyVoucherAsImage error:", err);
      return false;
    }
  };

  const executeWhatsAppSend = async (targetPhone: string, mode: "pdf" | "image" | "text" = "image") => {
    const cleanPhone = cleanWaPhone(targetPhone);
    if (!cleanPhone) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (mode === "image") {
      const copied = await copyVoucherAsImage();
      const caption = encodeURIComponent(
        `*🏨 CONFIRMED HOTEL STAY VOUCHER*\n*Traymbhkam Tour and Travels*\n\nDear Guest, please find your confirmed hotel stay voucher.\n\nHelpline: +91 82660 16066\n📍 Haridwar, Uttarakhand`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${caption}`, "_blank");
      setShowWhatsAppModal(false);
      if (copied) {
        alert("✓ Voucher image clipboard me copy ho gayi hai!\n\nWhatsApp chat khulte hi sirf 'Ctrl + V' (Paste) dabayein — poori original voucher image aa jayegi aur Send daba dein!");
      }
      return;
    }

    if (mode === "pdf") {
      handleDownloadPdf();
      const briefMessage = `*🏨 HOTEL SERVICE VOUCHER - TRAYMBHKAM TOUR AND TRAVELS*\n\nDear ${data.guestName || "Guest"},\n\nPlease find your official confirmed Hotel Stay Voucher attached (PDF has been downloaded to attach here).\n\n📞 Operations Helpline: ${data.emergencyContact || "+91 82660 16066"}\n📍 Haridwar, Uttarakhand\n\nWishing you a divine and pleasant pilgrimage! 🙏`;
      const encoded = encodeURIComponent(briefMessage);
      window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
      setShowWhatsAppModal(false);
      return;
    }

    const message = getVoucherWhatsAppMessage();
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    setShowWhatsAppModal(false);
  };

  const handleShareWhatsApp = () => {
    if (activeTab === "group") {
      setWaPhoneInput(groupData.driverMobile || groupData.allocations[0]?.mobileNo || "");
      setWaRecipientName(groupData.driverName ? `Driver: ${groupData.driverName}` : "Group Members");
    } else {
      setWaPhoneInput(data.guestPhone || "");
      setWaRecipientName(data.guestName || "Guest");
    }
    setShowWhatsAppModal(true);
  };

  // Render the voucher document - Exactly 1 A4 Page (1122px height) with Zero Cutoff
  const renderVoucherContent = (prefix: string) => (
    <div 
      id={`${prefix}-multi-hotel-voucher`} 
      className="w-[794px] h-[1122px] min-h-[1122px] max-h-[1122px] bg-[#fcfbf9] shadow-2xl shrink-0 px-8 py-6 flex flex-col justify-between relative overflow-hidden text-slate-900 border border-amber-300/70"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        
        {/* TOP SECTION: Header, Meta, Guest & Stays */}
        <div className="space-y-2.5">

          {/* Top Decorative Chevron Band */}
          <div className="w-full flex items-center justify-between gap-2 mb-1">
            <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-[#0f2744] rounded-full" />
            <span className="text-[9.5px] font-display font-black uppercase tracking-[0.25em] text-amber-700">✦ OFFICIAL SERVICE VOUCHER · CONFIRMED ALLOTMENT ✦</span>
            <div className="h-1 flex-1 bg-gradient-to-r from-[#0f2744] via-amber-400 to-amber-500 rounded-full" />
          </div>

          {/* Luxury 2-Row Brand & Operations Header */}
          <div className="border-b-2 border-amber-200/80 pb-2.5 space-y-2">
            {/* ROW 1: Brand Identity & Official Voucher Title */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img src="/logo.png" alt="Traymbhkam Tour and Travels" className="h-14 w-auto object-contain shrink-0 drop-shadow-xs" />
                <div className="min-w-0">
                  <h2 className="text-[19px] font-serif-luxury font-black tracking-tight text-[#0f2744] leading-tight uppercase">
                    Traymbhkam Tour and Travels
                  </h2>
                  <p className="text-[10px] font-display font-bold text-amber-700 tracking-wider uppercase">
                    Spiritual Pilgrimage Stays &amp; Chardham Lodging Network
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
                    ✦ HOTEL SERVICE VOUCHER ✦
                  </span>
                  <span className="text-[8px] font-display uppercase tracking-widest text-slate-300 block mt-0.5">
                    CONFIRMED LODGING ALLOTMENT
                  </span>
                </div>
              </div>
            </div>

            {/* ROW 2: Address & Spacious 24/7 Operations Helpline Card */}
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
                    24x7 Operations Helpline
                  </div>
                  <div className="text-[12px] font-display font-black text-[#0f2744] tracking-tight leading-tight">
                    {data.emergencyContact || "+91 82660 16066"} <span className="font-normal text-[9.5px] text-amber-800">(Mr. Gagandeep)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Meta Bar */}
          <div className="bg-gradient-to-r from-amber-50/80 via-slate-50 to-amber-50/60 border border-amber-200/80 rounded-lg py-1 px-3.5 text-[12px] text-slate-800 flex justify-between items-center font-medium">
            <span>Voucher No: <strong className="text-amber-800 font-bold text-[12.5px]">{data.voucherNo || "N/A"}</strong></span>
            <span>Trip Dates: <strong className="text-slate-900 font-bold text-[12.5px]">{data.tripDates || data.bookingId || "12 Sep 2026 to 20 Sep 2026"}</strong></span>
            <span>Issue Date: <strong className="text-slate-900 font-bold text-[12.5px]">{data.dateOfIssue || "N/A"}</strong></span>
          </div>

          {/* Guest & Trip Details Banner */}
          <div className="border border-slate-200 rounded-lg py-1.5 px-3 bg-slate-50/80 grid grid-cols-2 gap-2.5 text-[12px]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-slate-600 font-medium">Lead Guest:</span>
                <span className="font-bold text-slate-900 text-[12.5px]">{data.guestName || "Valued Traveler"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-slate-600 font-medium">Phone:</span>
                <span className="font-bold text-slate-800 text-[12px]">{data.guestPhone || "Provided on record"}</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-slate-600 font-medium">Duration:</span>
                <span className="font-bold text-amber-800 text-[12.5px]">{data.tripDuration || "Full Tour"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-slate-600 font-medium">Occupancy:</span>
                <span className="font-bold text-slate-800 text-[12px]">{data.totalPax || "N/A"} · {data.totalRooms || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* COMPLETE STAY SCHEDULE TABLE */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-[12.5px] uppercase tracking-wider text-[#0b1320] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>Confirmed Stay Itinerary ({data.stays.length} Destinations / Properties)</span>
              </h3>
              <span className="text-[10.5px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                100% Confirmed
              </span>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-[#0b1320] text-amber-300 font-display text-[11px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-1.5 px-3 w-[15%]">Nights</th>
                    <th className="py-1.5 px-3 w-[18%]">Destination</th>
                    <th className="py-1.5 px-3 w-[37%]">Confirmed Hotel &amp; Location</th>
                    <th className="py-1.5 px-3 w-[30%]">Room &amp; Meal Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.stays.map((stay, idx) => (
                    <tr key={stay.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50/25"}>
                      <td className="py-1.5 px-3 font-bold text-slate-900 align-top">
                        <div className="text-[12.5px] font-bold text-slate-900 leading-tight">{stay.nightsLabel}</div>
                        <div className="text-[10.5px] text-slate-500 font-semibold mt-0.5">
                          {stay.nights} Nt{stay.nights > 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="py-1.5 px-3 font-bold text-amber-800 align-top">
                        <div className="flex items-center gap-1 text-[12.5px] leading-tight">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{stay.city || "—"}</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-3 align-top">
                        <div className="font-bold text-slate-900 text-[12.5px] leading-snug">{stay.hotelName || "Hotel / Camp"}</div>
                        {stay.hotelAddress && (
                          <div className="text-[11px] text-slate-600 font-medium truncate max-w-[270px] leading-tight mt-0.5">
                            📍 {stay.hotelAddress}
                          </div>
                        )}
                        {stay.contactNo && (
                          <div className="text-[11px] text-slate-800 font-bold mt-0.5">
                            📞 {stay.contactNo}
                          </div>
                        )}
                        {stay.specialRequest && (
                          <div className="text-[10px] text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-0.5 inline-block font-semibold">
                            Note: {stay.specialRequest}
                          </div>
                        )}
                      </td>
                      <td className="py-1.5 px-3 align-top">
                        <div className="font-bold text-slate-900 text-[12px] leading-tight">
                          {stay.roomType || "Standard Room"} {stay.noOfRooms ? `(${stay.noOfRooms})` : ""}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                          {stay.mealPlan ? stay.mealPlan : "MAP Plan"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* INCLUSIONS & POLICIES */}
          <div className="grid grid-cols-2 gap-2.5 text-[11px]">
            <div className="space-y-0.5">
              <h4 className="font-bold font-display text-slate-900 uppercase text-[11px] tracking-wider">
                Package Stay Inclusions:
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-0.5 leading-snug text-slate-800 font-medium">
                {data.inclusions.split("\n").filter(Boolean).map((inc, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>{inc.replace(/^•\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-0.5">
              <h4 className="font-bold font-display text-amber-900 uppercase text-[11px] tracking-wider">
                Important Stay Guidelines:
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-0.5 leading-snug text-slate-800 font-medium">
                {data.specialInstructions.split("\n").filter(Boolean).map((ins, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-amber-600 font-bold shrink-0">ℹ</span>
                    <span>{ins.replace(/^•\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Compact Footer Bar */}
        <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-[10.5px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-slate-800 font-bold">Traymbhkam Tour and Travels</span>
            <span>·</span>
            <span>Regd. Pilgrimage Tour Operator</span>
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

  // Render Group Travel Allocation Voucher - Exactly 1 A4 Page (1122px height) matching Excel layout
  const renderGroupVoucherContent = (prefix: string) => {
    return (
      <div 
        id={`${prefix}-group-hotel-voucher`} 
        className="w-[794px] h-[1122px] min-h-[1122px] max-h-[1122px] bg-[#fcfbf9] shadow-2xl shrink-0 px-8 py-6 flex flex-col justify-between relative overflow-hidden text-slate-900 border border-amber-300/70"
        style={{ boxSizing: "border-box" }}
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full space-y-2.5">
          
          {/* TOP SECTION: Header, Sub-Groups & Hotels */}
          <div className="space-y-2.5">

            {/* Top Decorative Chevron Band */}
            <div className="w-full flex items-center justify-between gap-2 mb-1">
              <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-[#0f2744] rounded-full" />
              <span className="text-[9.5px] font-display font-black uppercase tracking-[0.25em] text-amber-700">✦ OFFICIAL GROUP ALLOTMENT VOUCHER ✦</span>
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
                      {groupData.voucherTitle || "TRAYMBHKAM TOUR AND TRAVELS"}
                    </h2>
                    <p className="text-[10px] font-display font-bold text-amber-700 tracking-wider uppercase">
                      {groupData.subTitle || "CHARDHAM YATRA GROUP ALLOCATION ROSTER"}
                    </p>
                    <p className="text-[9px] text-gray-500 font-semibold tracking-wide">
                      Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2022/004983 · 010/RTA/23
                    </p>
                  </div>
                </div>

                {/* Badge */}
                <div className="shrink-0 text-right">
                  <div className="bg-gradient-to-r from-[#0a192f] via-[#0f2744] to-[#0a192f] text-amber-300 border border-amber-400/40 px-4 py-1.5 rounded-xl shadow-xs text-center">
                    <span className="text-[11.5px] font-display font-black uppercase tracking-wider block">
                      ✦ GROUP HOTEL VOUCHER ✦
                    </span>
                    <span className="text-[8px] font-display uppercase tracking-widest text-slate-300 block mt-0.5">
                      {groupData.transportType || "EXCLUSIVE FLEET ALLOCATION"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ROW 2: Address & Spacious 24/7 Operations Helpline Card */}
              <div className="flex items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-2 text-[10.5px] text-slate-700 font-medium min-w-0">
                  <span className="font-bold text-[#0f2744] flex items-center gap-1 shrink-0">
                    📍 Office:
                  </span>
                  <span className="truncate">{groupData.officeAddress}</span>
                </div>

                {/* Generous Helpline Card */}
                <div className="shrink-0 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border border-amber-300/80 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-right">
                    <div className="text-[8.5px] uppercase font-display font-bold text-amber-900 tracking-wider">
                      24x7 Operations Helpline
                    </div>
                    <div className="text-[12px] font-display font-black text-[#0f2744] tracking-tight leading-tight">
                      {groupData.contactPhones} <span className="font-normal text-[9.5px] text-amber-800">(Mr. Gagandeep)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Meta Strip */}
            <div className="bg-gradient-to-r from-amber-50/80 via-slate-50 to-amber-50/60 border border-amber-200/80 rounded-xl py-1.5 px-3.5 text-[12px] text-slate-800 flex justify-between items-center font-medium shadow-2xs">
              <span>Yatra Dates: <strong className="text-amber-800 font-bold text-[13px]">{groupData.yatraDates || "28 APRIL TO 07 MAY 2026"}</strong></span>
              <span>Total Bookings: <strong className="text-slate-900 font-bold">{groupData.allocations.length} Sub-Groups ({totalGroupMembers} Pax)</strong></span>
              <span>Helpline: <strong className="text-slate-900 font-bold">{groupData.contactPhones}</strong></span>
            </div>

            {/* SECTION A: SUB-GROUP ROOM ALLOCATION TABLE */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-[12.5px] uppercase tracking-wider text-[#0b1320] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Sub-Group Room Allocation Roster ({groupData.allocations.length} Bookings · {groupData.allocations.length} Bedrooms)</span>
                </h3>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Confirmed Allotment
                </span>
              </div>

              <div className="rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                <table className="w-full text-left">
                  <thead className="bg-[#0b1320] text-amber-300 font-display text-[11px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-1.5 px-2.5 text-center w-10">S.No</th>
                      <th className="py-1.5 px-2.5 w-24">Bill No.</th>
                      <th className="py-1.5 px-2.5 w-20">Member</th>
                      <th className="py-1.5 px-3 w-48">Bedroom Allocated</th>
                      <th className="py-1.5 px-3">Lead Guest Name</th>
                      <th className="py-1.5 px-3 text-right w-28">Mobile No.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11.5px]">
                    {groupData.allocations.map((alloc, idx) => (
                      <tr key={alloc.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50/25"}>
                        <td className="py-1.2 px-2.5 text-center font-bold text-slate-500">{alloc.sNo || idx + 1}</td>
                        <td className="py-1.2 px-2.5 font-bold text-amber-800 whitespace-nowrap">{alloc.billNo}</td>
                        <td className="py-1.2 px-2.5 font-semibold text-slate-800 whitespace-nowrap">{alloc.member}</td>
                        <td className="py-1.2 px-3 font-bold text-slate-900 whitespace-nowrap">{alloc.bedroom}</td>
                        <td className="py-1.2 px-3 font-bold uppercase text-slate-900 whitespace-nowrap">{alloc.name}</td>
                        <td className="py-1.2 px-3 text-right font-semibold text-slate-700 whitespace-nowrap">{alloc.mobileNo || "—"}</td>
                      </tr>
                    ))}
                    {/* Summary Row */}
                    <tr className="bg-amber-100/60 border-t-2 border-amber-300 font-bold text-slate-900 text-[11.5px]">
                      <td colSpan={2} className="py-1.5 px-2.5 text-center text-amber-900 font-display uppercase font-black">
                        TOTALS
                      </td>
                      <td className="py-1.5 px-2.5 text-amber-900 font-black whitespace-nowrap">
                        {totalGroupMembers} Pax
                      </td>
                      <td className="py-1.5 px-3" colSpan={3}>
                        TOTAL BEDROOMS: <span className="text-amber-900 font-black">{groupData.allocations.length} Bedrooms Confirmed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION B: TOUR HOTEL STAY SCHEDULE */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-[12.5px] uppercase tracking-wider text-[#0b1320] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Tour Hotel &amp; Camp Stay Schedule ({groupData.hotelSchedules.length} Night Halts)</span>
                </h3>
                <span className="text-[10px] text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Complete Tour Route
                </span>
              </div>

              <div className="rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                <table className="w-full text-left">
                  <thead className="bg-[#0b1320] text-amber-300 font-display text-[11px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-1.5 px-3 w-28">Date</th>
                      <th className="py-1.5 px-3 w-40">Place / Sector</th>
                      <th className="py-1.5 px-3">Hotel / Camp Name</th>
                      <th className="py-1.5 px-3 text-right w-40">Hotel Mobile No.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11.5px]">
                    {groupData.hotelSchedules.map((hotel, idx) => (
                      <tr key={hotel.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50/25"}>
                        <td className="py-1.2 px-3 font-bold text-slate-800 whitespace-nowrap">{hotel.date}</td>
                        <td className="py-1.2 px-3 font-bold text-amber-800 whitespace-nowrap uppercase">{hotel.place}</td>
                        <td className="py-1.2 px-3 font-bold text-slate-900">{hotel.hotelName}</td>
                        <td className="py-1.2 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">{hotel.hotelMobile || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION C: DRIVER & VEHICLE BANNER */}
            <div className="border border-amber-200/80 rounded-xl p-2.5 bg-gradient-to-r from-amber-50/70 via-slate-50 to-amber-50/40 grid grid-cols-3 gap-3 shadow-2xs">
              <div>
                <span className="text-[9.5px] text-slate-500 font-bold block uppercase tracking-wider font-display">Car / Vehicle No.</span>
                <span className="font-mono font-black text-[13px] text-amber-800 mt-0.5 block">{groupData.carNumber || "To be assigned"}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 font-bold block uppercase tracking-wider font-display">Driver / Chauffeur Name</span>
                <span className="font-bold text-[13px] text-slate-900 mt-0.5 block">{groupData.driverName || "Assigned Chauffeur"}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 font-bold block uppercase tracking-wider font-display">Driver Mobile No.</span>
                <span className="font-mono font-black text-[13px] text-emerald-800 mt-0.5 block">{groupData.driverMobile || "Will be shared upon arrival"}</span>
              </div>
            </div>

            {/* SECTION D: GUIDELINES & REMARKS */}
            <div className="border border-amber-200 bg-amber-50/80 rounded-xl p-2.5 text-amber-950 space-y-1 shadow-2xs">
              <span className="font-bold text-[11px] uppercase tracking-wider text-amber-900 flex items-center gap-1.5 font-display">
                <span>⚠</span> Tour Guidelines &amp; Hill Regulations:
              </span>
              <div className="whitespace-pre-line leading-relaxed text-slate-800 font-medium text-[10.5px]">
                {groupData.remarks}
              </div>
            </div>

            {/* SECTION E: PILGRIMAGE GREETING & THANK YOU BANNER */}
            <div className="rounded-xl border-2 border-dashed border-amber-300/60 bg-gradient-to-r from-amber-50/90 via-slate-50 to-amber-50/50 p-3 flex items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🙏</span>
                  <h4 className="text-[13px] font-serif-luxury font-black text-[#0b1320] tracking-wide uppercase">
                    Thank You For Travelling With Traymbhkam Tour and Travels!
                  </h4>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                    जय श्री केदार · जय बद्री विशाल
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-snug">
                  It is our utmost privilege to host your sacred Chardham pilgrimage. Wishing you and all group members a blessed, peaceful, and joyful spiritual journey!
                </p>
                <div className="flex items-center gap-3 text-[10px] text-slate-600 font-medium pt-0.5">
                  <span className="text-emerald-800 font-bold">✓ 24/7 Route Assistance</span>
                  <span>·</span>
                  <span className="text-amber-800 font-bold">✓ Pre-Verified Clean Stays</span>
                  <span>·</span>
                  <span className="text-slate-800 font-bold">✓ Dedicated Hill Chauffeur Fleet</span>
                </div>
              </div>

              {/* 24/7 Helpline Badge */}
              <div className="shrink-0 text-center bg-white border border-amber-200 rounded-lg p-2 shadow-2xs w-[165px]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-display">24/7 Control Desk</p>
                <p className="text-[12px] font-mono font-black text-amber-800 mt-0.5 leading-tight">
                  +91 82660 16066
                </p>
                <p className="text-[8.5px] text-emerald-700 font-bold mt-0.5 uppercase tracking-wide">
                  Mr. Gagandeep / Haridwar Desk
                </p>
              </div>
            </div>

          </div>

          {/* BOTTOM SECTION: Sign-off & Footer */}
          <div className="pt-2 border-t-2 border-amber-200/80 flex justify-between items-center text-[10.5px] text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 uppercase">TRAYMBHKAM TOUR AND TRAVELS (reg.)</span>
              <span>·</span>
              <span className="font-bold text-amber-800">
                Purusharthi Market, Haridwar
              </span>
              <span>·</span>
              <span>Haridwar Booking Office</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury font-bold text-slate-700">Page 1 of 1</span>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full h-[calc(100vh-5rem)]">
      
      {/* TOP TABS: Single Family Voucher vs Group Travel Allocation Voucher */}
      <div className="flex flex-wrap items-center justify-between bg-white border border-gray-200 rounded-xl p-2 shadow-2xs shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange("single")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "single"
                ? "bg-[#0369a1] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Single Family / FIT Voucher</span>
          </button>

          <button
            onClick={() => handleTabChange("group")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "group"
                ? "bg-[#0369a1] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Group Travel Room Allocation Voucher</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-400 text-amber-950 rounded font-black uppercase tracking-wider">
              Excel / Group Mode
            </span>
          </button>
        </div>

        {activeTab === "group" && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import Excel Sheet (.xlsx)</span>
              <input 
                type="file" 
                accept=".xlsx,.xls" 
                className="hidden" 
                onChange={handleExcelUpload} 
              />
            </label>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-5 w-full flex-1 min-h-0">
        {/* Left Column: Form Controls */}
        {!isFormCollapsed && (
          <div className="w-full lg:w-[42%] bg-white rounded-2xl shadow-xs border border-gray-100 p-5 overflow-y-auto shrink-0 h-full space-y-4 transition-all duration-300 custom-scrollbar">
            {activeTab === "group" ? (
              <div className="space-y-4 text-xs">
                {/* Header & Quick Preset Bar */}
                <div className="pb-3 border-b border-gray-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900 leading-tight">Group Tour Allocation</h2>
                        <p className="text-xs text-gray-500">Tempo / Bus Room Allotment (12–25+ Pax)</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateGroupData(BLANK_GROUP_VOUCHER)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer border border-gray-200"
                      title="Clear all fields and start fresh"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  </div>

                  {/* Presets & Excel bar */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mr-1">Quick Load:</span>
                    <button
                      onClick={() => updateGroupData(PRESET_GROUP_CHARDHAM_28APRIL)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                      title="Load sample from 28 April Chardham Group Excel"
                    >
                      <span>★ 28 April Chardham Group (Tempo)</span>
                    </button>
                    <label className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition shadow-xs cursor-pointer">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Upload Excel (.xlsx)</span>
                      <input 
                        type="file" 
                        accept=".xlsx,.xls" 
                        className="hidden" 
                        onChange={handleExcelUpload} 
                      />
                    </label>
                  </div>
                </div>

                {/* 1. Tour & Transport Details */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">1. Tour & Vehicle Details</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Tour Title / Headline</label>
                      <input 
                        type="text" 
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1]"
                        value={groupData.subTitle}
                        onChange={e => updateGroupData({ ...groupData, subTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Transportation Type</label>
                      <input 
                        type="text" 
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-800"
                        value={groupData.transportType}
                        onChange={e => updateGroupData({ ...groupData, transportType: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Yatra Travel Dates</label>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold text-[#0369a1]"
                        placeholder="e.g. 28 APRIL TO 07 MAY 2026"
                        value={groupData.yatraDates}
                        onChange={e => updateGroupData({ ...groupData, yatraDates: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Helpline Phone(s)</label>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium"
                        value={groupData.contactPhones}
                        onChange={e => updateGroupData({ ...groupData, contactPhones: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Sub-Group Allocations */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#0369a1] uppercase tracking-wider block">
                        2. Sub-Group Allocations ({groupData.allocations.length} Bookings · {totalGroupMembers} Pax)
                      </span>
                      <span className="text-[10px] text-gray-500">Each family / bill gets assigned room</span>
                    </div>
                    <button
                      type="button"
                      onClick={addGroupAllocation}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#0369a1] hover:bg-[#025684] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Booking</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {groupData.allocations.map((alloc, idx) => (
                      <div key={alloc.id || idx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-[#0369a1] text-white flex items-center justify-center font-bold text-[10px]">
                              {alloc.sNo || idx + 1}
                            </span>
                            <input
                              type="text"
                              placeholder="Bill No."
                              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1] w-24"
                              value={alloc.billNo}
                              onChange={e => updateGroupAllocation(idx, { billNo: e.target.value })}
                            />
                            <input
                              type="text"
                              placeholder="Pax"
                              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 w-20"
                              value={alloc.member}
                              onChange={e => updateGroupAllocation(idx, { member: e.target.value })}
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveGroupAllocation(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 hover:bg-gray-200 text-gray-500 rounded disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveGroupAllocation(idx, "down")}
                              disabled={idx === groupData.allocations.length - 1}
                              className="p-1 hover:bg-gray-200 text-gray-500 rounded disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeGroupAllocation(idx)}
                              className="p-1 hover:bg-red-100 text-red-500 rounded cursor-pointer"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9.5px] text-gray-500 mb-0.5">Bedroom Type</label>
                            <input
                              type="text"
                              placeholder="e.g. 1 FOUR BEDROOM"
                              className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-900"
                              value={alloc.bedroom}
                              onChange={e => updateGroupAllocation(idx, { bedroom: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] text-gray-500 mb-0.5">Lead Guest Name</label>
                            <input
                              type="text"
                              placeholder="e.g. VIJAY KUMAR"
                              className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold uppercase text-gray-900"
                              value={alloc.name}
                              onChange={e => updateGroupAllocation(idx, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] text-gray-500 mb-0.5">Mobile No.</label>
                            <input
                              type="text"
                              placeholder="e.g. 8294655064"
                              className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-800"
                              value={alloc.mobileNo}
                              onChange={e => updateGroupAllocation(idx, { mobileNo: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Tour Hotel Stay Schedule */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#0369a1] uppercase tracking-wider block">
                        3. Hotel Stay Schedule ({groupData.hotelSchedules.length} Night Halts)
                      </span>
                      <span className="text-[10px] text-gray-500">Dates, Destinations & Hotel Contacts</span>
                    </div>
                    <button
                      type="button"
                      onClick={addGroupHotel}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#0369a1] hover:bg-[#025684] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Hotel</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {groupData.hotelSchedules.map((hotel, idx) => (
                      <div key={hotel.id || idx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-1">
                            <input
                              type="text"
                              placeholder="Date (e.g. 28/04/2026)"
                              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-800 w-28"
                              value={hotel.date}
                              onChange={e => updateGroupHotel(idx, { date: e.target.value })}
                            />
                            <input
                              type="text"
                              placeholder="Place (e.g. BARKOT)"
                              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1] uppercase flex-1"
                              value={hotel.place}
                              onChange={e => updateGroupHotel(idx, { place: e.target.value })}
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveGroupHotel(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 hover:bg-gray-200 text-gray-500 rounded disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveGroupHotel(idx, "down")}
                              disabled={idx === groupData.hotelSchedules.length - 1}
                              className="p-1 hover:bg-gray-200 text-gray-500 rounded disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeGroupHotel(idx)}
                              className="p-1 hover:bg-red-100 text-red-500 rounded cursor-pointer"
                              title="Delete Stay"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9.5px] text-gray-500 mb-0.5">Hotel / Camp Name</label>
                            <input
                              type="text"
                              placeholder="e.g. HOTEL TRISHUL"
                              className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-900"
                              value={hotel.hotelName}
                              onChange={e => updateGroupHotel(idx, { hotelName: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] text-gray-500 mb-0.5">Hotel Mobile No.</label>
                            <input
                              type="text"
                              placeholder="e.g. 8392932020"
                              className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-emerald-800"
                              value={hotel.hotelMobile}
                              onChange={e => updateGroupHotel(idx, { hotelMobile: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Driver & Fleet Information */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">4. Driver & Fleet Details</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9.5px] text-gray-500 mb-0.5">Car / Vehicle No.</label>
                      <input
                        type="text"
                        placeholder="e.g. UK 07 TA 4821"
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-mono font-bold text-[#0369a1]"
                        value={groupData.carNumber}
                        onChange={e => updateGroupData({ ...groupData, carNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] text-gray-500 mb-0.5">Chauffeur Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Dharmendra Singh"
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-gray-900"
                        value={groupData.driverName}
                        onChange={e => updateGroupData({ ...groupData, driverName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] text-gray-500 mb-0.5">Driver Mobile No.</label>
                      <input
                        type="text"
                        placeholder="e.g. 9411582310"
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-mono font-bold text-emerald-800"
                        value={groupData.driverMobile}
                        onChange={e => updateGroupData({ ...groupData, driverMobile: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9.5px] text-gray-500 mb-0.5">Remarks & Mountain Guidelines</label>
                    <textarea
                      rows={4}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-800"
                      value={groupData.remarks}
                      onChange={e => updateGroupData({ ...groupData, remarks: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Header & Quick Preset Bar */}
                <div className="pb-3 border-b border-gray-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0369a1] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">Hotel Voucher Studio</h1>
                  <p className="text-xs text-gray-500">Multi-Hotel Tour Accommodation (5–10+ Days)</p>
                </div>
              </div>
              <button
                onClick={() => updateData(BLANK_VOUCHER)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer border border-gray-200"
                title="Clear all fields and start fresh"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mr-1">Quick Load:</span>
              <button
                onClick={() => updateData(PRESET_CHARDHAM_ACTUAL_VOUCHER)}
                className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-bold transition shadow-xs cursor-pointer"
                title="Client Voucher: Chardham 10D (Bill 604 - Mr. Jayesh Patel, Hotel Sarutal, Skyline, Maa Paa, Dhansree)"
              >
                ★ Chardham 10D (Bill 604)
              </button>
              <button
                onClick={() => updateData(PRESET_DODHAM_ACTUAL_VOUCHER)}
                className="px-2 py-1 bg-purple-600 text-white hover:bg-purple-700 rounded text-xs font-bold transition shadow-xs cursor-pointer"
                title="Client Voucher: Do Dham 6D (Bill 626 - Mr. Surendar Patti, Hotel Omkara, Dabral)"
              >
                ★ Do Dham 6D (Bill 626)
              </button>
              <button
                onClick={() => updateData(PRESET_CHARDHAM_12P_10D)}
                className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded text-xs font-semibold transition cursor-pointer"
                title="10 Days / 9 Nights Chardham for 12 Pax Tempo Traveller"
              >
                10D Chardham (12 Pax Standard)
              </button>
              <button
                onClick={() => updateData(PRESET_CHARDHAM_10D)}
                className="px-2 py-1 bg-sky-50 text-[#0369a1] hover:bg-sky-100 border border-sky-200 rounded text-xs font-semibold transition cursor-pointer"
              >
                10D Chardham (4 Pax)
              </button>
              <button
                onClick={() => updateData(PRESET_DODHAM_5D)}
                className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded text-xs font-semibold transition cursor-pointer"
              >
                5D Do Dham
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* 1. Voucher Meta Details */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">1. Voucher & Booking Details</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Voucher No.</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" 
                    value={data.voucherNo} 
                    onChange={e => updateData({ ...data, voucherNo: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Trip Dates</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold text-[#0369a1]" 
                    placeholder="e.g. 12 Sep 2026 to 20 Sep 2026"
                    value={data.tripDates ?? data.bookingId ?? ""} 
                    onChange={e => updateData({ ...data, tripDates: e.target.value, bookingId: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Issue Date</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                    value={data.dateOfIssue} 
                    onChange={e => updateData({ ...data, dateOfIssue: e.target.value })} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Tour Name / Duration</label>
                <input 
                  type="text" 
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1]" 
                  placeholder="e.g. 10 Days / 09 Nights Chardham Deluxe Tour" 
                  value={data.tripDuration} 
                  onChange={e => updateData({ ...data, tripDuration: e.target.value })} 
                />
              </div>
            </div>

            {/* 2. Lead Guest Details */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">2. Guest & Pax Information</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Lead Guest Name</label>
                  <input 
                    type="text" 
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-gray-900" 
                    placeholder="e.g. Mr. Rajesh Sharma" 
                    value={data.guestName} 
                    onChange={e => updateData({ ...data, guestName: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Phone / WhatsApp</label>
                  <input 
                    type="text" 
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                    placeholder="+91 98765 43210" 
                    value={data.guestPhone} 
                    onChange={e => updateData({ ...data, guestPhone: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Total Pax</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                    placeholder="e.g. 04 Adults, 01 Child" 
                    value={data.totalPax} 
                    onChange={e => updateData({ ...data, totalPax: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Rooms Count</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                    placeholder="e.g. 02 Double Rooms" 
                    value={data.totalRooms} 
                    onChange={e => updateData({ ...data, totalRooms: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            {/* 3. MULTI-HOTEL / HOSTEL STAYS LIST */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0369a1] uppercase tracking-wider block">
                  3. Confirmed Stays ({data.stays.length} Hotels / Hostels)
                </span>
                <button
                  type="button"
                  onClick={addStay}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#0369a1] hover:bg-[#025684] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stay</span>
                </button>
              </div>

              {data.stays.map((stay, idx) => (
                <div key={stay.id || idx} className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2.5 relative">
                  
                  {/* Top Bar for this stay */}
                  <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#0369a1] text-white text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input 
                        type="text" 
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1] w-32" 
                        placeholder="Night 1" 
                        value={stay.nightsLabel} 
                        onChange={e => updateStay(idx, { nightsLabel: e.target.value })} 
                      />
                      <input 
                        type="text" 
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-800 w-36" 
                        placeholder="City (e.g. Barkot)" 
                        value={stay.city} 
                        onChange={e => updateStay(idx, { city: e.target.value })} 
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveStay(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 hover:bg-gray-200 text-gray-500 rounded disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStay(idx, "down")}
                        disabled={idx === data.stays.length - 1}
                        className="p-1 hover:bg-gray-200 text-gray-500 rounded disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateStay(idx)}
                        className="p-1 hover:bg-gray-200 text-gray-500 rounded cursor-pointer"
                        title="Duplicate this stay"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStay(idx)}
                        className="p-1 hover:bg-red-100 text-red-500 rounded cursor-pointer"
                        title="Delete stay"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Hotel Name & Address */}
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Hotel / Hostel / Camp Name</label>
                    <input 
                      type="text" 
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-gray-900" 
                      placeholder="e.g. Hotel Shivalik Heights" 
                      value={stay.hotelName} 
                      onChange={e => updateStay(idx, { hotelName: e.target.value })} 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Hotel Address / Landmark</label>
                    <input 
                      type="text" 
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                      placeholder="e.g. Main Highway, Barkot, Uttarakhand" 
                      value={stay.hotelAddress} 
                      onChange={e => updateStay(idx, { hotelAddress: e.target.value })} 
                    />
                  </div>

                  {/* Nights Count, Room Category, Rooms Count, Meal Plan */}
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Nights</label>
                      <input 
                        type="number" 
                        min={1} 
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1]" 
                        value={stay.nights} 
                        onChange={e => updateStay(idx, { nights: Number(e.target.value) || 1 })} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Room Category</label>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                        placeholder="Standard Room" 
                        value={stay.roomType} 
                        onChange={e => updateStay(idx, { roomType: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Rooms Count</label>
                      <input 
                        type="text" 
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                        placeholder="02 Rooms" 
                        value={stay.noOfRooms} 
                        onChange={e => updateStay(idx, { noOfRooms: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Meal Plan</label>
                      <select
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold text-emerald-700"
                        value={stay.mealPlan}
                        onChange={e => updateStay(idx, { mealPlan: e.target.value })}
                      >
                        <option value="MAP (Breakfast + Dinner)">MAP (Breakfast + Dinner)</option>
                        <option value="CP (Bed & Breakfast)">CP (Bed & Breakfast)</option>
                        <option value="AP (All Meals)">AP (All Meals)</option>
                        <option value="EP (Room Only)">EP (Room Only)</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Category Chips with Tent Only */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-medium">Category:</span>
                    {["Standard Room", "Tent Only", "Deluxe Room", "Family Quad", "Hall / Group Rooms"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => updateStay(idx, { 
                          roomType: cat,
                          ...(cat === "Tent Only" ? { mealPlan: "EP (Room Only)" } : {})
                        })}
                        className={`text-[9.5px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
                          stay.roomType === cat 
                            ? "bg-amber-600 text-white border-amber-600 font-bold shadow-xs" 
                            : cat === "Tent Only"
                            ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 font-semibold"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {cat === "Tent Only" ? "⛺ Tent Only" : cat}
                      </button>
                    ))}
                  </div>

                  {/* Hotel Phone */}
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Hotel Phone / Reception</label>
                    <input 
                      type="text" 
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                      placeholder="+91 94120 XXXXX" 
                      value={stay.contactNo} 
                      onChange={e => updateStay(idx, { contactNo: e.target.value })} 
                    />
                  </div>

                  {/* Special Requests / Notes */}
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Special Requests / Room Preferences</label>
                    <input 
                      type="text" 
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs" 
                      placeholder="e.g. Ground floor for senior citizen / river facing" 
                      value={stay.specialRequest || ""} 
                      onChange={e => updateStay(idx, { specialRequest: e.target.value })} 
                    />
                  </div>

                </div>
              ))}
            </div>

            {/* 4. Inclusions & Policies */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">4. Inclusions & Stay Policies</span>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Inclusions (one per line)</label>
                <textarea 
                  rows={3} 
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs leading-relaxed" 
                  value={data.inclusions} 
                  onChange={e => updateData({ ...data, inclusions: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Important Guidelines (one per line)</label>
                <textarea 
                  rows={3} 
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs leading-relaxed" 
                  value={data.specialInstructions} 
                  onChange={e => updateData({ ...data, specialInstructions: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">24x7 Emergency Contact</label>
                <input 
                  type="text" 
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" 
                  value={data.emergencyContact} 
                  onChange={e => updateData({ ...data, emergencyContact: e.target.value })} 
                />
              </div>
            </div>

          </div>
              </>
            )}
        </div>
      )}

      {/* Right Column: Live Centered Preview */}
      <div className={`flex flex-col gap-3 transition-all duration-300 h-full ${isFormCollapsed ? "w-full" : "w-full lg:w-[58%]"}`}>
        
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
              title="Zoom to Fit Width"
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
              title="Fit Page on Screen"
            >
              Fit Page
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Share confirmed hotels via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadPdf}
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
              {activeTab === "group" ? renderGroupVoucherContent("view") : renderVoucherContent("view")}
            </div>
          </div>
        </div>

      </div>

      </div>

      {/* Hidden Print Container for Multi-Page PDF Export */}
      <div className="fixed -left-[99999px] top-0 pointer-events-none opacity-100 z-[-100]">
        {renderVoucherContent("print")}
        {renderGroupVoucherContent("print")}
      </div>

      {/* WhatsApp Direct Share Modal */}
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
                    {activeTab === "group" ? "Share Group Hotel Voucher on WhatsApp" : "Share Hotel Stay Voucher on WhatsApp"}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Direct chat with customer / driver (no searching needed)
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

            {activeTab === "group" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">Quick Select Recipient:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setWaPhoneInput(groupData.driverMobile || "");
                      setWaRecipientName(`Driver: ${groupData.driverName || "Driver"}`);
                    }}
                    className="p-2 rounded-lg border border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-left transition cursor-pointer"
                  >
                    <span className="font-bold text-sky-900 block truncate">🚗 Chauffeur / Driver</span>
                    <span className="text-[11px] text-gray-600 font-mono">{groupData.driverMobile || "No mobile"}</span>
                  </button>

                  {groupData.allocations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const m = groupData.allocations[0];
                        setWaPhoneInput(m.mobileNo || "");
                        setWaRecipientName(`Guest: ${m.name}`);
                      }}
                      className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition cursor-pointer"
                    >
                      <span className="font-bold text-emerald-900 block truncate">👤 {groupData.allocations[0].name || "Lead Guest"}</span>
                      <span className="text-[11px] text-gray-600 font-mono">{groupData.allocations[0].mobileNo || "No mobile"}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                WhatsApp Mobile Number:
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
                    if (activeTab === "single") {
                      updateData({ ...data, guestPhone: e.target.value });
                    }
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-500">
                Direct WhatsApp link banega jisse contact search karne ki zaroorat nahi hogi.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => executeWhatsAppSend(waPhoneInput, "image")}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <span>🖼️</span>
                <span>Send as Full Voucher Image (Paste with Ctrl+V)</span>
              </button>

              <button
                onClick={() => executeWhatsAppSend(waPhoneInput, "pdf")}
                className="w-full flex items-center justify-center gap-2 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-sky-700" />
                <span>📥 Download PDF Voucher & Open WhatsApp</span>
              </button>

              <button
                onClick={() => executeWhatsAppSend(waPhoneInput, "text")}
                className="w-full flex items-center justify-center gap-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-[11px] font-medium transition cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
                <span>Open WhatsApp with Text Details Only</span>
              </button>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[10px] text-amber-900 leading-snug">
              💡 <strong>Instant Image Tip:</strong> First button par click karein, WhatsApp chat khulte hi <strong>Ctrl + V</strong> dabayein — poori original color voucher photo automatically paste ho jayegi!
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
