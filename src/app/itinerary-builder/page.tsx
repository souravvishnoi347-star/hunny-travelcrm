"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Download, 
  Loader2, 
  Plus, 
  Trash2, 
  Map, 
  Sparkles, 
  X, 
  MessageCircle, 
  Share2, 
  Check, 
  RotateCcw,
  Eye,
  Calendar,
  User,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Phone,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Key,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Upload,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Wand2,
  Tag,
  Filter,
  RefreshCw,
  Car,
  Award,
  Compass,
  Star
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveDocumentToHub } from "@/lib/documentsHub";
import { 
  getStoredDhamGallery, 
  saveStoredDhamGallery, 
  pickDhamPhotosForItinerary, 
  DhamGalleryPhoto, 
  DHAM_CATEGORIES 
} from "@/lib/dhamGallery";

export interface ItineraryPhoto {
  id: string;
  url: string;
  caption: string;
  position?: "center" | "top" | "bottom";
  fit?: "cover" | "contain";
}

export interface HotelPhoto {
  id: string;
  url: string;
  hotelName: string;
  location: string;
  roomType?: string;
  caption?: string;
  fit?: "cover" | "contain";
  position?: "center" | "top" | "bottom";
}

export interface DayPlan {
  id: number;
  dayNumber: number;
  dateStr: string;
  route: string;
  activities: string[];
  overnightStay: string;
}

export interface PricingTier {
  package: string;
  price: string;
  hotelCategory: string;
  meals: string;
  specialFeature: string;
}

export interface ItineraryData {
  title: string;
  subTitle: string;
  spiritualHeadline: string;
  dhamsSubtitle: string;
  preparedFor: string;
  travelDates: string;
  duration: string;
  startingPoint: string;
  routeCovered: string;
  overviewSummary: string;
  
  // Glance section
  glanceDuration: string;
  glanceDhams: string;
  glanceSector: string;
  glanceStartEnd: string;
  glancePackages: string;

  // Day plans
  days: DayPlan[];

  // Pricing
  pricingSubtitle: string;
  pricingTiers: PricingTier[];
  pricingNote: string;

  // Inclusions & Exclusions
  inclusions: string[];
  exclusions: string[];

  // Policies & Contact
  goodToKnow: string[];
  bookingPayment: string[];
  contactAgency: string;
  contactPerson: string;
  contactPhone: string;
  motto: string;

  // Visual Photos & Gallery
  photos?: ItineraryPhoto[];
  showPhotosPage1?: boolean;
  showPhotosPage3?: boolean;
  hotelPhotos?: HotelPhoto[];
  showHotelPhotos?: boolean;

  // Trust & Credentials (Owner Photo, Certificates, Office Image)
  trustPhotos?: {
    ownerPhoto?: string;
    ownerName?: string;
    ownerTitle?: string;
    certificatePhoto?: string;
    certificateCaption?: string;
    certificate2Photo?: string;
    certificate2Caption?: string;
    officePhoto?: string;
    officeCaption?: string;
    vehiclePhoto?: string;
    vehicleCaption?: string;
  };
  showTrustSection?: boolean;
}

export const DEFAULT_TRUST_PHOTOS = {
  ownerPhoto: "/certificates/owner.jpeg",
  ownerName: "Mr. Gagandeep",
  ownerTitle: "Founder & Managing Director",
  certificatePhoto: "/certificates/uttrakhand_tourism.jpeg",
  certificateCaption: "Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2022/004983",
  certificate2Photo: "/certificates/certificate.jpeg",
  certificate2Caption: "Dehradun Transport Authority License: 010/RTA/23",
  officePhoto: "/certificates/office_front.jpeg",
  officeCaption: "Shop 38, Pursharthi Market, Opp. Railway Station Gate No. 2, Haridwar",
  vehiclePhoto: "/gallery/traymbhkam_fleet_lineup.png",
  vehicleCaption: "Traymbhkam Dedicated Mountain Fleet (Tempo Traveller & Hill Cabs)"
};

export const CURATED_HOTEL_PHOTO_PRESETS: HotelPhoto[] = [
  {
    id: "hp-1",
    url: "/hotels_custom/hotel_stay_2.jpeg",
    hotelName: "Standard Clean Stay",
    location: "Barkot / Uttarkashi",
    roomType: "Standard Triple / Quad Room",
    caption: "Spacious clean rooms with comfortable beds, attached washroom & 24/7 hot water"
  },
  {
    id: "hp-2",
    url: "/hotels_custom/hotel_stay_4.jpeg",
    hotelName: "Standard Mountain View Stay",
    location: "Guptkashi / Sitapur",
    roomType: "Standard Double Room",
    caption: "Cozy rooms with valley views, fresh clean linen, geyser & peaceful mountain ambiance"
  },
  {
    id: "hp-3",
    url: "/hotels_custom/hotel_stay_3.jpeg",
    hotelName: "Standard Family Stay",
    location: "Badrinath / Pipalkoti",
    roomType: "Standard Family Room",
    caption: "Hygienic verified family rooms with warm blankets and personalized hill hospitality"
  },
  {
    id: "hp-4",
    url: "/gallery/kedarnath_alpine_tent.jpg",
    hotelName: "Kedarnath Base Camp / Alpine Stay",
    location: "Kedarnath Dham",
    roomType: "Tent Only (Without Food)",
    caption: "High-altitude mountain alpine camp / Swiss tents with warm bedding near shrine"
  }
];

// Exact preset matching the client's official 09 Nights / 10 Days Chardham Yatra 2026 Plan (Traymbhkam Tour and Travels)
const CHARDHAM_PRESET: ItineraryData = {
  title: "CHARDHAM YATRA 2026",
  subTitle: "UTTARAKHAND",
  spiritualHeadline: "09 Nights · 10 Days Spiritual Journey",
  dhamsSubtitle: "Yamunotri · Gangotri · Kedarnath · Badrinath",
  preparedFor: "Valued Guest",
  travelDates: "May – Oct 2026 Season",
  duration: "09 Nights / 10 Days",
  startingPoint: "Haridwar, Uttarakhand",
  routeCovered: "Haridwar – Mussoorie (Kempty Falls) – Barkot – Yamunotri – Uttarkashi – Harsil – Gangotri – Guptkashi – Kedarnath – Chopta – Pipalkoti – Badrinath – Mana Village – Dhari Devi – Haridwar",
  overviewSummary: "A sacred 09 Nights / 10 Days Char Dham Yatra covering all four revered Himalayan shrines — Yamunotri, Gangotri, Kedarnath, and Badrinath — starting and concluding at Haridwar. Thoughtfully paced with comfortable overnight stays at Barkot (2N), Uttarkashi (2N), Guptkashi (2N), Kedarnath (1N Tent), and Pipalkoti (2N) for a peaceful and well-acclimatized pilgrimage.",
  
  glanceDuration: "09 Nights / 10 Days",
  glanceDhams: "Yamunotri · Gangotri · Kedarnath · Badrinath",
  glanceSector: "Haridwar ⇄ Complete Chardham Circuit",
  glanceStartEnd: "Haridwar (Pickup & Drop)",
  glancePackages: "Standard Package",

  days: [
    {
      id: 1,
      dayNumber: 1,
      dateStr: "Arrival & The Ascent",
      route: "Haridwar → Mussoorie & Kempty Falls → Barkot",
      activities: [
        "Leave the plains of Haridwar and climb into the scenic Shivalik ranges via Mussoorie.",
        "Stop at the cascading Kempty Falls en route for refreshments and mountain photography.",
        "Arrive in Barkot (the gateway to Yamunotri with views of Bandarpunch peak); check in at the hotel and spend the evening acclimatizing."
      ],
      overnightStay: "Barkot (Hotel)"
    },
    {
      id: 2,
      dayNumber: 2,
      dateStr: "The First Dham – Yamunotri",
      route: "Barkot → Janki Chatti → Yamunotri Dham → Barkot (36 km Drive + 6 km Trek)",
      activities: [
        "Early morning 36 km drive to Janki Chatti and begin the 6 km trek (one way) to Shri Yamunotri Dham (via trek, pony, or palki).",
        "Visit the sacred Yamunotri Temple and offer prayers to Goddess Yamuna.",
        "Witness the thermal hot springs of Surya Kund (where rice/potatoes are cooked as Prasad) and worship Divya Shila.",
        "Trek back to Janki Chatti and drive back to Barkot for dinner and overnight stay."
      ],
      overnightStay: "Barkot (Hotel)"
    },
    {
      id: 3,
      dayNumber: 3,
      dateStr: "River Valleys",
      route: "Barkot → Bhagirathi River Valley → Uttarkashi",
      activities: [
        "Post breakfast, check out from Barkot and enjoy a scenic drive along the banks of the holy Bhagirathi River to Uttarkashi.",
        "Upon arrival in Uttarkashi, check in at the hotel and freshen up.",
        "Visit the ancient Kashi Vishwanath Temple, housing the massive 6-meter-high iron trident (Shakti Stambh), and attend evening Aarti."
      ],
      overnightStay: "Uttarkashi (Hotel)"
    },
    {
      id: 4,
      dayNumber: 4,
      dateStr: "Origin of the Ganges – Gangotri",
      route: "Uttarkashi → Harsil Valley → Gangotri Dham → Uttarkashi",
      activities: [
        "Early morning departure for Shri Gangotri Dham through the breathtaking Harsil Valley, famous for its dense deodar forests and apple orchards.",
        "Take a holy dip in the sacred waters of the Bhagirathi River (called Ganga from Devprayag onwards) at Gangotri.",
        "Offer prayers and spend peaceful time in meditation at the Gangotri Temple, then drive back to Uttarkashi for overnight stay."
      ],
      overnightStay: "Uttarkashi (Hotel)"
    },
    {
      id: 5,
      dayNumber: 5,
      dateStr: "The Long Stretch",
      route: "Uttarkashi → Mandakini Valley → Guptkashi",
      activities: [
        "Post breakfast, embark on the scenic mountain journey crossing the ridge from the Bhagirathi valley into the Mandakini river valley.",
        "Arrive at Guptkashi and check in to the hotel.",
        "Complete mandatory medical check-up and biometric registration verification for the next day's Kedarnath trek; early dinner and rest."
      ],
      overnightStay: "Guptkashi (Hotel)"
    },
    {
      id: 6,
      dayNumber: 6,
      dateStr: "Abode of Shiva – Kedarnath",
      route: "Guptkashi → Sonprayag → Gaurikund → Shri Kedarnath Dham",
      activities: [
        "Start early at 5:00 AM and drive to Sonprayag, then take the local union shuttle jeep to Gaurikund.",
        "Begin the 18 km trek to Shri Kedarnath Dham (you can walk on foot or hire a pony / palki / helicopter shuttle).",
        "Witness the soul-stirring Evening Aarti at the ancient Kedarnath Temple, one of the 12 sacred Jyotirlingas of Lord Shiva."
      ],
      overnightStay: "Kedarnath (Tent House - Without Food)"
    },
    {
      id: 7,
      dayNumber: 7,
      dateStr: "The Descent",
      route: "Shri Kedarnath Dham → Gaurikund → Sonprayag → Sitapur",
      activities: [
        "Wake up early for the sacred 'Abhishek' ceremony and morning Darshan at Shri Kedarnath Temple.",
        "Visit the revered Bhairav Nath Temple perched above the shrine for a panoramic view of the Kedarnath valley.",
        "After Darshan, descend back to Gaurikund, take the shuttle to Sonprayag, and return to Sitapur for hot meals and a restful stay."
      ],
      overnightStay: "Sitapur (Hotel)"
    },
    {
      id: 8,
      dayNumber: 8,
      dateStr: "To the Vaikuntha",
      route: "Sitapur → Badrinath",
      activities: [
        "Post breakfast, embark on a scenic drive through the heart of the Garhwal Himalayas towards Shri Badrinath Dham.",
        "Enjoy the picturesque views along the way as you travel towards the holy town of Badrinath.",
        "Arrive at Badrinath; check in to the hotel for dinner and overnight stay."
      ],
      overnightStay: "Badrinath (Hotel)"
    },
    {
      id: 9,
      dayNumber: 9,
      dateStr: "Badrinath Darshan & Mana Village",
      route: "Shri Badrinath Dham → Mana Village → Pipalkoti",
      activities: [
        "Take a holy dip in Tapt Kund and have divine Darshan of Lord Badri Vishal at Badrinath Temple.",
        "Explore Mana Village (the First Indian Village before the Tibet border), Vyas Gufa, and Bhim Pul.",
        "At 5:00 PM, begin the scenic evening drive down to Pipalkoti. Check in and overnight stay."
      ],
      overnightStay: "Pipalkoti (Hotel)"
    },
    {
      id: 10,
      dayNumber: 10,
      dateStr: "The Return to Haridwar",
      route: "Pipalkoti → Rudraprayag → Haridwar",
      activities: [
        "Final leg of the pilgrimage descending back to the plains of Haridwar.",
        "Travel via Rudraprayag, witnessing the sacred confluence of the Alaknanda and Mandakini rivers.",
        "Tour concludes with a peaceful drop-off at Haridwar."
      ],
      overnightStay: "Tour Concludes (Haridwar Drop)"
    }
  ],

  pricingSubtitle: "Confirmed Standard Package covering the complete 09 Nights / 10 Days Char Dham Yatra with dedicated hill vehicle and verified stays.",
  pricingTiers: [
    { package: "Standard Package", price: "₹ 28,500 / Pax", hotelCategory: "Standard Clean Rooms (Triple/Quad) & Kedarnath Tent", meals: "Breakfast & Dinner (As per Hotel Menu)", specialFeature: "All Toll, Tax & Parking Included" }
  ],
  pricingNote: "Note: All stays are on Triple or Quad-sharing basis (in Kedarnath 5 to 6 sharing Tent House without food). All toll, tax, and parking included.",

  inclusions: [
    "Dedicated Hill Vehicle (Innova Crysta / Tempo Traveller / Dzire - Non-AC in hill areas) from Haridwar to Haridwar",
    "09 Nights Accommodation: Barkot (2N), Uttarkashi (2N), Guptkashi (2N), Kedarnath (1N Tent House), Pipalkoti (2N)",
    "Meals provided as per hotel menu (Breakfast & Dinner at hotels; Kedarnath Tent Stay is without food)",
    "All toll taxes, state taxes, parking charges and driver allowance included in the package",
    "All stays on Triple or Quad-sharing basis; Kedarnath stay on Five to Six sharing basis in Tent House",
    "Sightseeing: Kempty Falls, Yamunotri, Kashi Vishwanath (Shakti Stambh), Harsil Valley, Gangotri, Kedarnath & Bhairav Nath Temple, Chopta, Badrinath, Mana Village, Vyas Gufa, Bhim Pul, Narsingh Temple Joshimath, Dhari Devi Temple & Panch Prayag",
    "Assistance with Char Dham Yatra biometric registration & medical check-up formalities"
  ],
  exclusions: [
    "Meals during Kedarnath overnight stay (Kedarnath Tent House stay is strictly without food)",
    "Pony, palki, doli, porter or helicopter shuttle tickets at Yamunotri & Kedarnath",
    "AC will not be allowed/operated on the Yatra in hill areas due to steep mountain gradients",
    "Personal expenses — laundry, tips, telephone calls, lunch, mineral water, room heaters",
    "VIP / special darshan or Abhishek puja ticket charges, if opted",
    "Travel / medical insurance or extra costs arising from natural calamities, landslides, or road closures",
    "Anything not specifically mentioned under Package Inclusions"
  ],

  goodToKnow: [
    "All hotel stays are on Triple or Quad-sharing basis; in Kedarnath, stay will be on Five to Six sharing basis in Tent House (without food).",
    "Meals are provided as per the hotel menu (pure vegetarian Breakfast & Dinner at hotels).",
    "AC will not be allowed on the Yatra in mountain/hill areas; all hill hotels and vehicles operate as Non-AC.",
    "All toll, tax, and parking charges are included in the package.",
    "Carry valid government photo ID proof, warm woollens, raincoat, thermal layers, and comfortable trekking shoes."
  ],
  bookingPayment: [
    "25% advance payment is mandatory at the time of booking to confirm hotels and vehicle.",
    "Balance 75% amount is to be deposited before starting the Yatra at Haridwar.",
    "Official Website: www.traymbhkamtour.com | Helpline: Hunny (+91 82660 16066, 9389880277)."
  ],

  contactAgency: "Traymbhkam Tour and Travels",
  contactPerson: "Mr. Gagandeep (Hunny)",
  contactPhone: "+91 82660 16066 · 9389880277",
  motto: "जय श्री केदार · जय बद्री विशाल",

  photos: [
    {
      id: "ph-1",
      url: "/gallery/chardham_10d_img_1.jpg",
      caption: "Char Dham Yatra - 4 Sacred Shrines"
    },
    {
      id: "ph-2",
      url: "/gallery/kedarnath_temple.png",
      caption: "Shri Kedarnath Temple & Holy Nandi Darshan"
    },
    {
      id: "ph-3",
      url: "/gallery/chardham_10d_img_15.jpg",
      caption: "Holy Shri Badrinath Ji Temple"
    },
    {
      id: "ph-4",
      url: "/gallery/chardham_10d_img_19.jpg",
      caption: "Sacred Devprayag Sangam & Alaknanda Confluence"
    },
    {
      id: "ph-5",
      url: "/gallery/chardham_10d_img_14.jpg",
      caption: "Chopta Tungnath Himalayan Ridge"
    },
    {
      id: "ph-6",
      url: "/gallery/chardham_10d_img_18.jpg",
      caption: "Maa Dhari Devi Sacred Shrine"
    }
  ],
  hotelPhotos: CURATED_HOTEL_PHOTO_PRESETS,
  showPhotosPage1: true,
  showPhotosPage3: true,
  showHotelPhotos: true,
  trustPhotos: DEFAULT_TRUST_PHOTOS,
  showTrustSection: true
};

// Exact preset matching the client's 09 Nights / 10 Days 12-Pax Group Chardham Yatra Package (Traymbhkam Tour and Travels)
const CHARDHAM_12P_10D_PRESET: ItineraryData = {
  title: "CHARDHAM YATRA PACKAGE 2026",
  subTitle: "UTTARAKHAND",
  spiritualHeadline: "09 Nights · 10 Days Pilgrimage Package",
  dhamsSubtitle: "Yamunotri · Gangotri · Kedarnath · Badrinath",
  preparedFor: "12 Pax Pilgrimage Group",
  travelDates: "May – Oct 2026 Season",
  duration: "09 Nights / 10 Days",
  startingPoint: "Haridwar / Rishikesh / Dehradun",
  routeCovered: "Haridwar – Mussoorie (Kempty Falls) – Barkot – Yamunotri – Uttarkashi – Harsil – Gangotri – Guptkashi – Kedarnath – Chopta – Pipalkoti – Badrinath – Mana Village – Dhari Devi – Haridwar",
  overviewSummary: "The Char Dham Yatra is a sacred 09 Nights / 10 Days Himalayan pilgrimage covering Yamunotri, Gangotri, Kedarnath, and Badrinath in a dedicated Tempo Traveller. Includes verified stays at Barkot (2N), Uttarkashi (2N), Guptkashi (2N), Kedarnath (1N Tent House), and Pipalkoti (2N) with meals as per hotel menu and complete en-route sightseeing.",
  
  glanceDuration: "09 Nights / 10 Days",
  glanceDhams: "Yamunotri · Gangotri · Kedarnath · Badrinath",
  glanceSector: "Haridwar to Haridwar (Tempo Traveller)",
  glanceStartEnd: "Haridwar / Rishikesh / Dehradun",
  glancePackages: "Standard Package",

  days: [
    {
      id: 1,
      dayNumber: 1,
      dateStr: "Arrival & The Ascent",
      route: "Haridwar → Mussoorie & Kempty Falls → Barkot",
      activities: [
        "Leave the plains of Haridwar and climb into the Shivalik ranges via Mussoorie in your dedicated Tempo Traveller.",
        "Stop at the cascading Kempty Falls en route for refreshments and scenic mountain views.",
        "Arrive in Barkot (the gateway to Yamunotri with views of Bandarpunch peak); check in at the hotel and acclimatize."
      ],
      overnightStay: "Barkot (Hotel)"
    },
    {
      id: 2,
      dayNumber: 2,
      dateStr: "The First Dham – Yamunotri",
      route: "Barkot → Janki Chatti → Yamunotri Dham → Barkot (36 km Drive + 6 km Trek)",
      activities: [
        "Early morning 36 km drive to Janki Chatti and begin the 6 km trek (one way) to Shri Yamunotri Dham (on foot, pony, or palki).",
        "Visit the sacred Yamunotri Temple and offer prayers to Goddess Yamuna.",
        "Witness the thermal hot springs of Surya Kund (where rice is cooked in hot water as Prasad) and worship Divya Shila; return to Barkot."
      ],
      overnightStay: "Barkot (Hotel)"
    },
    {
      id: 3,
      dayNumber: 3,
      dateStr: "River Valleys",
      route: "Barkot → Bhagirathi River Valley → Uttarkashi",
      activities: [
        "Post breakfast, check out from Barkot and embark on a scenic drive along the banks of the holy Bhagirathi River to Uttarkashi.",
        "Arrive in Uttarkashi and check in at the hotel along the sacred river valley.",
        "Visit the ancient Kashi Vishwanath Temple, housing the massive 6-meter-high iron trident (Shakti Stambh), and attend evening Aarti."
      ],
      overnightStay: "Uttarkashi (Hotel)"
    },
    {
      id: 4,
      dayNumber: 4,
      dateStr: "Origin of the Ganges – Gangotri",
      route: "Uttarkashi → Harsil Valley → Gangotri Dham → Uttarkashi",
      activities: [
        "Leave early morning for Gangotri Dham through the stunning Harsil Valley, famous for its apple orchards and deodar forests.",
        "Take a holy dip in the icy waters of the Bhagirathi River at Gangotri and offer prayers at the sacred Gangotri Temple.",
        "Spend peaceful time in meditation and drive back to Uttarkashi for dinner and overnight stay."
      ],
      overnightStay: "Uttarkashi (Hotel)"
    },
    {
      id: 5,
      dayNumber: 5,
      dateStr: "The Long Stretch",
      route: "Uttarkashi → Mandakini Valley → Guptkashi",
      activities: [
        "After breakfast, cross the mountain ridge from the Bhagirathi valley into the scenic Mandakini valley towards Guptkashi.",
        "Check in at the hotel in Guptkashi and complete medical check-up & registration verification for the Kedarnath trek.",
        "Evening briefing and restful overnight stay."
      ],
      overnightStay: "Guptkashi (Hotel)"
    },
    {
      id: 6,
      dayNumber: 6,
      dateStr: "Abode of Shiva – Kedarnath",
      route: "Guptkashi → Sonprayag → Gaurikund → Shri Kedarnath Dham",
      activities: [
        "Start at 5:00 AM to Sonprayag, then take the local union shuttle to Gaurikund.",
        "Begin the 18 km climb to Shri Kedarnath Dham (walk on foot or hire a pony / palki / helicopter).",
        "Witness the soul-stirring Evening Aarti at the Kedarnath Temple, one of the 12 sacred Jyotirlingas of Lord Shiva."
      ],
      overnightStay: "Kedarnath (Tent House - Without Food)"
    },
    {
      id: 7,
      dayNumber: 7,
      dateStr: "The Descent",
      route: "Shri Kedarnath Dham → Gaurikund → Sonprayag → Sitapur",
      activities: [
        "Wake up early for the sacred 'Abhishek' ceremony and morning Darshan at Kedarnath Temple.",
        "Visit the ancient Bhairav Nath Temple for a panoramic view of the Kedarnath valley and snow peaks.",
        "Descend back to Gaurikund, take the shuttle to Sonprayag, and return to Sitapur for hot meals and overnight stay."
      ],
      overnightStay: "Sitapur (Hotel)"
    },
    {
      id: 8,
      dayNumber: 8,
      dateStr: "To the Vaikuntha",
      route: "Sitapur → Badrinath",
      activities: [
        "Post breakfast, check out and enjoy a scenic drive through the heart of the Garhwal Himalayas.",
        "Travel towards the holy town of Badrinath, enjoying the majestic mountain views en route.",
        "Arrive at Badrinath; check in at the hotel for dinner and overnight stay."
      ],
      overnightStay: "Badrinath (Hotel)"
    },
    {
      id: 9,
      dayNumber: 9,
      dateStr: "Badrinath Darshan & Mana Village",
      route: "Shri Badrinath Dham → Mana Village → Pipalkoti",
      activities: [
        "Take a holy dip in Tapt Kund and perform sacred Darshan at Shri Badrinath Temple.",
        "Explore Mana Village (First Indian Village before Tibet border), Vyas Gufa, and Bhim Pul over the Saraswati River.",
        "At 5:00 PM, begin the descent to Pipalkoti. Check in and overnight stay."
      ],
      overnightStay: "Pipalkoti (Hotel)"
    },
    {
      id: 10,
      dayNumber: 10,
      dateStr: "The Return to Haridwar",
      route: "Pipalkoti → Rudraprayag → Haridwar",
      activities: [
        "Final leg descending back to the plains of Haridwar.",
        "Travel via Rudraprayag, witnessing the sacred confluence of the Alaknanda and Mandakini rivers.",
        "Tour concludes with a peaceful drop-off at Haridwar."
      ],
      overnightStay: "Tour Concludes (Haridwar Drop)"
    }
  ],

  pricingSubtitle: "Special Standard Package with dedicated Tempo Traveller, confirmed stays (Triple/Quad basis) and meals as per hotel menu.",
  pricingTiers: [
    { package: "Standard Package", price: "₹ 32,500 / Pax", hotelCategory: "Standard Clean Rooms (Triple/Quad) & Kedarnath Tent", meals: "Breakfast & Dinner (As per Hotel Menu)", specialFeature: "Tempo Traveller + All Toll, Tax & Parking" }
  ],
  pricingNote: "Note: Total package cost for 12 Persons = ₹ 3,90,000/- (at ₹ 32,500 per person). All toll, tax, and parking included.",

  inclusions: [
    "Dedicated Tempo Traveller / Taxi from Haridwar to Haridwar (Non-AC in hill areas)",
    "2 Nights Stay at Barkot (Hotel - Meal as per hotel menu)",
    "2 Nights Stay at Uttarkashi (Hotel - Meal as per hotel menu)",
    "2 Nights Stay at Guptkashi (Hotel - Meal as per hotel menu)",
    "1 Night Stay at Shri Kedarnath Dham (Tent House - Without Food, 5 to 6 sharing basis)",
    "2 Nights Stay at Pipalkoti (Hotel - Meal as per hotel menu)",
    "All Toll, State Tax, Parking charges and Driver Allowance included in the package",
    "All hotel stays on Triple or Quad-sharing basis",
    "Sightseeing: Kempty Falls, Yamunotri, Kashi Vishwanath (Shakti Stambh), Harsil Valley, Gangotri, Kedarnath, Bhairav Nath Temple, Chopta, Badrinath, Mana Village, Vyas Gufa, Bhim Pul, Narsingh Temple Joshimath, Dhari Devi Temple & Panch Prayag"
  ],
  exclusions: [
    "Meals at Kedarnath Night Stay (Kedarnath Tent House stay is without food)",
    "AC will not be allowed on the Yatra in mountain/hill areas",
    "Horse / pony charges, Palki / Doli or Helicopter tickets at Yamunotri & Kedarnath",
    "Any extra sightseeing or destinations apart from mentioned inclusions",
    "Room heater charges, monument/camera fees, or adventure activities",
    "Extra personal costs e.g. laundry, telephone, tips, lunch, cold drinks, mineral water",
    "Medical insurance or extra expenses due to natural calamities / road blockages"
  ],

  goodToKnow: [
    "All stays are on Triple or Quad-sharing basis; in Kedarnath stay will be on Five to Six sharing basis (Tent House without food).",
    "Meals are provided as per hotel menu (Breakfast & Dinner at hotels only).",
    "AC will not be allowed on the Yatra in hill areas due to steep climbs and engine safety norms.",
    "All toll, tax, and parking charges are included in the package.",
    "Things to Carry: Warm jacket, woollen cap, gloves, thermal socks, trekking shoes, raincoat, water bottle, power bank, and valid Photo ID."
  ],
  bookingPayment: [
    "25% advance at the time of booking and balance amount to be deposited before starting the Yatra.",
    "Advance deposit is non-refundable once hotels & vehicle are blocked for the season.",
    "Official Website: www.traymbhkamtour.com | Contact: Hunny (+91 82660 16066, 9389880277)."
  ],

  contactAgency: "Traymbhkam Tour and Travels",
  contactPerson: "Mr. Gagandeep (Hunny)",
  contactPhone: "+91 82660 16066 · 9389880277",
  motto: "जय श्री केदार · जय बद्री विशाल",

  photos: [
    {
      id: "ph-12p-1",
      url: "/gallery/chardham_10d_img_1.jpg",
      caption: "Char Dham Yatra - 4 Sacred Shrines"
    },
    {
      id: "ph-12p-2",
      url: "/gallery/kedarnath_temple.png",
      caption: "Shri Kedarnath Temple & Holy Nandi Darshan"
    },
    {
      id: "ph-12p-3",
      url: "/gallery/chardham_10d_img_15.jpg",
      caption: "Shri Badrinath Ji Divine Facade"
    },
    {
      id: "ph-12p-4",
      url: "/gallery/chardham_10d_img_19.jpg",
      caption: "Sacred Devprayag Sangam & Alaknanda Confluence"
    },
    {
      id: "ph-12p-5",
      url: "/gallery/chardham_10d_img_14.jpg",
      caption: "Chopta Tungnath Himalayan Ridge"
    },
    {
      id: "ph-12p-6",
      url: "/gallery/chardham_10d_img_18.jpg",
      caption: "Maa Dhari Devi Sacred Shrine"
    }
  ],
  hotelPhotos: CURATED_HOTEL_PHOTO_PRESETS,
  showPhotosPage1: true,
  showPhotosPage3: true,
  showHotelPhotos: true,
  trustPhotos: DEFAULT_TRUST_PHOTOS,
  showTrustSection: true
};

// Dedicated 05 Nights / 06 Days Do Dham Yatra (Kedarnath + Badrinath) Preset matching client's official PDF
export const DODHAM_6D_PRESET: ItineraryData = {
  title: "KEDARNATH BADRINATH YATRA 2026",
  subTitle: "DO DHAM YATRA · UTTARAKHAND",
  spiritualHeadline: "05 Nights · 06 Days Pilgrimage Plan",
  dhamsSubtitle: "Shri Kedarnath Dham · Shri Badrinath Dham",
  preparedFor: "Valued Pilgrims / Family Group",
  travelDates: "May – Oct 2026 Season",
  duration: "05 Nights / 06 Days",
  startingPoint: "Haridwar, Uttarakhand",
  routeCovered: "Haridwar – Devprayag – Rudraprayag – Guptkashi / Sitapur – Kedarnath – Sitapur – Badrinath & Mana Village – Pipalkoti – Dhari Devi – Haridwar",
  overviewSummary: "A sacred 05 Nights / 06 Days Kedarnath & Badrinath Do Dham Yatra starting and concluding at Haridwar. Well-paced stays at Guptkashi / Sitapur (2N), Kedarnath (1N Tent House), Badrinath (1N), and Pipalkoti (1N), covering Mana Village, Vyas Gufa, Bhim Pul, Dhari Devi Temple, Rudraprayag, and Panch Prayag.",
  
  glanceDuration: "05 Nights / 06 Days",
  glanceDhams: "Kedarnath Dham · Badrinath Dham",
  glanceSector: "Haridwar ⇄ Do Dham Circuit",
  glanceStartEnd: "Haridwar (Pickup & Drop)",
  glancePackages: "Standard Package",

  days: [
    {
      id: 1,
      dayNumber: 1,
      dateStr: "Haridwar to Guptkashi / Sitapur",
      route: "Haridwar → Devprayag & Rudraprayag → Guptkashi / Sitapur",
      activities: [
        "Start early in the morning from Haridwar and enjoy a scenic drive along the holy Ganges and Alaknanda rivers.",
        "Witness the sacred river confluences at Devprayag and Rudraprayag along the mountain highway.",
        "Arrive for overnight stay in Guptkashi or Sitapur (Sitapur is closer to the Kedarnath trek starting point); check in at hotel and rest."
      ],
      overnightStay: "Guptkashi / Sitapur (Hotel)"
    },
    {
      id: 2,
      dayNumber: 2,
      dateStr: "Kedarnath Yatra",
      route: "Guptkashi / Sitapur → Sonprayag → Gaurikund → Shri Kedarnath Dham",
      activities: [
        "Start at 5:00 AM and drive to Sonprayag, then take a local union shuttle to Gaurikund.",
        "Begin the 18 km climb to Shri Kedarnath Dham (you can walk on foot or hire a pony / palki / helicopter).",
        "Witness the soul-stirring Evening Aarti at the ancient Kedarnath Temple, one of the 12 sacred Jyotirlingas of Lord Shiva."
      ],
      overnightStay: "Kedarnath (Tent House - Without Food)"
    },
    {
      id: 3,
      dayNumber: 3,
      dateStr: "After Darshan — Return to Sitapur",
      route: "Shri Kedarnath Dham → Bhairav Nath Temple → Gaurikund → Sonprayag → Sitapur",
      activities: [
        "Wake up early for the sacred 'Abhishek' ceremony and morning Darshan at Shri Kedarnath Temple.",
        "Visit the revered Bhairav Nath Temple perched above the shrine for a panoramic view of the Kedarnath valley and surrounding snow peaks.",
        "After Darshan, descend back to Gaurikund, take the local union shuttle to Sonprayag, and return to Sitapur for hot meals and a restful overnight stay."
      ],
      overnightStay: "Sitapur (Hotel)"
    },
    {
      id: 4,
      dayNumber: 4,
      dateStr: "Sitapur to Badrinath",
      route: "Sitapur → Rudraprayag → Chamoli → Shri Badrinath Dham",
      activities: [
        "Post breakfast, check out from Sitapur and begin the scenic drive towards Shri Badrinath Dham along the Alaknanda river valley.",
        "Pass through Rudraprayag and Chamoli districts, witnessing the beautiful confluence points and Himalayan valleys en route.",
        "Arrive at Badrinath by evening, check in at the hotel, freshen up, and attend the evening Aarti at the divine Badrinath Temple."
      ],
      overnightStay: "Badrinath (Hotel)"
    },
    {
      id: 5,
      dayNumber: 5,
      dateStr: "Badrinath Darshan & Drive to Pipalkoti",
      route: "Shri Badrinath Dham → Mana Village → Pipalkoti (Depart by 5:00 PM)",
      activities: [
        "Rise early for the morning Abhishek Darshan and take a holy dip in the sacred Tapt Kund at Shri Badrinath Temple.",
        "Explore Mana Village — the Last Indian Village before the Tibet border — visiting Vyas Gufa (cave where Mahabharata was written) and Bhim Pul (the natural rock bridge over the roaring Saraswati River).",
        "We drive towards Pipalkoti by 5:00 PM; check in at the hotel for dinner and a relaxing overnight stay."
      ],
      overnightStay: "Pipalkoti (Hotel)"
    },
    {
      id: 6,
      dayNumber: 6,
      dateStr: "Return to Haridwar via Rudraprayag",
      route: "Pipalkoti → Joshimath → Maa Dhari Devi Temple → Rudraprayag → Haridwar",
      activities: [
        "Final leg of the sacred journey; descend from the Himalayas back towards the plains of Haridwar.",
        "En route, visit Narsingh Temple at Joshimath and seek blessings at the revered Dhari Devi Temple on the banks of the Alaknanda River (guardian deity of Uttarakhand).",
        "Pass through the holy Rudraprayag confluence (Alaknanda & Mandakini rivers) and Panch Prayag sacred confluences before drop-off at Haridwar. Yatra Concludes."
      ],
      overnightStay: "Tour Concludes (Haridwar Drop)"
    }
  ],

  pricingSubtitle: "Confirmed 05 Nights / 06 Days Kedarnath Badrinath Do Dham Package with dedicated hill vehicle and verified stays.",
  pricingTiers: [
    { package: "Standard Package", price: "", hotelCategory: "Standard Clean Rooms (Triple/Quad) & Kedarnath Tent", meals: "Breakfast & Dinner (As per Hotel Menu)", specialFeature: "All Toll, Tax & Parking Included" }
  ],
  pricingNote: "Note: All stays are on Triple or Quad-sharing basis (in Kedarnath 5 to 6 sharing Tent House without food). All toll, tax, and parking included.",

  inclusions: [
    "Dedicated Hill Vehicle (Innova / Dzire / Tempo Traveller - Non-AC in hill areas) from Haridwar to Haridwar",
    "2 Nights Stay at Guptkashi / Sitapur (Hotel - Meal as per hotel menu)",
    "1 Night Stay at Shri Kedarnath Dham (Tent House - Without Food, 5 to 6 sharing basis)",
    "1 Night Stay at Badrinath (Hotel - Meal as per hotel menu)",
    "1 Night Stay at Pipalkoti (Hotel - Meal as per hotel menu)",
    "Meals provided as per hotel menu (Breakfast & Dinner at hotels only)",
    "All Toll, State Tax, Parking charges and Driver Allowance included in the package",
    "All hotel stays on Triple or Quad-sharing basis",
    "Sightseeing: Shri Kedarnath Dham, Bhairav Nath Temple, Shri Badrinath Dham, Mana Village (First Indian Village), Vyas Gufa, Bhim Pul, Narsingh Temple Joshimath, Dhari Devi Temple & Panch Prayag"
  ],
  exclusions: [
    "Meals during Kedarnath overnight stay (Kedarnath Tent House stay is strictly without food)",
    "AC will not be allowed on the Yatra in mountain/hill areas",
    "Pony, palki, doli, porter or helicopter shuttle charges at Kedarnath trek",
    "Any extra sightseeing or destinations apart from mentioned inclusions",
    "VIP / special puja tickets, room heaters, laundry, tips, lunch or mineral water",
    "Costs arising from natural calamities, landslides or road closures"
  ],

  goodToKnow: [
    "All stays are on Triple or Quad-sharing basis; in Kedarnath stay will be on Five to Six sharing basis (Tent House without food).",
    "Meals are provided as per hotel menu (Breakfast & Dinner at hotels only).",
    "AC will not be allowed on the Yatra in hill areas due to steep mountain climbs.",
    "All toll, tax, and parking charges are included in the package.",
    "Carry valid government photo ID proof, warm woollens, raincoats, and comfortable trekking shoes."
  ],
  bookingPayment: [
    "25% advance at the time of booking and balance amount to be deposited before starting the Yatra.",
    "Official Website: www.traymbhkamtour.com | Contact: Hunny (+91 82660 16066, 9389880277)."
  ],

  contactAgency: "Traymbhkam Tour and Travels",
  contactPerson: "Mr. Gagandeep (Hunny)",
  contactPhone: "+91 82660 16066 · 9389880277",
  motto: "जय श्री केदार · जय बद्री विशाल",

  photos: [
    {
      id: "ph-dd-1",
      url: "/gallery/dodham_banner.jpg",
      caption: "Do Dham Yatra — Shri Kedarnath Dham & Shri Badrinath Dham"
    },
    {
      id: "ph-dd-2",
      url: "/gallery/kedarnath_temple.png",
      caption: "Shri Kedarnath Temple & Holy Nandi Darshan"
    },
    {
      id: "ph-dd-3",
      url: "/gallery/chardham_10d_img_15.jpg",
      caption: "Shri Badrinath Ji Divine Facade"
    },
    {
      id: "ph-dd-4",
      url: "/gallery/chardham_10d_img_14.jpg",
      caption: "Chopta Tungnath Alpine Meadows"
    },
    {
      id: "ph-dd-5",
      url: "/gallery/chardham_10d_img_18.jpg",
      caption: "Maa Dhari Devi Sacred Shrine"
    },
    {
      id: "ph-dd-6",
      url: "/gallery/chardham_10d_img_19.jpg",
      caption: "Sacred Panch Prayag Confluence"
    }
  ],
  hotelPhotos: CURATED_HOTEL_PHOTO_PRESETS,
  showPhotosPage1: true,
  showPhotosPage3: true,
  showHotelPhotos: true,
  trustPhotos: DEFAULT_TRUST_PHOTOS,
  showTrustSection: true
};

const CURATED_PHOTO_PRESETS = [
  {
    id: "preset-all4-real",
    url: "/gallery/chardham_10d_img_1.jpg",
    caption: "Char Dham Yatra - 4 Sacred Shrines"
  },
  {
    id: "preset-dodham-real",
    url: "/gallery/dodham_banner.jpg",
    caption: "Do Dham Yatra - Kedarnath & Badrinath"
  },
  {
    id: "preset-kedarnath-real",
    url: "/gallery/kedarnath_temple.png",
    caption: "Shri Kedarnath Temple & Snow Himalayas"
  },
  {
    id: "preset-badrinath-real",
    url: "/gallery/chardham_10d_img_15.jpg",
    caption: "Holy Shri Badrinath Ji Temple"
  },
  {
    id: "preset-gangotri-real",
    url: "/gallery/chardham_10d_img_8.jpg",
    caption: "Shri Gangotri Dham Temple"
  },
  {
    id: "preset-yamunotri-real",
    url: "/gallery/chardham_10d_img_5.jpg",
    caption: "Shri Yamunotri Dham Temple"
  },
  {
    id: "preset-chopta-real",
    url: "/gallery/chardham_10d_img_14.jpg",
    caption: "Chopta Tungnath Alpine Ridge"
  },
  {
    id: "preset-dharidevi-real",
    url: "/gallery/chardham_10d_img_18.jpg",
    caption: "Maa Dhari Devi Sacred Temple"
  },
  {
    id: "preset-aarti",
    url: "/gallery/chardham_10d_img_19.jpg",
    caption: "Sacred Devprayag Sangam & Himalayan Confluence"
  },
  {
    id: "preset-group",
    url: "/reviews/review_3.jpeg",
    caption: "Traymbhkam Pilgrimage Group & Coach"
  }
];

export default function ItineraryBuilder() {
  const [data, setData] = useState<ItineraryData>(CHARDHAM_PRESET);
  const [activeTab, setActiveTab] = useState<"overview" | "days" | "pricing" | "photos" | "inclusions" | "contact">("overview");
  
  // Custom Photo Input state
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [photoCaptionInput, setPhotoCaptionInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dham Photo Gallery & AI Smart Selection state
  const [dhamGallery, setDhamGallery] = useState<DhamGalleryPhoto[]>([]);
  const [selectedDhamCategory, setSelectedDhamCategory] = useState<string>("all");
  const [newDhamUploadTag, setNewDhamUploadTag] = useState<DhamGalleryPhoto["dham"]>("kedarnath");
  const [newDhamUploadUrl, setNewDhamUploadUrl] = useState("");
  const [newDhamUploadCaption, setNewDhamUploadCaption] = useState("");
  const [aiPhotoNotification, setAiPhotoNotification] = useState<string | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryModalCategory, setGalleryModalCategory] = useState<string>("all");
  const [customPhotosBannerDismissed, setCustomPhotosBannerDismissed] = useState(false);
  const dhamFileInputRef = useRef<HTMLInputElement>(null);

  // Preview Controls
  const [activePreviewPage, setActivePreviewPage] = useState<number | "all">(1);
  const [autoScale, setAutoScale] = useState<number>(0.55);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [fitMode, setFitMode] = useState<"screen" | "width">("screen");
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keySavedNotification, setKeySavedNotification] = useState(false);
  
  // Download & Preview state
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Dynamically compute the exact fit-to-screen or fit-width scale factor
  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const el = previewContainerRef.current;
      const padX = 36;
      const padY = 36;
      const availW = Math.max(300, el.clientWidth - padX);
      const availH = Math.max(300, el.clientHeight - padY);

      const scaleW = availW / 794;
      const scaleH = activePreviewPage !== "all" ? (availH / 1122) : scaleW;
      
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
  }, [activePreviewPage, isFormCollapsed, fitMode]);

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

  // Fetch API key from permanent local storage, env variable, cache or Supabase settings
  useEffect(() => {
    // 1. Direct read from permanent localStorage key
    if (typeof window !== "undefined") {
      try {
        const storedKey = localStorage.getItem("traymbhkam_gemini_api_key");
        if (storedKey && storedKey.trim()) {
          setApiKey(storedKey.trim());
          setDhamGallery(getStoredDhamGallery());
          return;
        }

        const cachedSettings = localStorage.getItem("traymbhkam_settings_cache");
        if (cachedSettings) {
          const parsed = JSON.parse(cachedSettings);
          if (parsed.openai_key && parsed.openai_key.trim()) {
            setApiKey(parsed.openai_key.trim());
            localStorage.setItem("traymbhkam_gemini_api_key", parsed.openai_key.trim());
            setDhamGallery(getStoredDhamGallery());
            return;
          }
        }
      } catch {}
    }

    // 2. Check if configured in Vercel/Environment variable
    const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_KEY;
    if (envKey && envKey.trim()) {
      setApiKey(envKey.trim());
      if (typeof window !== "undefined") {
        localStorage.setItem("traymbhkam_gemini_api_key", envKey.trim());
      }
      setDhamGallery(getStoredDhamGallery());
      return;
    }

    // 3. Fallback check from Supabase cloud settings
    async function fetchKey() {
      try {
        const { data: settings } = await supabase.from("settings").select("openai_key").limit(1).single();
        if (settings?.openai_key && settings.openai_key.trim()) {
          setApiKey(settings.openai_key.trim());
          if (typeof window !== "undefined") {
            localStorage.setItem("traymbhkam_gemini_api_key", settings.openai_key.trim());
          }
        }
      } catch (err) {
        // silent fallback
      }
    }
    // 4. Fetch latest itinerary from local cache or cloud
    const migrateLegacyItinerary = (itin: any) => {
      if (!itin || !Array.isArray(itin.days)) return itin;

      const isDoDhamItin =
        itin.days.length <= 7 ||
        itin.title?.toLowerCase().includes("do dham") ||
        itin.subTitle?.toLowerCase().includes("do dham") ||
        itin.title?.toLowerCase().includes("kedarnath badrinath") ||
        (!itin.dhamsSubtitle?.toLowerCase().includes("yamunotri") && !itin.routeCovered?.toLowerCase().includes("yamunotri"));

      // Force-upgrade any older cached itinerary to the official 2026 PDF day-wise schedule & full landscape cover photo
      if (itin._schemaVersion !== "2026-v5-landscape-official") {
        if (isDoDhamItin) {
          itin.days = DODHAM_6D_PRESET.days;
          itin.title = DODHAM_6D_PRESET.title;
          itin.subTitle = DODHAM_6D_PRESET.subTitle;
          itin.duration = DODHAM_6D_PRESET.duration;
          itin.glanceDuration = DODHAM_6D_PRESET.glanceDuration;
          itin.glanceDhams = DODHAM_6D_PRESET.glanceDhams;
          itin.glanceSector = DODHAM_6D_PRESET.glanceSector;
          itin.glanceStartEnd = DODHAM_6D_PRESET.glanceStartEnd;
          itin.spiritualHeadline = DODHAM_6D_PRESET.spiritualHeadline;
          itin.dhamsSubtitle = DODHAM_6D_PRESET.dhamsSubtitle;
          itin.routeCovered = DODHAM_6D_PRESET.routeCovered;
          itin.overviewSummary = DODHAM_6D_PRESET.overviewSummary;
          itin.inclusions = DODHAM_6D_PRESET.inclusions;
          itin.exclusions = DODHAM_6D_PRESET.exclusions;
          itin.goodToKnow = DODHAM_6D_PRESET.goodToKnow;
          itin.bookingPayment = DODHAM_6D_PRESET.bookingPayment;
          itin.contactPerson = DODHAM_6D_PRESET.contactPerson;
          itin.contactPhone = DODHAM_6D_PRESET.contactPhone;
          itin.photos = DODHAM_6D_PRESET.photos;
        } else {
          const is12Pax = itin.preparedFor?.toLowerCase().includes("12 pax");
          const targetPreset = is12Pax ? CHARDHAM_12P_10D_PRESET : CHARDHAM_PRESET;
          itin.days = targetPreset.days;
          itin.title = targetPreset.title;
          itin.subTitle = targetPreset.subTitle;
          itin.duration = targetPreset.duration;
          itin.glanceDuration = targetPreset.glanceDuration;
          itin.glanceDhams = targetPreset.glanceDhams;
          itin.glanceSector = targetPreset.glanceSector;
          itin.glanceStartEnd = targetPreset.glanceStartEnd;
          itin.spiritualHeadline = targetPreset.spiritualHeadline;
          itin.dhamsSubtitle = targetPreset.dhamsSubtitle;
          itin.routeCovered = targetPreset.routeCovered;
          itin.overviewSummary = targetPreset.overviewSummary;
          itin.inclusions = targetPreset.inclusions;
          itin.exclusions = targetPreset.exclusions;
          itin.goodToKnow = targetPreset.goodToKnow;
          itin.bookingPayment = targetPreset.bookingPayment;
          itin.contactPerson = targetPreset.contactPerson;
          itin.contactPhone = targetPreset.contactPhone;
          itin.photos = targetPreset.photos;
        }
        itin._schemaVersion = "2026-v5-landscape-official";
      }

      // Ensure first cover photo matches Do Dham vs Char Dham
      if (Array.isArray(itin.photos) && itin.photos.length > 0) {
        if (isDoDhamItin && (itin.photos[0].url === "/gallery/chardham_10d_img_1.jpg" || itin.photos[0].url === "/gallery/kedarnath_temple.png")) {
          itin.photos[0] = {
            id: "ph-dd-1",
            url: "/gallery/dodham_banner.jpg",
            caption: "Do Dham Yatra — Shri Kedarnath Dham & Shri Badrinath Dham"
          };
        } else if (!isDoDhamItin && (itin.photos[0].url === "/gallery/dodham_banner.jpg" || itin.photos[0].url === "/gallery/kedarnath_temple.png")) {
          itin.photos[0] = {
            id: "ph-1",
            url: "/gallery/chardham_10d_img_1.jpg",
            caption: "Char Dham Yatra - 4 Sacred Shrines"
          };
        }
      }

      // Auto-migrate legacy 3-tier pricing to single Standard Package
      if (Array.isArray(itin.pricingTiers) && itin.pricingTiers.length > 1) {
        itin.pricingTiers = [
          {
            package: "Standard Package",
            price: itin.pricingTiers[0].price || "₹ 28,500 / Pax",
            hotelCategory: itin.pricingTiers[0].hotelCategory || "Standard Clean Rooms (Triple/Quad) & Kedarnath Tent",
            meals: itin.pricingTiers[0].meals || "Breakfast & Dinner (As per Hotel Menu)",
            specialFeature: itin.pricingTiers[0].specialFeature || "All Toll, Tax & Parking Included"
          }
        ];
        itin.glancePackages = "Standard Package";
      }
      // Auto-migrate to Hindi blessing motto
      if (!itin.motto || itin.motto === "ॐ नमः शिवाय" || itin.motto === "!! HAR HAR MAHADEV !!") {
        itin.motto = "जय श्री केदार · जय बद्री विशाल";
      }
      // Auto-migrate hotel photos to real verified hotel photos
      if (Array.isArray(itin.hotelPhotos)) {
        itin.hotelPhotos = itin.hotelPhotos.map((hp: any) => {
          if (hp.url === "/gallery/chardham_10d_img_32.jpg" || (hp.roomType?.toLowerCase().includes("tent") && hp.url?.includes("img_32"))) {
            return { ...hp, url: "/gallery/kedarnath_alpine_tent.jpg" };
          }
          if (hp.url === "/gallery/chardham_10d_img_31.jpg") {
            return { ...hp, url: "/hotels_custom/hotel_stay_2.jpeg", roomType: hp.roomType || "Standard Triple / Quad Room" };
          }
          if (hp.url === "/gallery/chardham_10d_img_29.jpg") {
            return { ...hp, url: "/hotels_custom/hotel_stay_4.jpeg", roomType: hp.roomType || "Standard Double Room" };
          }
          if (hp.url === "/gallery/chardham_10d_img_30.jpg") {
            return { ...hp, url: "/hotels_custom/hotel_stay_3.jpeg", roomType: hp.roomType || "Standard Family Room" };
          }
          return hp;
        });
      }
      // Auto-migrate trust & credentials photos with all 4 items
      if (
        !itin.trustPhotos || 
        !itin.trustPhotos.certificatePhoto || 
        !itin.trustPhotos.certificatePhoto.trim() ||
        !itin.trustPhotos.certificate2Photo ||
        itin.trustPhotos.ownerPhoto?.includes("img_7")
      ) {
        itin.trustPhotos = {
          ownerPhoto: itin.trustPhotos?.ownerPhoto || "/certificates/owner.jpeg",
          ownerName: itin.trustPhotos?.ownerName || "Mr. Gagandeep",
          ownerTitle: itin.trustPhotos?.ownerTitle || "Founder & Managing Director",
          certificatePhoto: itin.trustPhotos?.certificatePhoto?.trim() || "/certificates/uttrakhand_tourism.jpeg",
          certificateCaption: itin.trustPhotos?.certificateCaption?.trim() || "Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2022/004983",
          certificate2Photo: itin.trustPhotos?.certificate2Photo?.trim() || "/certificates/certificate.jpeg",
          certificate2Caption: itin.trustPhotos?.certificate2Caption?.trim() || "Dehradun Transport Authority License: 010/RTA/23",
          officePhoto: itin.trustPhotos?.officePhoto || "/certificates/office_front.jpeg",
          officeCaption: itin.trustPhotos?.officeCaption || "Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar",
          vehiclePhoto: itin.trustPhotos?.vehiclePhoto || "/gallery/traymbhkam_fleet_lineup.png",
          vehicleCaption: itin.trustPhotos?.vehicleCaption || "Traymbhkam Dedicated Mountain Fleet (Tempo Traveller & Hill Cabs)"
        };
        itin.showTrustSection = true;
      }
      if (!itin.trustPhotos?.vehiclePhoto) {
        itin.trustPhotos = {
          ...(itin.trustPhotos || DEFAULT_TRUST_PHOTOS),
          vehiclePhoto: "/gallery/traymbhkam_fleet_lineup.png",
          vehicleCaption: "Traymbhkam Dedicated Mountain Fleet (Tempo Traveller & Hill Cabs)"
        };
      }
      if (Array.isArray(itin.photos)) {
        itin.photos = itin.photos.map((p: any, idx: number) => {
          if (idx >= 3 && (p.url?.includes("img_8.jpg") || p.caption?.toLowerCase().includes("gangotri"))) {
            return {
              ...p,
              url: "/gallery/chardham_10d_img_19.jpg",
              caption: "Sacred Devprayag Sangam & Alaknanda Confluence"
            };
          }
          return p;
        });
      }
      return itin;
    };

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("traymbhkam_current_itinerary");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.days)) {
            const migrated = migrateLegacyItinerary(parsed);
            setData(migrated);
            localStorage.setItem("traymbhkam_current_itinerary", JSON.stringify(migrated));
          }
        } catch {}
      } else {
        const fetchCloudItin = async () => {
          try {
            const { data: cloudItin } = await supabase
              .from("itineraries")
              .select("document_data")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (cloudItin && cloudItin.document_data && Array.isArray((cloudItin.document_data as any).days)) {
              const cloudData = migrateLegacyItinerary(cloudItin.document_data as any);
              setData(cloudData);
              localStorage.setItem("traymbhkam_current_itinerary", JSON.stringify(cloudData));
            }
          } catch {}
        };
        fetchCloudItin();
      }
    }

    fetchKey();
    const storedGallery = getStoredDhamGallery();
    setDhamGallery(storedGallery);

    // Auto-sync user's custom uploaded photos from Gallery into current brochure (keeping slot 0 cover banner intact)
    const customPhotos = storedGallery.filter(p => p.isCustom);
    if (customPhotos.length > 0) {
      setData(prev => {
        const existingPhotos = prev.photos || [];
        const hasCustomAlready = existingPhotos.some(p => customPhotos.some(cp => cp.url === p.url));
        if (!hasCustomAlready && existingPhotos.length > 0) {
          const coverPhoto = existingPhotos[0];
          const restPhotos = existingPhotos.slice(1).filter(p => !customPhotos.some(cp => cp.url === p.url));
          const newPhotos: ItineraryPhoto[] = [
            coverPhoto,
            ...customPhotos.map((cp, idx) => ({
              id: `custom-p-${Date.now()}-${idx}`,
              url: cp.url,
              caption: cp.caption,
              position: "center" as const,
              fit: "cover" as const
            })),
            ...restPhotos
          ].slice(0, 6);
          return { ...prev, photos: newPhotos };
        }
        return prev;
      });
    }
  }, []);

  // Save API Key permanently across browser and cloud
  const handleSaveApiKeyPermanently = async (newKey: string) => {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("traymbhkam_gemini_api_key", trimmed);
        const cachedSettings = localStorage.getItem("traymbhkam_settings_cache");
        const parsed = cachedSettings ? JSON.parse(cachedSettings) : {};
        localStorage.setItem("traymbhkam_settings_cache", JSON.stringify({ ...parsed, openai_key: trimmed }));
      } catch (e) {}
    }

    try {
      await supabase.from("settings").update({ openai_key: trimmed }).neq("id", "none");
    } catch (e) {}

    setKeySavedNotification(true);
    setAiError("");
    setTimeout(() => {
      setKeySavedNotification(false);
      setShowKeyInput(false);
    }, 2200);
  };

  // Quick Prompt Chips
  const QUICK_PROMPTS = [
    "Do Dham Yatra (Kedarnath & Badrinath 5 Nights / 6 Days Plan)",
    "Chardham Yatra 9 Nights / 10 Days Official Plan from Haridwar",
    "Kashmir Paradise 6D/5N (Srinagar, Gulmarg, Pahalgam)",
    "Golden Triangle Delhi-Agra-Jaipur 5D/4N luxury tour",
    "Kerala Honeymoon 6D/5N (Munnar, Thekkady, Alleppey Houseboat)"
  ];

  // AI Generator handler
  const handleAIGenerate = async (promptToUse?: string) => {
    const prompt = promptToUse || aiPrompt;
    if (!prompt.trim()) return;

    if (!apiKey.trim()) {
      setShowKeyInput(true);
      setAiError("Please enter your Google Gemini API key below to generate itineraries.");
      return;
    }

    setIsGenerating(true);
    setAiError("");

    try {
      const systemPrompt = `You are an elite Indian luxury travel designer creating brochures for "Traymbhkam Tour and Travels".
CRITICAL RULES:
1. Write in flawless, elegant British/Indian English. Absolutely ZERO spelling mistakes, grammatical errors, or garbled characters.
2. Under NO circumstance should you use weird symbols, unreadable encoding, or corrupted Unicode characters (e.g., do NOT output weird symbols like , special smart quotes, or corrupted apostrophes). Use only clean standard alphanumeric characters, commas, periods, hyphens (-), and simple arrows (→).
3. DAY NUMBERING: In the "days" array, "dayNumber" must be an integer (1, 2, 3...). In "dateStr", do NOT repeat the word "Day" or write "Day - Day 1" or "Day 1". Provide a concise day title (e.g. "Arrival & The Ascent", "The First Dham - Yamunotri", "Drive to Badrinath & Return").
4. OFFICIAL TRAYMBHKAM DAY-BY-DAY ROUTING FOR CHAR DHAM (9N/10D) & DO DHAM (5N/6D):
   - For 10 Days / 9 Nights Char Dham Yatra: Day 1 Haridwar to Barkot via Kempty Falls (Stay: Barkot), Day 2 Barkot to Janki Chatti & Yamunotri Dham Trek 6km & return (Stay: Barkot), Day 3 Barkot to Uttarkashi & Kashi Vishwanath Shakti Stambh (Stay: Uttarkashi), Day 4 Uttarkashi to Harsil Valley & Gangotri Dham & return (Stay: Uttarkashi), Day 5 Uttarkashi to Guptkashi & registration check (Stay: Guptkashi), Day 6 Guptkashi to Sonprayag/Gaurikund & 18km trek to Kedarnath Evening Aarti (Stay: Kedarnath Tent House - Without Food), Day 7 Kedarnath morning Abhishek & Bhairav Nath Temple then descend to Guptkashi (Stay: Guptkashi), Day 8 Guptkashi to Pipalkoti via Chopta (Stay: Pipalkoti), Day 9 Pipalkoti to Badrinath Dham & Mana Village (Vyas Gufa, Bhim Pul) 140km UP/DOWN & return to Pipalkoti (Stay: Pipalkoti), Day 10 Pipalkoti to Haridwar via Narsingh Temple Joshimath, Dhari Devi Temple & Panch Prayag (Tour Concludes).
   - For 6 Days / 5 Nights Do Dham (Kedarnath + Badrinath) Yatra: Day 1 Haridwar to Guptkashi / Sitapur (Stay: Guptkashi / Sitapur), Day 2 Guptkashi/Sitapur to Sonprayag/Gaurikund & 18km trek to Kedarnath (Stay: Kedarnath Tent House - Without Food), Day 3 Kedarnath & Bhairav Nath Temple then descend to Sitapur / Guptkashi (Stay: Sitapur / Guptkashi), Day 4 Sitapur/Guptkashi to Pipalkoti via Chopta (Stay: Pipalkoti), Day 5 Pipalkoti to Badrinath Dham & Mana Village (Vyas Gufa, Bhim Pul) 140km UP/DOWN & return to Pipalkoti (Stay: Pipalkoti), Day 6 Pipalkoti to Haridwar via Narsingh Temple Joshimath, Dhari Devi Temple & Panch Prayag (Tour Concludes).
5. SIGHTSEEING ROUTE: Use clean arrow formatting like "Haridwar → Guptkashi → Kedarnath".
6. RETURN ONLY valid, raw JSON (strictly no markdown wrappers, no \`\`\`json).
7. SINGLE PACKAGE ONLY: In "pricingTiers", generate strictly ONE package tier titled "Standard Package". Never generate 3 packages or multiple package tiers.
8. BLESSING MOTTO: "motto" must strictly be in Hindi: "जय श्री केदार · जय बद्री विशाल". Only this blessing tagline must be used.
9. VEHICLE & NON-AC IN HILLS: In Uttarakhand mountain and hill areas, AC is not allowed on the Yatra. Strictly write "Dedicated Hill Vehicle (Innova Crysta / Tempo Traveller - Non-AC in hill areas)".
10. STANDARD PACKAGE & SHARING TERMS: All hotel stays are on Triple or Quad-sharing basis (Meal provided as per hotel menu); in Kedarnath stay is on Five to Six sharing basis in Tent House (Without Food). 25% advance at the time of booking and balance amount to be deposited before starting the Yatra. In goodToKnow or booking terms, NEVER mention GST.

SCHEMA:
{
  "title": "Main Trip Title in CAPS e.g. KEDARNATH BADRINATH YATRA 2026",
  "subTitle": "Region/State in CAPS e.g. UTTARAKHAND",
  "spiritualHeadline": "e.g. 05 Nights · 06 Days Pilgrimage Plan",
  "dhamsSubtitle": "Key highlights e.g. Shri Kedarnath Dham · Shri Badrinath Dham",
  "preparedFor": "Honourable Guest",
  "travelDates": "e.g. May – October 2026",
  "duration": "e.g. 05 Nights / 06 Days",
  "startingPoint": "e.g. Haridwar, Uttarakhand",
  "routeCovered": "e.g. Haridwar – Guptkashi – Kedarnath – Sitapur – Chopta – Pipalkoti – Badrinath & Mana Village – Dhari Devi – Haridwar",
  "overviewSummary": "A compelling 2-3 sentence overview describing the holy pilgrimage/trip journey, key holy spots, and highlights.",
  "glanceDuration": "05 Nights / 06 Days",
  "glanceDhams": "Kedarnath · Badrinath",
  "glanceSector": "Haridwar ⇄ Do Dham Circuit",
  "glanceStartEnd": "Haridwar, Uttarakhand",
  "glancePackages": "Standard Package",
  "days": [
    {
      "dayNumber": 1,
      "dateStr": "Haridwar to Guptkashi / Sitapur",
      "route": "Haridwar → Devprayag & Rudraprayag → Guptkashi / Sitapur",
      "activities": [
        "Start early in the morning from Haridwar and enjoy a scenic drive along the holy Ganges and Alaknanda rivers.",
        "Witness the sacred river confluences at Devprayag and Rudraprayag.",
        "Overnight stay in Guptkashi or Sitapur (Hotel - Meal as per hotel menu)."
      ],
      "overnightStay": "Guptkashi / Sitapur (Hotel)"
    }
  ],
  "pricingSubtitle": "Confirmed Standard Package with dedicated mountain transport and verified accommodations.",
  "pricingTiers": [
    { "package": "Standard Package", "price": "", "hotelCategory": "Standard Clean Rooms (Triple/Quad) & Kedarnath Tent", "meals": "Breakfast & Dinner (As per Hotel Menu)", "specialFeature": "All Toll, Tax & Parking Included" }
  ],
  "pricingNote": "Note: All stays are on Triple or Quad-sharing basis (in Kedarnath 5 to 6 sharing Tent House without food). All toll, tax, and parking included.",
  "inclusions": [
    "Dedicated Hill Vehicle (Innova Crysta / Tempo Traveller - Non-AC in hill areas) for entire tour",
    "Accommodation on Triple/Quad sharing basis (Kedarnath 5-6 sharing Tent House without food)",
    "Meals provided as per hotel menu (Breakfast & Dinner at hotels)",
    "All toll, tax, parking and driver allowance included in the package"
  ],
  "exclusions": [
    "Meals at Kedarnath Tent House stay (Without Food)",
    "AC will not be allowed on the Yatra in hill areas",
    "Pony, palki, helicopter or VIP darshan charges",
    "Personal expenses (laundry, phone, tips, lunch)"
  ],
  "goodToKnow": [
    "All stays are on Triple or Quad-sharing basis; in Kedarnath stay will be on Five to Six sharing basis (Tent House without food).",
    "Meals are provided as per hotel menu; AC will not be allowed on the Yatra in hill areas.",
    "All toll, tax and parking are included in the package."
  ],
  "bookingPayment": [
    "25% advance at the time of booking and balance amount to be deposited before starting the Yatra.",
    "Official Website: www.traymbhkamtour.com | Contact: Hunny (+91 82660 16066, 9389880277)."
  ],
  "contactAgency": "Traymbhkam Tour and Travels",
  "contactPerson": "Mr. Gagandeep (Hunny)",
  "contactPhone": "+91 82660 16066 · 9389880277",
  "motto": "जय श्री केदार · जय बद्री विशाल"
}`;

      const cleanKey = apiKey.trim();
      let textResponse = "";
      let lastErrorMessage = "";

      // Provider 1: OpenRouter (sk-or-... or sk-...)
      if (cleanKey.startsWith("sk-or-") || cleanKey.startsWith("sk-")) {
        const openRouterModels = [
          "openrouter/free",
          "nex-agi/nex-n2.5-pro:free",
          "inclusionai/ling-3.0-flash-vl:free",
          "nvidia/nemotron-3.5-lightning:free",
          "qwen/qwen3.8-27b:free",
          "openrouter/auto"
        ];

        let openRouterSuccess = false;
        for (const orModel of openRouterModels) {
          try {
            const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${cleanKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://traymbhkam.com",
                "X-Title": "Traymbhkam Tour and Travels CRM"
              },
              body: JSON.stringify({
                model: orModel,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: `Generate a complete itinerary package for: ${prompt}` }
                ],
                temperature: 0.7
              })
            });

            if (orRes.ok) {
              const orJson = await orRes.json();
              textResponse = orJson.choices?.[0]?.message?.content?.trim() || "";
              if (textResponse) {
                if (!textResponse.includes("{") || !textResponse.includes("}")) {
                  lastErrorMessage = "Model returned non-JSON text: " + textResponse.substring(0, 30);
                  textResponse = "";
                  continue;
                }
                openRouterSuccess = true;
                break;
              }
            } else {
              const errData = await orRes.json().catch(() => null);
              lastErrorMessage = errData?.error?.message || `OpenRouter error status ${orRes.status}`;
            }
          } catch (e: any) {
            lastErrorMessage = e?.message || "OpenRouter network request failed";
          }
        }

        if (!openRouterSuccess || !textResponse) {
          throw new Error(lastErrorMessage || "OpenRouter API request failed across available models.");
        }
      } 
      // Provider 2: Hugging Face (hf_...)
      else if (cleanKey.startsWith("hf_")) {
        try {
          const hfRes = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${cleanKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "Qwen/Qwen2.5-72B-Instruct",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate a complete itinerary package for: ${prompt}` }
              ],
              response_format: { type: "json_object" },
              temperature: 0.7
            })
          });

          if (hfRes.ok) {
            const hfJson = await hfRes.json();
            textResponse = hfJson.choices?.[0]?.message?.content?.trim() || "";
          } else {
            const errData = await hfRes.json().catch(() => null);
            throw new Error(errData?.error || `Hugging Face error status ${hfRes.status}`);
          }
        } catch (e: any) {
          throw new Error(e?.message || "Hugging Face request failed");
        }
      } 
      // Provider 3: Google Gemini API (Standard)
      else {
        let candidateModels: string[] = [];
        try {
          const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
          if (listRes.ok) {
            const listJson = await listRes.json();
            if (Array.isArray(listJson?.models)) {
              candidateModels = listJson.models
                .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
                .map((m: any) => m.name.replace(/^models\//, ""))
                .sort((a: string, b: string) => {
                  const getScore = (name: string) => {
                    let score = 0;
                    if (name.includes("flash")) score += 20;
                    if (name.includes("3.8")) score += 9;
                    else if (name.includes("3.7")) score += 8;
                    else if (name.includes("3.6")) score += 7;
                    else if (name.includes("3.5")) score += 6;
                    else if (name.includes("3.1")) score += 5;
                    else if (name.includes("2.5")) score += 4;
                    else if (name.includes("2.0")) score += 2;
                    return score;
                  };
                  return getScore(b) - getScore(a);
                });
            }
          }
        } catch {}

        const fallbackList = [
          "gemini-3.8-flash",
          "gemini-3.7-flash",
          "gemini-3.5-flash",
          "gemini-3.5-flash-lite",
          "gemini-3.1-flash-lite",
          "gemini-2.5-flash",
          "gemini-2.5-flash-lite",
          "gemini-2.5-pro",
          "gemini-2.0-flash"
        ];

        const modelsToTry = Array.from(new Set([...candidateModels, ...fallbackList]));
        let geminiResponse: Response | null = null;

        for (const model of modelsToTry) {
          try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
            const res = await fetch(apiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: `Generate a complete itinerary package for: ${prompt}` }] }],
                generationConfig: {
                  temperature: 0.7,
                  responseMimeType: "application/json"
                }
              })
            });

            if (res.ok) {
              const tempJson = await res.json();
              const tempText = tempJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
              if (!tempText.includes("{") || !tempText.includes("}")) {
                lastErrorMessage = "Gemini returned non-JSON text: " + tempText.substring(0, 30);
                continue;
              }
              geminiResponse = new Response(JSON.stringify(tempJson), { status: 200, statusText: "OK" });
              break;
            } else {
              const errData = await res.json().catch(() => null);
              lastErrorMessage = errData?.error?.message || `Status ${res.status}`;
            }
          } catch (e: any) {
            lastErrorMessage = e?.message || "Network request failed";
          }
        }

        if (!geminiResponse || !geminiResponse.ok) {
          throw new Error(lastErrorMessage || "Gemini API request failed across available models.");
        }

        const resJson = await geminiResponse.json();
        textResponse = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      }

      if (!textResponse) {
        throw new Error("No response generated from AI API. Please verify your API key and quota.");
      }

      // Sanitize JSON text
      let cleanJson = textResponse.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
      
      const jsonStartIndex = cleanJson.indexOf("{");
      const jsonEndIndex = cleanJson.lastIndexOf("}");
      
      if (jsonStartIndex >= 0 && jsonEndIndex >= jsonStartIndex) {
        cleanJson = cleanJson.substring(jsonStartIndex, jsonEndIndex + 1);
      } else {
        throw new Error("AI output was blocked or did not contain valid JSON. Response: " + cleanJson.substring(0, 50));
      }

      let parsed;
      try {
        parsed = JSON.parse(cleanJson);
      } catch (err: any) {
        throw new Error("Failed to parse AI output: " + err.message);
      }

      // Helper to clean up any unwanted symbols, corrupted encodings, or garbled quotes
      const cleanText = (str: string): string => {
        if (!str || typeof str !== "string") return "";
        return str
          .replace(/[\uFFFD\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, "") // Remove unprintable / replacement chars
          .replace(/[‘’]/g, "'")
          .replace(/[“”]/g, '"')
          .replace(/â|â|â€“|â€”/g, "–")
          .replace(/â€™|â€˜/g, "'")
          .replace(/â€œ|â€/g, '"')
          .trim();
      };

      // Helper to clean up day dateStr and avoid "Day - Day 1" or double "Day 1"
      const formatDayDateStr = (rawStr: any, dayIndex: number): string => {
        if (!rawStr || typeof rawStr !== "string") return `Day ${dayIndex + 1}`;
        let cleaned = cleanText(rawStr);
        // Remove repetitive "Day - Day 1", "Day - Day", "Day 1 - Day 1", etc.
        cleaned = cleaned.replace(/^Day\s*[-–:]*\s*Day\s*\d*\s*[-–:]*\s*/i, "");
        cleaned = cleaned.replace(/^Day\s*\d+\s*[-–:]*\s*/i, "");
        cleaned = cleaned.replace(/^Day\s*\d+$/i, "");
        cleaned = cleaned.trim();
        return cleaned || `Day ${dayIndex + 1}`;
      };

      // Validate & merge with default fallback fields
      const newDays: DayPlan[] = (parsed.days || []).map((d: any, idx: number) => {
        const rawActivities = Array.isArray(d.activities) ? d.activities : [d.description || "Sightseeing and travel."];
        const cleanedActivities = rawActivities
          .map((act: any) => cleanText(String(act)))
          .filter((act: string) => act.length > 0);

        return {
          id: Date.now() + idx,
          dayNumber: idx + 1,
          dateStr: formatDayDateStr(d.dateStr, idx),
          route: cleanText(d.route || "Tour Route"),
          activities: cleanedActivities.length > 0 ? cleanedActivities : ["Sightseeing and travel."],
          overnightStay: cleanText(d.overnightStay || "Hotel")
        };
      });

      // Auto-pick matching photos from the Dham Photo Gallery for the generated itinerary
      const activeGallery = dhamGallery.length > 0 ? dhamGallery : getStoredDhamGallery();
      const matchedPhotos = pickDhamPhotosForItinerary(parsed, activeGallery);

      const cleanArray = (arr: any): string[] => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => cleanText(String(item))).filter(Boolean);
      };

      setData(prev => {
        const nextData = {
          ...prev,
          title: cleanText(parsed.title) || prev.title,
          subTitle: cleanText(parsed.subTitle) || prev.subTitle,
          spiritualHeadline: cleanText(parsed.spiritualHeadline) || prev.spiritualHeadline,
          dhamsSubtitle: cleanText(parsed.dhamsSubtitle) || prev.dhamsSubtitle,
          preparedFor: cleanText(parsed.preparedFor) || prev.preparedFor,
          travelDates: cleanText(parsed.travelDates) || prev.travelDates,
          duration: cleanText(parsed.duration) || prev.duration,
          startingPoint: cleanText(parsed.startingPoint) || prev.startingPoint,
          routeCovered: cleanText(parsed.routeCovered) || prev.routeCovered,
          overviewSummary: cleanText(parsed.overviewSummary) || prev.overviewSummary,
          glanceDuration: cleanText(parsed.glanceDuration || parsed.duration) || prev.glanceDuration,
          glanceDhams: cleanText(parsed.glanceDhams) || prev.glanceDhams,
          glanceSector: cleanText(parsed.glanceSector) || prev.glanceSector,
          glanceStartEnd: cleanText(parsed.glanceStartEnd) || prev.glanceStartEnd,
          glancePackages: "Standard Package",
          days: newDays.length > 0 ? newDays : prev.days,
          photos: matchedPhotos.length > 0 ? matchedPhotos : prev.photos,
          pricingSubtitle: cleanText(parsed.pricingSubtitle) || "Confirmed Standard Package with dedicated mountain transport and standard clean stays.",
          pricingTiers: Array.isArray(parsed.pricingTiers) && parsed.pricingTiers.length > 0 
            ? [
                {
                  package: "Standard Package",
                  price: cleanText(parsed.pricingTiers[0].price) || "₹ 24,500 / Pax",
                  hotelCategory: cleanText(parsed.pricingTiers[0].hotelCategory) || "Standard Clean Rooms / Mountain Stays",
                  meals: cleanText(parsed.pricingTiers[0].meals) || "Breakfast & Dinner (MAP)",
                  specialFeature: cleanText(parsed.pricingTiers[0].specialFeature) || "Dedicated Vehicle & Sightseeing"
                }
              ]
            : prev.pricingTiers,
          pricingNote: cleanText(parsed.pricingNote) || prev.pricingNote,
          inclusions: cleanArray(parsed.inclusions).length > 0 ? cleanArray(parsed.inclusions) : prev.inclusions,
          exclusions: cleanArray(parsed.exclusions).length > 0 ? cleanArray(parsed.exclusions) : prev.exclusions,
          goodToKnow: cleanArray(parsed.goodToKnow).length > 0 ? cleanArray(parsed.goodToKnow) : prev.goodToKnow,
          bookingPayment: cleanArray(parsed.bookingPayment).length > 0 ? cleanArray(parsed.bookingPayment) : prev.bookingPayment,
          motto: "जय श्री केदार · जय बद्री विशाल"
        };

        // Automatically store the latest active itinerary into localStorage
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("traymbhkam_current_itinerary", JSON.stringify(nextData));
          } catch (e) {}
        }

        return nextData;
      });

      if (matchedPhotos.length > 0) {
        setAiPhotoNotification(`✨ AI Auto-Matched ${matchedPhotos.length} Dham photos from Gallery for this tour.`);
      }

      setActiveTab("overview");
    } catch (err: any) {
      console.error("AI Generation error:", err);
      setAiError(err.message || "Failed to generate itinerary. Please verify your API key and prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Day Operations
  const addDay = () => {
    const nextNum = data.days.length + 1;
    const newDay: DayPlan = {
      id: Date.now(),
      dayNumber: nextNum,
      dateStr: `Day ${nextNum}`,
      route: "New Location → Destination",
      activities: ["Arrival and check-in", "Local sightseeing and leisure"],
      overnightStay: "Destination"
    };
    setData({ ...data, days: [...data.days, newDay] });
  };

  const removeDay = (id: number) => {
    const updated = data.days.filter(d => d.id !== id).map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setData({ ...data, days: updated });
  };

  const updateDayField = (id: number, field: keyof DayPlan, value: any) => {
    setData({
      ...data,
      days: data.days.map(d => d.id === id ? { ...d, [field]: value } : d)
    });
  };

  const addActivityBullet = (dayId: number) => {
    setData({
      ...data,
      days: data.days.map(d => {
        if (d.id === dayId) {
          return { ...d, activities: [...d.activities, "New activity / sightseeing spot"] };
        }
        return d;
      })
    });
  };

  const updateActivityBullet = (dayId: number, actIdx: number, val: string) => {
    setData({
      ...data,
      days: data.days.map(d => {
        if (d.id === dayId) {
          const acts = [...d.activities];
          acts[actIdx] = val;
          return { ...d, activities: acts };
        }
        return d;
      })
    });
  };

  const removeActivityBullet = (dayId: number, actIdx: number) => {
    setData({
      ...data,
      days: data.days.map(d => {
        if (d.id === dayId) {
          return { ...d, activities: d.activities.filter((_, i) => i !== actIdx) };
        }
        return d;
      })
    });
  };

  // Pricing Tiers operations
  const updateTier = (index: number, field: keyof PricingTier, val: string) => {
    const tiers = [...data.pricingTiers];
    tiers[index] = { ...tiers[index], [field]: val };
    setData({ ...data, pricingTiers: tiers });
  };

  const addTier = () => {
    setData({
      ...data,
      pricingTiers: [
        ...data.pricingTiers,
        { package: "Custom Tier", price: "₹ 50,000", hotelCategory: "Premium Hotels", meals: "All Meals", specialFeature: "Included" }
      ]
    });
  };

  const removeTier = (index: number) => {
    setData({
      ...data,
      pricingTiers: data.pricingTiers.filter((_, i) => i !== index)
    });
  };

  // Inclusions / Exclusions operations
  const updateInclusion = (index: number, val: string) => {
    const arr = [...data.inclusions];
    arr[index] = val;
    setData({ ...data, inclusions: arr });
  };
  const addInclusion = () => setData({ ...data, inclusions: [...data.inclusions, "New tour inclusion item"] });
  const removeInclusion = (index: number) => setData({ ...data, inclusions: data.inclusions.filter((_, i) => i !== index) });

  const updateExclusion = (index: number, val: string) => {
    const arr = [...data.exclusions];
    arr[index] = val;
    setData({ ...data, exclusions: arr });
  };
  const addExclusion = () => setData({ ...data, exclusions: [...data.exclusions, "New exclusion item"] });
  const removeExclusion = (index: number) => setData({ ...data, exclusions: data.exclusions.filter((_, i) => i !== index) });

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: ItineraryPhoto[] = [];
    let processedCount = 0;

    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          newPhotos.push({
            id: `photo-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
            url: base64,
            caption: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
          });
        }
        processedCount++;
        if (processedCount === files.length) {
          setData(prev => ({
            ...prev,
            photos: [...(prev.photos || []), ...newPhotos]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleAddPhotoByUrl = () => {
    if (!photoUrlInput.trim()) return;
    const newPhoto: ItineraryPhoto = {
      id: `photo-${Date.now()}`,
      url: photoUrlInput.trim(),
      caption: photoCaptionInput.trim() || "Spiritual Sightseeing Highlight"
    };
    setData(prev => ({
      ...prev,
      photos: [...(prev.photos || []), newPhoto]
    }));
    setPhotoUrlInput("");
    setPhotoCaptionInput("");
  };

  const handleAddPresetPhoto = (preset: typeof CURATED_PHOTO_PRESETS[0]) => {
    const newPhoto: ItineraryPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      url: preset.url,
      caption: preset.caption
    };
    setData(prev => ({
      ...prev,
      photos: [...(prev.photos || []), newPhoto]
    }));
  };

  const handleUpdatePhotoCaption = (id: string, caption: string) => {
    setData(prev => ({
      ...prev,
      photos: (prev.photos || []).map(p => p.id === id ? { ...p, caption } : p)
    }));
  };

  const handleRemovePhoto = (id: string) => {
    setData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter(p => p.id !== id)
    }));
  };

  const handleMovePhoto = (index: number, direction: "up" | "down") => {
    const current = [...(data.photos || [])];
    if (direction === "up" && index > 0) {
      const temp = current[index];
      current[index] = current[index - 1];
      current[index - 1] = temp;
    } else if (direction === "down" && index < current.length - 1) {
      const temp = current[index];
      current[index] = current[index + 1];
      current[index + 1] = temp;
    }
    setData(prev => ({ ...prev, photos: current }));
  };

  // Dham Photo Gallery Handlers
  const handleAutoMatchPhotos = () => {
    const activeGallery = dhamGallery.length > 0 ? dhamGallery : getStoredDhamGallery();
    const matched = pickDhamPhotosForItinerary(data, activeGallery);
    if (matched.length > 0) {
      setData(prev => ({ ...prev, photos: matched }));
      setAiPhotoNotification(`✨ AI auto-matched ${matched.length} Dham photos for your itinerary.`);
      setTimeout(() => setAiPhotoNotification(null), 4500);
    }
  };

  const handleTogglePhotoInBrochure = (photo: DhamGalleryPhoto) => {
    const current = data.photos || [];
    const exists = current.some(p => p.url === photo.url);
    if (exists) {
      setData(prev => ({
        ...prev,
        photos: (prev.photos || []).filter(p => p.url !== photo.url)
      }));
    } else {
      const newPhoto: ItineraryPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        url: photo.url,
        caption: photo.caption,
        position: "center",
        fit: "cover"
      };
      setData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), newPhoto]
      }));
    }
  };

  const handleApplyAllCustomUploads = () => {
    const activeGallery = dhamGallery.length > 0 ? dhamGallery : getStoredDhamGallery();
    const customPhotos = activeGallery.filter(p => p.isCustom);
    if (customPhotos.length === 0) {
      alert("No custom photos found in gallery. You can upload them in the Dham Photo Library tab!");
      return;
    }
    const newPhotos: ItineraryPhoto[] = customPhotos.map((cp, idx) => ({
      id: `custom-p-${Date.now()}-${idx}`,
      url: cp.url,
      caption: cp.caption,
      position: "center",
      fit: "cover"
    }));
    // Fill remaining up to 6 with existing or landmark photos
    const existingRemaining = (data.photos || []).filter(p => !customPhotos.some(cp => cp.url === p.url));
    const merged = [...newPhotos, ...existingRemaining].slice(0, 6);
    setData(prev => ({ ...prev, photos: merged }));
    setAiPhotoNotification(`✓ Applied ${newPhotos.length} custom photo(s) from your gallery!`);
    setTimeout(() => setAiPhotoNotification(null), 4000);
  };

  const addHotelPhoto = () => {
    const newHp: HotelPhoto = {
      id: `hp-${Date.now()}`,
      url: "/gallery/chardham_10d_img_31.jpg",
      hotelName: "Standard Clean Stay",
      location: "Uttarakhand",
      roomType: "Standard Room",
      caption: "Clean sanitized room with attached bathroom and hot water",
      fit: "cover"
    };
    setData(prev => ({
      ...prev,
      hotelPhotos: [...(prev.hotelPhotos || []), newHp],
      showHotelPhotos: true
    }));
  };

  const updateHotelPhoto = (id: string, field: keyof HotelPhoto, value: any) => {
    setData(prev => ({
      ...prev,
      hotelPhotos: (prev.hotelPhotos || []).map(hp => hp.id === id ? { ...hp, [field]: value } : hp)
    }));
  };

  const removeHotelPhoto = (id: string) => {
    setData(prev => ({
      ...prev,
      hotelPhotos: (prev.hotelPhotos || []).filter(hp => hp.id !== id)
    }));
  };

  const loadCuratedHotelPhotos = () => {
    setData(prev => ({
      ...prev,
      hotelPhotos: CURATED_HOTEL_PHOTO_PRESETS,
      showHotelPhotos: true
    }));
    setAiPhotoNotification("✓ Loaded verified hotel & camp photos preset!");
    setTimeout(() => setAiPhotoNotification(null), 4000);
  };

  const handleHotelFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateHotelPhoto(id, "url", base64);
        // Also save to custom uploads library in dhamGallery
        const newPhoto: DhamGalleryPhoto = {
          id: `custom-hotel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url: base64,
          caption: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
          dham: "custom",
          dhamLabel: "Custom Uploads",
          isCustom: true,
          createdAt: new Date().toISOString()
        };
        const updated = [newPhoto, ...dhamGallery];
        setDhamGallery(updated);
        saveStoredDhamGallery(updated);
        setAiPhotoNotification("✓ Hotel photo uploaded and applied to stay!");
        setTimeout(() => setAiPhotoNotification(null), 3500);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleUploadNewStayPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const hotelName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        const newHp: HotelPhoto = {
          id: `hp-${Date.now()}`,
          url: base64,
          hotelName: hotelName || "Standard Clean Stay",
          location: "Uttarakhand Sector",
          roomType: "Standard Room",
          caption: "Clean sanitized room with attached bathroom and hot water",
          fit: "cover"
        };
        setData(prev => ({
          ...prev,
          hotelPhotos: [...(prev.hotelPhotos || []), newHp],
          showHotelPhotos: true
        }));
        // Also save to custom uploads library in dhamGallery
        const newPhoto: DhamGalleryPhoto = {
          id: `custom-hotel-${Date.now()}`,
          url: base64,
          caption: hotelName,
          dham: "custom",
          dhamLabel: "Custom Uploads",
          isCustom: true,
          createdAt: new Date().toISOString()
        };
        const updated = [newPhoto, ...dhamGallery];
        setDhamGallery(updated);
        saveStoredDhamGallery(updated);
        setAiPhotoNotification(`✓ Added new stay with uploaded photo "${hotelName}"!`);
        setTimeout(() => setAiPhotoNotification(null), 3500);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleUpdatePhotoSetting = (id: string, field: "position" | "fit", val: any) => {
    setData(prev => ({
      ...prev,
      photos: (prev.photos || []).map(p => p.id === id ? { ...p, [field]: val } : p)
    }));
  };

  const handleAddDhamPhotoFromUrl = () => {
    if (!newDhamUploadUrl.trim()) return;
    const cat = DHAM_CATEGORIES.find(c => c.key === newDhamUploadTag);
    const newPhoto: DhamGalleryPhoto = {
      id: `custom-dham-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      url: newDhamUploadUrl.trim(),
      caption: newDhamUploadCaption.trim() || `${cat?.label || "Holy"} Highlight`,
      dham: newDhamUploadTag,
      dhamLabel: cat?.label || "Uttarakhand Dham",
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    const updated = [newPhoto, ...dhamGallery];
    setDhamGallery(updated);
    saveStoredDhamGallery(updated);
    setNewDhamUploadUrl("");
    setNewDhamUploadCaption("");
    setAiPhotoNotification(`✓ Added new photo to ${newPhoto.dhamLabel} library!`);
    setTimeout(() => setAiPhotoNotification(null), 3500);
  };

  const handleDhamFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const cat = DHAM_CATEGORIES.find(c => c.key === newDhamUploadTag);
    const addedPhotos: DhamGalleryPhoto[] = [];
    let count = 0;

    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          addedPhotos.push({
            id: `custom-dham-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
            url: base64,
            caption: newDhamUploadCaption.trim() || file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
            dham: newDhamUploadTag,
            dhamLabel: cat?.label || "Uttarakhand Dham",
            isCustom: true,
            createdAt: new Date().toISOString()
          });
        }
        count++;
        if (count === files.length) {
          const updated = [...addedPhotos, ...dhamGallery];
          setDhamGallery(updated);
          saveStoredDhamGallery(updated);
          setNewDhamUploadCaption("");
          setAiPhotoNotification(`✓ Uploaded ${addedPhotos.length} photo(s) to ${cat?.label} library!`);
          setTimeout(() => setAiPhotoNotification(null), 3500);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleDeleteDhamPhoto = (id: string) => {
    const updated = dhamGallery.filter(p => p.id !== id);
    setDhamGallery(updated);
    saveStoredDhamGallery(updated);
  };

  // Transfer current itinerary directly to Transport Voucher Studio
  const [transferredToTransport, setTransferredToTransport] = useState(false);
  const handleSendToTransport = () => {
    if (typeof window === "undefined") return;

    // Convert days to transport schedule
    const transportSchedule = data.days.map((day, idx) => ({
      date: `Day ${day.dayNumber}`,
      details: `${day.route}${day.activities && day.activities.length > 0 ? " — " + day.activities.join("; ") : ""}`,
      hotel: day.overnightStay ? (day.overnightStay.toLowerCase().includes("tent") ? day.overnightStay : `Hotel / Camp, ${day.overnightStay}`) : "Hotel / Camp"
    }));

    const transportData = {
      date: data.travelDates || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      exoNo: `UK-TR-${new Date().getFullYear()}`,
      fileNo: "01",
      guestName: data.preparedFor || "Valued Guest",
      managerMobile: data.contactPhone || "+91 82660 16066",
      noOfAdults: "As per booking",
      vehicleType: "01 Innova Crysta / Tempo Traveller (Non-AC in Hills)",
      arrivalDate: data.travelDates ? `${data.travelDates} ~ ${data.startingPoint || "Haridwar / Dehradun"}` : "Haridwar / Dehradun",
      departureDate: data.travelDates ? `${data.travelDates} ~ Tour Concludes` : "Tour Concludes",
      favouringGuest: data.preparedFor || "Valued Guest",
      favouringPax: "As per booking",
      favouringVehicle: "01 Innova Crysta / Tempo Traveller (Non-AC in Hills)",
      itinerary: transportSchedule.length > 0 ? transportSchedule : [
        { date: "Day 1", details: "Pickup & scenic drive", hotel: "Hotel" }
      ]
    };

    try {
      localStorage.setItem("traymbhkam_current_itinerary", JSON.stringify(data));
      localStorage.setItem("traymbhkam_transport_voucher_data", JSON.stringify(transportData));
      setTransferredToTransport(true);
      setTimeout(() => setTransferredToTransport(false), 3000);
    } catch (err) {
      console.warn("Could not save to localStorage:", err);
    }
  };

  // PDF Multi-Page Generation (captures from print containers)
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);

      const html2canvasModule = await import("html2canvas-pro");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.jsPDF;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const pageIds = [
        "print-itinerary-page-1", 
        "print-itinerary-page-2", 
        "print-itinerary-page-3", 
        "print-itinerary-page-4",
        "print-itinerary-page-5",
        "print-itinerary-page-6"
      ];

      for (let i = 0; i < pageIds.length; i++) {
        const el = document.getElementById(pageIds[i]);
        if (!el) continue;

        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);

        // Add clickable PDF link annotations for all links in the document!
        try {
          const linkEls = el.querySelectorAll("a[href], [data-pdf-link]");
          const containerRect = el.getBoundingClientRect();
          linkEls.forEach((linkNode) => {
            const rect = linkNode.getBoundingClientRect();
            const targetUrl = linkNode.getAttribute("data-pdf-link") || (linkNode as HTMLAnchorElement).href;
            if (targetUrl && rect.width > 0 && rect.height > 0 && containerRect.width > 0 && containerRect.height > 0) {
              const x = ((rect.left - containerRect.left) / containerRect.width) * pageWidth;
              const y = ((rect.top - containerRect.top) / containerRect.height) * pageHeight;
              const w = (rect.width / containerRect.width) * pageWidth;
              const h = (rect.height / containerRect.height) * pageHeight;
              pdf.link(x, y, w, h, { url: targetUrl });
            }
          });
        } catch (linkErr) {
          console.warn("Could not attach PDF link annotations:", linkErr);
        }
      }

      const filename = `${data.title.replace(/[^a-zA-Z0-9]/g, "_")}_${data.preparedFor.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      pdf.save(filename);

      // Save to Supabase Cloud
      try {
        await supabase.from("itineraries").insert({
          title: data.title,
          total_cost: parseInt(data.pricingTiers[0]?.price.replace(/[^0-9]/g, "") || "0"),
          document_data: data
        });
      } catch (e) {
        console.warn("Could not save to supabase cloud:", e);
      }

      // Record in local Document Hub
      try {
        const costNum = parseInt(data.pricingTiers[0]?.price.replace(/[^0-9]/g, "") || "0");
        saveDocumentToHub({
          id: `itin-${data.title.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`,
          type: "itinerary",
          title: data.title,
          docNumber: `ITIN-${data.duration.replace(/[^0-9DNdn]/g, "").toUpperCase() || "YATRA"}`,
          guestName: data.preparedFor || "Honourable Guest",
          travelDates: `${data.travelDates} (${data.duration})`,
          amount: costNum,
          detailsSummary: `Route: ${data.routeCovered} | Highlights: ${data.glanceDhams || data.spiritualHeadline}`,
          studioUrl: "/itinerary-builder",
          rawPayload: data
        });
      } catch (hubErr) {
        console.warn("Local hub save:", hubErr);
      }

    } catch (err: any) {
      console.error("PDF generation failed:", err);
      alert(`Could not generate PDF: ${err.message || err}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = `*${data.title}* - ${data.spiritualHeadline}
*Prepared For:* ${data.preparedFor}
*Dates:* ${data.travelDates} (${data.duration})
*Route:* ${data.routeCovered}

*Package Options:*
${data.pricingTiers.map(t => `• *${t.package}*: ${t.price} (${t.hotelCategory})`).join("\n")}

*Contact & Bookings:*
${data.contactAgency}
${data.contactPerson} (${data.contactPhone})
${data.motto}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // =========================================================
  // MODULAR PAGE RENDERERS (Identical across Preview & Print)
  // =========================================================
  
  const renderPage1 = (prefix: string) => {
    // Dynamic Circuit and Dham Detection
    const textCorpus = [
      data.title || "",
      data.subTitle || "",
      data.dhamsSubtitle || "",
      data.routeCovered || "",
      data.overviewSummary || "",
      ...(data.days || []).flatMap(d => [d.route || "", ...(d.activities || []), d.overnightStay || ""])
    ].join(" ").toLowerCase();

    const hasKedarnath = /kedarnath|kedar|shri kedar/i.test(textCorpus);
    const hasBadrinath = /badrinath|badri|mana village|joshimath/i.test(textCorpus);
    const hasGangotri = /gangotri|bhagirathi|uttarkashi|harsil/i.test(textCorpus);
    const hasYamunotri = /yamunotri|yamuna|barkot|janki chatti/i.test(textCorpus);

    const isCharDham =
      /chardham|char dham/i.test(textCorpus) ||
      ((hasYamunotri || hasGangotri) && hasKedarnath && hasBadrinath) ||
      data.days.length >= 8;

    const isDoDham =
      !isCharDham &&
      (/do dham|dodham|kedarnath badrinath/i.test(textCorpus) ||
        (hasKedarnath && hasBadrinath) ||
        data.days.length <= 7);

    // Resolve matching default authentic hero image for the active Dham circuit
    let defaultHeroUrl = "/gallery/chardham_10d_img_1.jpg";
    let defaultHeroCaption = "Char Dham Yatra — Yamunotri · Gangotri · Kedarnath · Badrinath";

    if (isDoDham) {
      defaultHeroUrl = "/gallery/dodham_banner.jpg";
      defaultHeroCaption = "Do Dham Yatra — Shri Kedarnath Dham & Shri Badrinath Dham";
    } else if (isCharDham) {
      defaultHeroUrl = "/gallery/chardham_10d_img_1.jpg";
      defaultHeroCaption = "Char Dham Yatra — Yamunotri · Gangotri · Kedarnath · Badrinath";
    } else if (hasKedarnath && !hasBadrinath) {
      defaultHeroUrl = "/gallery/kedarnath_temple.png";
      defaultHeroCaption = "Shri Kedarnath Temple & Holy Nandi Darshan";
    } else if (hasBadrinath && !hasKedarnath) {
      defaultHeroUrl = "/gallery/chardham_10d_img_15.jpg";
      defaultHeroCaption = "Holy Shri Badrinath Ji Temple";
    } else if (hasGangotri) {
      defaultHeroUrl = "/gallery/chardham_10d_img_8.jpg";
      defaultHeroCaption = "Holy Shri Gangotri Dham Temple";
    } else if (hasYamunotri) {
      defaultHeroUrl = "/gallery/chardham_10d_img_5.jpg";
      defaultHeroCaption = "Holy Shri Yamunotri Dham Temple";
    }

    const firstPhoto = data.photos?.[0];
    let heroPhotoUrl = firstPhoto?.url;
    let heroCaption = firstPhoto?.caption || defaultHeroCaption;

    // Smart auto-selection if not explicitly customized or if older circular/fallback photo was saved
    if (!heroPhotoUrl || heroPhotoUrl === "/gallery/kedarnath_temple.png") {
      heroPhotoUrl = defaultHeroUrl;
      heroCaption = defaultHeroCaption;
    } else if (isDoDham && heroPhotoUrl === "/gallery/chardham_10d_img_1.jpg") {
      heroPhotoUrl = "/gallery/dodham_banner.jpg";
      heroCaption = defaultHeroCaption;
    } else if (isCharDham && heroPhotoUrl === "/gallery/dodham_banner.jpg") {
      heroPhotoUrl = "/gallery/chardham_10d_img_1.jpg";
      heroCaption = defaultHeroCaption;
    }

    const photoFitClass = firstPhoto?.fit === "contain" ? "object-contain bg-slate-950" : "object-cover";
    const photoPosClass = firstPhoto?.position === "top" ? "object-top" : firstPhoto?.position === "bottom" ? "object-bottom" : "object-[center_35%]";

    return (
      <div
        id={`${prefix}-itinerary-page-1`}
        className="w-[794px] min-h-[1122px] h-[1122px] max-h-[1122px] bg-[#fcfbf9] shadow-2xl shrink-0 px-9 py-8 flex flex-col justify-between relative overflow-hidden text-gray-900 border border-amber-300/60 font-sans-body"
        style={{ boxSizing: "border-box" }}
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
        </div>

        {/* Top Decorative Chevron Accent Bar */}
        <div className="relative z-10 w-full flex items-center justify-between gap-2 mb-1">
          <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-[#0f2744] rounded-full" />
          <span className="text-[10px] font-display font-black uppercase tracking-[0.25em] text-amber-700">✦ UTTARAKHAND OFFICIAL PILGRIMAGE DOSSIER ✦</span>
          <div className="h-1 flex-1 bg-gradient-to-r from-[#0f2744] via-amber-400 to-amber-500 rounded-full" />
        </div>

        {/* Floating Brand Header Pill */}
        <div className="relative z-10 bg-white/95 backdrop-blur-xs border border-amber-200/90 shadow-md rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <img src="/logo.png" alt="Traymbhkam Tour and Travels" className="h-14 w-auto object-contain shrink-0 drop-shadow-xs" />
            <div className="min-w-0">
              <h2 className="text-[17px] font-serif-luxury font-black tracking-tight text-[#0f2744] leading-tight uppercase">
                Traymbhkam Tour and Travels
              </h2>
              <p className="text-[9.5px] font-display font-bold text-amber-700 uppercase tracking-widest mt-0.5">
                Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2022/004983 · 010/RTA/23
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="bg-[#0f2744] text-amber-300 border border-amber-400/40 px-3.5 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider shadow-2xs">
              ✦ 2026 OFFICIAL ITINERARY ✦
            </div>
            <p className="text-[9px] text-gray-500 font-medium mt-1">Haridwar Central Operations Desk</p>
          </div>
        </div>

        {/* Central Grand Hero Showcase: Rectangular Master Frame (No Circle) */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1 w-full">
          {/* Rectangular Master Frame with Gold Rim & Subtle Shadow */}
          <div className="relative w-full rounded-2xl p-1.5 border-2 border-amber-400/80 ring-4 ring-amber-500/15 shadow-2xl bg-gradient-to-b from-amber-200/70 via-white to-amber-100/80 mb-3">
            <div className="w-full h-[310px] rounded-xl overflow-hidden bg-slate-950 border border-amber-300/80 relative shadow-inner">
              <img 
                src={heroPhotoUrl} 
                alt={heroCaption || "Sacred Dham Himalayan Shrines"} 
                className={`w-full h-full ${photoFitClass} ${photoPosClass}`}
              />
              {/* Subtle dark gradient overlay at bottom for contrast */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a192f]/90 via-[#0a192f]/50 to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-between px-4 pointer-events-none">
                <span className="text-[11px] font-display font-bold text-amber-200 tracking-wider uppercase drop-shadow-md">
                  {heroCaption || (isDoDham ? "Shri Kedarnath Dham & Shri Badrinath Dham" : "Yamunotri · Gangotri · Kedarnath · Badrinath")}
                </span>
                <span className="text-[9.5px] font-display font-bold text-amber-300 bg-[#0f2744]/90 px-3 py-0.5 rounded-full border border-amber-400/50 shadow-xs uppercase tracking-wider">
                  {isDoDham ? "✦ Do Dham Sacred Route ✦" : isCharDham ? "✦ Char Dham Complete Circuit ✦" : "✦ Holy Pilgrimage Circuit ✦"}
                </span>
              </div>
            </div>
          </div>

          {/* Titles & Holy Chant */}
          <div className="text-center space-y-1 max-w-xl">
            <p className="font-display text-[11px] font-bold tracking-[0.25em] text-amber-700 uppercase">
              UTTARAKHAND · SACRED HIMALAYAN EXPEDITION
            </p>
            <h1 className="font-serif-luxury text-4xl font-black text-[#0f2744] tracking-tight uppercase leading-none drop-shadow-2xs">
              {data.title}
            </h1>
            <p className="font-serif-luxury text-[14px] font-bold text-amber-800 tracking-wide mt-1">
              {data.subTitle}
            </p>
            <p className="font-serif-luxury text-[13px] text-amber-700 italic font-medium pt-0.5">
              ॥ ॐ नमः शिवाय · जय श्री केदार · जय बद्री विशाल ॥
            </p>

            {/* Sacred Circuit Badges */}
            {(() => {
              const badges = isDoDham
                ? ["Shri Kedarnath Dham", "Chopta Valley", "Shri Badrinath Dham", "Mana Village & Dhari Devi"]
                : ["Yamunotri", "Gangotri", "Kedarnath", "Badrinath"];
              return (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {badges.map((badge, bIdx) => (
                    <span key={bIdx} className="inline-flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-full text-[10.5px] font-display font-bold shadow-2xs">
                        {badge}
                      </span>
                      {bIdx < badges.length - 1 && <span className="text-amber-500 font-bold">◆</span>}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Trust Strip */}
          <div className="mt-3 px-4 py-1.5 bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 border border-amber-300/80 rounded-full text-center">
            <p className="text-[10px] font-display font-bold uppercase tracking-wider text-amber-950 flex items-center justify-center gap-2">
              <span>✦ 12+ YEARS SERVING DEVOTEES</span>
              <span className="text-amber-500">•</span>
              <span>VERIFIED HOTELS &amp; FLEET</span>
              <span className="text-amber-500">•</span>
              <span>24/7 HARIDWAR ON-GROUND DESK ✦</span>
            </p>
          </div>
        </div>

        {/* Bottom 4-Column Luxury Dossier Card */}
        <div className="relative z-10 bg-gradient-to-r from-[#0a192f] via-[#0f2744] to-[#0a192f] text-white rounded-2xl p-4 border border-amber-400/40 shadow-xl grid grid-cols-4 gap-3 text-center">
          <div className="border-r border-slate-700/80 pr-2">
            <span className="text-[9px] uppercase font-display font-bold tracking-widest text-amber-400 block mb-0.5">
              PREPARED FOR
            </span>
            <span className="text-[13px] font-serif-luxury font-black text-white leading-tight block truncate">
              {data.preparedFor || "Honourable Pilgrims"}
            </span>
          </div>

          <div className="border-r border-slate-700/80 pr-2">
            <span className="text-[9px] uppercase font-display font-bold tracking-widest text-amber-400 block mb-0.5">
              TRAVEL DATES
            </span>
            <span className="text-[12px] font-display font-bold text-slate-100 leading-tight block truncate">
              {data.travelDates}
            </span>
          </div>

          <div className="border-r border-slate-700/80 pr-2">
            <span className="text-[9px] uppercase font-display font-bold tracking-widest text-amber-400 block mb-0.5">
              DURATION
            </span>
            <span className="text-[12px] font-display font-bold text-amber-300 leading-tight block truncate">
              {data.duration}
            </span>
          </div>

          <div>
            <span className="text-[9px] uppercase font-display font-bold tracking-widest text-amber-400 block mb-0.5">
              STARTING POINT
            </span>
            <span className="text-[12px] font-display font-bold text-slate-100 leading-tight block truncate">
              {data.startingPoint}
            </span>
          </div>
        </div>

        {/* Page 1 Footer */}
        <div className="relative z-10 border-t border-slate-300/80 pt-2 flex justify-between items-center text-[9.5px] text-gray-500 font-sans-body">
          <span className="font-semibold text-gray-700">Traymbhkam Tour and Travels · {data.contactPhone || "+91 82660 16066"}</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0f2744] flex items-center gap-1">
              <span>📍 Opp. Railway Station Gate No. 2, Haridwar</span>
            </span>
            <span className="text-amber-500">•</span>
            <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Govt. Reg: UTTR/HARIDWAR/08-2022/004983 · 010/RTA/23
            </span>
          </div>
          <span className="font-display font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">Page 1 of 6</span>
        </div>
      </div>
    );
  };

  const renderPage2 = (prefix: string) => {
    const previewPhotos = (data.photos && data.photos.length > 0) ? data.photos.slice(0, 3) : [
      { id: "p1", url: "/gallery/chardham_10d_img_1.jpg", caption: "Char Dham Yatra - 4 Sacred Shrines" },
      { id: "p2", url: "/gallery/kedarnath_temple.png", caption: "Shri Kedarnath Temple & Holy Nandi Darshan" },
      { id: "p3", url: "/gallery/chardham_10d_img_15.jpg", caption: "Holy Shri Badrinath Ji Temple" }
    ];

    return (
      <div
        id={`${prefix}-itinerary-page-2`}
        className="w-[794px] min-h-[1122px] h-[1122px] max-h-[1122px] bg-[#fcfbf9] shadow-2xl shrink-0 px-9 py-8 flex flex-col justify-between relative overflow-hidden text-gray-900 border border-amber-300/60 font-sans-body"
        style={{ boxSizing: "border-box" }}
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
        </div>

        {/* Top Decorative Chevron Band */}
        <div className="relative z-10 w-full flex items-center justify-between gap-2 mb-1">
          <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-[#0f2744] rounded-full" />
          <span className="text-[10px] font-display font-black uppercase tracking-[0.25em] text-amber-700">✦ EXPEDITION BLUEPRINT ✦</span>
          <div className="h-1 flex-1 bg-gradient-to-r from-[#0f2744] via-amber-400 to-amber-500 rounded-full" />
        </div>

        <div className="relative z-10 space-y-4">
          
          {/* Header Title */}
          <div className="flex items-center justify-between border-b-2 border-amber-400/40 pb-2">
            <div>
              <h2 className="text-xl font-serif-luxury font-black text-[#0f2744] tracking-tight uppercase flex items-center gap-2">
                <span>✦ Your Journey At A Glance</span>
              </h2>
              <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                Comprehensive Pilgrimage Overview, Sector Statistics &amp; Sacred Route Map
              </p>
            </div>
            <span className="text-[10.5px] font-display font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
              Verified Pilgrimage Plan
            </span>
          </div>

          {/* 4 Navy Stat Cards Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-[#0f2744] text-white p-3 rounded-xl border border-amber-400/30 shadow-xs flex flex-col justify-between">
              <span className="text-[9px] uppercase font-display font-bold tracking-widest text-amber-400">
                SACRED DHAMS
              </span>
              <p className="text-[12px] font-bold text-white mt-1 leading-tight">
                {data.glanceDhams || "4 Dhams Complete"}
              </p>
              <span className="text-[8.5px] text-slate-300 mt-1 truncate">
                {data.dhamsSubtitle || "Yamunotri · Gangotri · Kedar · Badri"}
              </span>
            </div>

            <div className="bg-[#0f2744] text-white p-3 rounded-xl border border-amber-400/30 shadow-xs flex flex-col justify-between">
              <span className="text-[9px] uppercase font-display font-bold tracking-widest text-amber-400">
                KEDARNATH SECTOR
              </span>
              <p className="text-[12px] font-bold text-white mt-1 leading-tight">
                {data.glanceSector || "Sonprayag / Gaurikund"}
              </p>
              <span className="text-[8.5px] text-slate-300 mt-1">Helicopter / Trek base assistance</span>
            </div>

            <div className="bg-[#0f2744] text-white p-3 rounded-xl border border-amber-400/30 shadow-xs flex flex-col justify-between">
              <span className="text-[9px] uppercase font-display font-bold tracking-widest text-amber-400">
                START / FINISH
              </span>
              <p className="text-[12px] font-bold text-white mt-1 leading-tight">
                {data.glanceStartEnd || "Haridwar / Rishikesh / DED"}
              </p>
              <span className="text-[8.5px] text-slate-300 mt-1">Door-to-door terminal transfers</span>
            </div>

            <div className="bg-[#0f2744] text-white p-3 rounded-xl border border-amber-400/30 shadow-xs flex flex-col justify-between">
              <span className="text-[9px] uppercase font-display font-bold tracking-widest text-amber-400">
                PACKAGE OPTIONS
              </span>
              <p className="text-[12px] font-bold text-amber-300 mt-1 leading-tight">
                {data.glancePackages || "Standard Package"}
              </p>
              <span className="text-[8.5px] text-slate-300 mt-1">Meals as per hotel menu &amp; vehicle</span>
            </div>
          </div>

          {/* Visual 3-Photo Showcase */}
          <div className="grid grid-cols-3 gap-3">
            {previewPhotos.map((photo, idx) => (
              <div key={photo.id || idx} className="rounded-xl overflow-hidden border border-amber-300/70 shadow-xs bg-white flex flex-col">
                <div className="h-32 relative overflow-hidden bg-slate-900">
                  <img 
                    src={photo.url} 
                    alt={photo.caption || `Highlight ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#0f2744]/90 text-amber-300 rounded text-[8.5px] font-display font-bold uppercase tracking-wider">
                    Spot 0{idx + 1}
                  </div>
                </div>
                <div className="p-2 bg-amber-50/40 text-center">
                  <p className="text-[10px] font-display font-bold text-gray-900 truncate">
                    {photo.caption || "Sacred Himalayan Darshan"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Overview Summary Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
            <h3 className="text-xs font-display font-bold text-[#0f2744] uppercase tracking-wider flex items-center justify-between">
              <span>✦ Circuit Summary &amp; Divine Blessings</span>
              <span className="text-[10px] font-normal text-amber-800 italic">Curated by Mr. Gagandeep</span>
            </h3>
            <p className="text-[11px] text-gray-700 leading-relaxed text-justify">
              {data.overviewSummary}
            </p>
          </div>

          {/* Trip Snapshot Table */}
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-[11px]">
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-amber-50/30">
                  <td className="px-4 py-2 font-display font-bold text-gray-700 w-1/3 text-[10.5px]">Complete Duration</td>
                  <td className="px-4 py-2 font-semibold text-[#0f2744]">{data.glanceDuration} ({data.travelDates})</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-display font-bold text-gray-700 text-[10.5px]">Sacred Circuit Covered</td>
                  <td className="px-4 py-2 font-medium text-gray-800">{data.routeCovered}</td>
                </tr>
                <tr className="bg-amber-50/30">
                  <td className="px-4 py-2 font-display font-bold text-gray-700 text-[10.5px]">Kedarnath Sector Staging</td>
                  <td className="px-4 py-2 font-medium text-gray-800">{data.glanceSector}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-display font-bold text-gray-700 text-[10.5px]">Pick-up &amp; Drop Terminals</td>
                  <td className="px-4 py-2 font-medium text-gray-800">{data.startingPoint} · Door-to-Door hill transfer</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dedicated Tourist Fleet Showcase (Tempo Travellers & Mountain Taxis) */}
          <div className="rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/50 p-2.5 shadow-2xs flex items-center gap-3">
            <div className="w-44 h-18 rounded-lg overflow-hidden bg-slate-900 border border-amber-200 shrink-0 relative shadow-inner">
              <img
                src={data.trustPhotos?.vehiclePhoto || "/gallery/traymbhkam_fleet_lineup.png"}
                alt="Dedicated Mountain Tourist Fleet"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 text-[7px] font-display font-bold px-1.5 py-0.2 bg-[#0f2744]/90 text-amber-300 rounded shadow-xs">
                Official Fleet
              </span>
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[10.5px] font-serif-luxury font-bold text-[#0f2744] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Dedicated Mountain Tourist Fleet &amp; Expert Hill Drivers</span>
                </h4>
                <span className="text-[8px] font-display font-bold text-amber-900 bg-amber-100/80 px-2 py-0.2 rounded border border-amber-200 shrink-0">
                  Govt Permit 010/RTA/23
                </span>
              </div>
              <p className="text-[9px] text-gray-700 leading-tight">
                {data.trustPhotos?.vehicleCaption || "Commercial yellow-plate Tempo Travellers & Luxury Hill Cabs (Innova Crysta / Dzire). Expert chauffeurs trained for safe high-altitude Himalayan mountain terrain."}
              </p>
              <div className="flex items-center gap-2.5 text-[8px] font-semibold text-slate-600 pt-0.5">
                <span className="text-emerald-700 font-bold">✓ Dedicated Assigned Vehicle</span>
                <span>•</span>
                <span className="text-amber-800">✓ Uttarakhand Hill Permit</span>
                <span>•</span>
                <span className="text-[#0f2744]">✓ All Toll, Green Tax &amp; Parking Included</span>
              </div>
            </div>
          </div>

          {/* 3 Feature Pillars */}
          <div className="grid grid-cols-3 gap-3 pt-0.5">
            <div className="p-2.5 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-0.5">
              <div className="flex items-center gap-1.5 text-amber-700 font-display font-bold text-[10.5px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dedicated Mountain Fleet</span>
              </div>
              <p className="text-[9px] text-gray-600 leading-tight">
                Commercial taxi permit vehicles with experienced Uttarakhand hill drivers.
              </p>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-0.5">
              <div className="flex items-center gap-1.5 text-amber-700 font-display font-bold text-[10.5px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pre-Inspected Stays</span>
              </div>
              <p className="text-[9px] text-gray-600 leading-tight">
                Verified clean rooms with hot water &amp; hygienic pure vegetarian meals.
              </p>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-0.5">
              <div className="flex items-center gap-1.5 text-amber-700 font-display font-bold text-[10.5px]">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>24/7 Haridwar Control Desk</span>
              </div>
              <p className="text-[9px] text-gray-600 leading-tight">
                Direct management support for permits, weather &amp; yatra route guidance.
              </p>
            </div>
          </div>

        </div>

        {/* Page 2 Footer */}
        <div className="relative z-10 border-t border-slate-300/80 pt-2 flex justify-between items-center text-[9.5px] text-gray-500 font-sans-body">
          <span className="font-semibold text-gray-700">Traymbhkam Tour and Travels · {data.contactPhone || "+91 82660 16066"}</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0f2744] flex items-center gap-1">
              <span>📍 Opp. Railway Station Gate No. 2, Haridwar</span>
            </span>
            <span className="text-amber-500">•</span>
            <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Govt. Reg: UTTR/HARIDWAR/08-2022/004983 · 010/RTA/23
            </span>
          </div>
          <span className="font-display font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">Page 2 of 6</span>
        </div>
      </div>
    );
  };

  const renderPage3 = (prefix: string) => {
    const totalDays = data.days.length;
    const splitIdx = totalDays <= 8 ? Math.ceil(totalDays / 2) : 5;
    const daysSlice = data.days.slice(0, splitIdx);
    const isDoDham =
      totalDays <= 7 ||
      data.title?.toLowerCase().includes("do dham") ||
      (!data.dhamsSubtitle?.toLowerCase().includes("yamunotri") && !data.routeCovered?.toLowerCase().includes("yamunotri"));

    return (
      <div
        id={`${prefix}-itinerary-page-3`}
        className="w-[794px] min-h-[1122px] h-[1122px] max-h-[1122px] bg-[#fcfbf9] shadow-2xl shrink-0 px-9 py-8 flex flex-col justify-between relative overflow-hidden text-gray-900 border border-amber-300/60 font-sans-body"
        style={{ boxSizing: "border-box" }}
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
        </div>

        {/* Top Decorative Chevron Band */}
        <div className="relative z-10 w-full flex items-center justify-between gap-2 mb-1">
          <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-[#0f2744] rounded-full" />
          <span className="text-[10px] font-display font-black uppercase tracking-[0.25em] text-amber-700">✦ SACRED CHRONICLES · PART 1 ✦</span>
          <div className="h-1 flex-1 bg-gradient-to-r from-[#0f2744] via-amber-400 to-amber-500 rounded-full" />
        </div>

        <div className="relative z-10 space-y-3.5">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-amber-400/40 pb-2">
            <div>
              <h2 className="text-xl font-serif-luxury font-black text-[#0f2744] tracking-tight uppercase flex items-center gap-2">
                <span>✦ Day-Wise Itinerary (Days 1 to {splitIdx})</span>
              </h2>
              <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                {isDoDham
                  ? "Haridwar to Guptkashi / Sitapur & Shri Kedarnath Dham Sacred Darshan"
                  : "Haridwar to Guptkashi Sector · Yamunotri & Gangotri Sacred Darshan"}
              </p>
            </div>
            <span className="text-[10.5px] font-display font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
              Sector 1 · Holy Beginnings
            </span>
          </div>

          {/* Days Timeline Cards */}
          <div className={daysSlice.length <= 3 ? "space-y-4" : "space-y-3"}>
            {daysSlice.map((day) => {
              const cleanDate = day.dateStr ? day.dateStr.replace(/^Day\s*[-–:]*\s*Day\s*\d*\s*[-–:]*/i, "").replace(/^Day\s*\d+\s*[-–:]*\s*/i, "").trim() : "";

              return (
                <div key={day.id} className={`bg-white rounded-xl border border-amber-200/80 shadow-2xs ${daysSlice.length <= 3 ? "p-4 space-y-2" : "p-3 space-y-1.5"} transition`}>
                  {/* Card Header Strip */}
                  <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-[#0a192f] via-[#0f2744] to-[#0a192f] text-white px-3 py-1.5 rounded-lg border-l-4 border-amber-400">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 bg-amber-500 text-white font-display font-black text-[10px] rounded uppercase tracking-wider shrink-0 shadow-2xs">
                        DAY {day.dayNumber < 10 ? `0${day.dayNumber}` : day.dayNumber}
                      </span>
                      {cleanDate && (
                        <span className="text-[11px] font-display font-bold text-amber-300 shrink-0">
                          {cleanDate}
                        </span>
                      )}
                      <span className="text-slate-400 text-xs">|</span>
                      <span className="text-[11.5px] font-bold text-white truncate">
                        {day.route}
                      </span>
                    </div>

                    {day.overnightStay && (
                      <span className="text-[9.5px] font-display font-bold text-amber-200 bg-amber-950/80 border border-amber-400/40 px-2 py-0.5 rounded shrink-0">
                        STAY · {day.overnightStay}
                      </span>
                    )}
                  </div>

                  {/* Day Activities List */}
                  <ul className={`pl-2 ${daysSlice.length <= 3 ? "space-y-1.5 text-[11px]" : "space-y-1 text-[10.5px]"} text-gray-800 pt-0.5`}>
                    {day.activities.map((act, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-600 font-bold text-[10px] shrink-0 mt-0.5">◆</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Continuation Pill */}
          {totalDays > splitIdx && (
            <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-2.5 text-center shadow-2xs">
              <p className="text-[11px] font-display font-bold text-amber-950 flex items-center justify-center gap-2">
                <span>
                  ✦ Days {splitIdx + 1} to {totalDays} (
                  {isDoDham
                    ? "Chopta, Pipalkoti, Shri Badrinath Dham, Mana Village & Return"
                    : "Shri Kedarnath Dham, Chopta, Pipalkoti, Badrinath & Return"}
                  ) continues on Page 4
                </span>
                <span className="text-amber-600 text-xs font-black">➔</span>
              </p>
            </div>
          )}

        </div>

        {/* Page 3 Footer */}
        <div className="relative z-10 border-t border-slate-300/80 pt-2 flex justify-between items-center text-[9.5px] text-gray-500 font-sans-body">
          <span className="font-semibold text-gray-700">Traymbhkam Tour and Travels · {data.contactPhone || "+91 82660 16066"}</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0f2744] flex items-center gap-1">
              <span>📍 Opp. Railway Station Gate No. 2, Haridwar</span>
            </span>
            <span className="text-amber-500">•</span>
            <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Govt. Reg: UTTR/HARIDWAR/08-2022/004983 · 010/RTA/23
            </span>
          </div>
          <span className="font-display font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">Page 3 of 6</span>
        </div>
      </div>
    );
  };

  const renderPage4 = (prefix: string) => {
    const totalDays = data.days.length;
    const splitIdx = totalDays <= 8 ? Math.ceil(totalDays / 2) : 5;
    const endIdx = Math.min(splitIdx + 5, totalDays);
    const daysSlice = data.days.slice(splitIdx, endIdx);
    const extraDays = data.days.slice(endIdx);
    const isDoDham =
      totalDays <= 7 ||
      data.title?.toLowerCase().includes("do dham") ||
      (!data.dhamsSubtitle?.toLowerCase().includes("yamunotri") && !data.routeCovered?.toLowerCase().includes("yamunotri"));

    return (
      <div
        id={`${prefix}-itinerary-page-4`}
        className="w-[794px] min-h-[1122px] h-[1122px] max-h-[1122px] bg-[#fcfbf9] shadow-2xl shrink-0 px-9 py-8 flex flex-col justify-between relative overflow-hidden text-gray-900 border border-amber-300/60 font-sans-body"
        style={{ boxSizing: "border-box" }}
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
        </div>

        {/* Top Decorative Chevron Band */}
        <div className="relative z-10 w-full flex items-center justify-between gap-2 mb-1">
          <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-[#0f2744] rounded-full" />
          <span className="text-[10px] font-display font-black uppercase tracking-[0.25em] text-amber-700">✦ SACRED CHRONICLES · PART 2 ✦</span>
          <div className="h-1 flex-1 bg-gradient-to-r from-[#0f2744] via-amber-400 to-amber-500 rounded-full" />
        </div>

        <div className="relative z-10 space-y-3">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-amber-400/40 pb-2">
            <div>
              <h2 className="text-xl font-serif-luxury font-black text-[#0f2744] tracking-tight uppercase flex items-center gap-2">
                <span>✦ Day-Wise Itinerary (Days {splitIdx + 1} to {totalDays})</span>
              </h2>
              <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                {isDoDham
                  ? "Chopta Alpine Drive, Pipalkoti, Shri Badrinath Dham, Mana Village & Return"
                  : "Shri Kedarnath Dham, Chopta, Pipalkoti, Badrinath Darshan & Haridwar Return"}
              </p>
            </div>
            <span className="text-[10.5px] font-display font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
              Sector 2 · Divine Culmination
            </span>
          </div>

          {/* Days Part 2 Timeline Cards */}
          <div className={daysSlice.length <= 3 ? "space-y-4" : "space-y-2.5"}>
            {daysSlice.map((day) => {
              const cleanDate = day.dateStr ? day.dateStr.replace(/^Day\s*[-–:]*\s*Day\s*\d*\s*[-–:]*/i, "").replace(/^Day\s*\d+\s*[-–:]*\s*/i, "").trim() : "";
              const isLastDay = day.dayNumber === data.days.length;

              return (
                <div key={day.id} className={`bg-white rounded-xl border border-amber-200/80 shadow-2xs ${daysSlice.length <= 3 ? "p-4 space-y-2" : "p-3 space-y-1.5"} transition`}>
                  {/* Card Header Strip */}
                  <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-[#0a192f] via-[#0f2744] to-[#0a192f] text-white px-3 py-1.5 rounded-lg border-l-4 border-amber-400">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 bg-amber-500 text-white font-display font-black text-[10px] rounded uppercase tracking-wider shrink-0 shadow-2xs">
                        DAY {day.dayNumber < 10 ? `0${day.dayNumber}` : day.dayNumber}
                      </span>
                      {cleanDate && (
                        <span className="text-[11px] font-display font-bold text-amber-300 shrink-0">
                          {cleanDate}
                        </span>
                      )}
                      <span className="text-slate-400 text-xs">|</span>
                      <span className="text-[11.5px] font-bold text-white truncate">
                        {day.route}
                      </span>
                    </div>

                    {day.overnightStay && (
                      <span className="text-[9.5px] font-display font-bold text-amber-200 bg-amber-950/80 border border-amber-400/40 px-2 py-0.5 rounded shrink-0">
                        STAY · {day.overnightStay}
                      </span>
                    )}
                  </div>

                  {/* Day Activities List */}
                  <ul className={`pl-2 ${daysSlice.length <= 3 ? "space-y-1.5 text-[10.5px]" : "space-y-1 text-[10px]"} text-gray-800 pt-0.5`}>
                    {day.activities.map((act, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-600 font-bold text-[9.5px] shrink-0 mt-0.5">◆</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>

                  {isLastDay && (
                    <div className="mt-1 bg-emerald-50 border border-emerald-300/80 px-2.5 py-1 rounded-lg flex items-center justify-between text-[10px] font-display font-bold text-emerald-900">
                      <span>✦ TOUR CONCLUDES WITH SACRED MEMORIES &amp; BLESSINGS</span>
                      <span>Haridwar Drop</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Extended Days (if any) */}
          {extraDays.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-2.5 space-y-1">
              <h4 className="text-[11px] font-display font-bold text-amber-950 uppercase tracking-wider">
                Extended Days (Days {endIdx + 1} to {data.days.length})
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-800">
                {extraDays.map((ed) => (
                  <div key={ed.id} className="bg-white p-2 rounded-lg border border-amber-200">
                    <span className="font-bold text-[#0f2744]">Day {ed.dayNumber}: {ed.route}</span>
                    <p className="text-gray-600 mt-0.5">Stay: {ed.overnightStay}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Darshan & Puja Assistance Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-1">
            <h4 className="text-xs font-serif-luxury font-bold text-[#0f2744] flex items-center justify-between">
              <span>🛕 Temple Darshan, Puja &amp; Helicopter Base Support</span>
              <span className="text-[9.5px] font-display font-semibold text-amber-700">Traymbhkam On-Ground Team</span>
            </h4>
            <p className="text-[10px] text-gray-600 leading-relaxed">
              Our experienced mountain drivers coordinate temple reporting times, bio-metric registration verification, Sonprayag shuttle arrangements, and helipad transfers to ensure seamless yatra darshan.
            </p>
          </div>

        </div>

        {/* Page 4 Footer */}
        <div className="relative z-10 border-t border-slate-300/80 pt-2 flex justify-between items-center text-[9.5px] text-gray-500 font-sans-body">
          <span className="font-semibold text-gray-700">Traymbhkam Tour and Travels · {data.contactPhone || "+91 82660 16066"}</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0f2744] flex items-center gap-1">
              <span>📍 Opp. Railway Station Gate No. 2, Haridwar</span>
            </span>
            <span className="text-amber-500">•</span>
            <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Govt. Reg: UTTR/HARIDWAR/08-2022/004983 · 010/RTA/23
            </span>
          </div>
          <span className="font-display font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">Page 4 of 6</span>
        </div>
      </div>
    );
  };

  const renderPage5 = (prefix: string) => {
    const hotelList = (data.hotelPhotos && data.hotelPhotos.length > 0) ? data.hotelPhotos.slice(0, 4) : [
      { id: "h1", url: "/hotels_custom/hotel_stay_2.jpeg", hotelName: "Hotel Yamuna View", location: "Barkot / Jankichatti", roomType: "Deluxe Room" },
      { id: "h2", url: "/hotels_custom/hotel_stay_4.jpeg", hotelName: "Bhagirathi Grand", location: "Uttarkashi / Netala", roomType: "Deluxe Room" },
      { id: "h3", url: "/gallery/kedarnath_alpine_tent.jpg", hotelName: "Kedarnath Alpine Camp", location: "Kedarnath Base", roomType: "Alpine Camp" },
      { id: "h4", url: "/hotels_custom/hotel_stay_3.jpeg", hotelName: "Hotel Badri Kedar", location: "Badrinath / Pipalkoti", roomType: "Super Deluxe Room" }
    ];

    let landmarkPhotos = (data.photos && data.photos.length >= 6) 
      ? data.photos.slice(3, 6) 
      : (data.photos && data.photos.length > 0)
      ? data.photos.slice(0, 3)
      : [
        { id: "l1", url: "/gallery/chardham_10d_img_19.jpg", caption: "Sacred Devprayag Sangam & Confluence" },
        { id: "l2", url: "/gallery/chardham_10d_img_14.jpg", caption: "Chopta Tungnath Himalayan Ridge" },
        { id: "l3", url: "/gallery/chardham_10d_img_18.jpg", caption: "Maa Dhari Devi Sacred Shrine" }
      ];

    // Ensure Sightseeing Highlights displays genuine en-route sightseeing places (Devprayag Sangam, Chopta, Dhari Devi) and NOT Dham temples
    landmarkPhotos = landmarkPhotos.map(p => {
      const lowerCaption = (p.caption || "").toLowerCase();
      const isDhamPhoto = p.url.includes("img_8.jpg") || lowerCaption.includes("gangotri") || lowerCaption.includes("badrinath") || lowerCaption.includes("kedarnath") || lowerCaption.includes("yamunotri");
      if (isDhamPhoto) {
        return {
          id: p.id,
          url: "/gallery/chardham_10d_img_19.jpg",
          caption: "Sacred Devprayag Sangam & Alaknanda Confluence"
        };
      }
      return p;
    });

    const heroTier = data.pricingTiers?.[0];

    return (
      <div
        id={`${prefix}-itinerary-page-5`}
        className="w-[794px] min-h-[1122px] h-[1122px] max-h-[1122px] bg-[#fcfbf9] shadow-2xl shrink-0 px-9 py-8 flex flex-col justify-between relative overflow-hidden text-gray-900 border border-amber-300/60 font-sans-body"
        style={{ boxSizing: "border-box" }}
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
        </div>

        {/* Top Decorative Chevron Band */}
        <div className="relative z-10 w-full flex items-center justify-between gap-2 mb-1">
          <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-[#0f2744] rounded-full" />
          <span className="text-[10px] font-display font-black uppercase tracking-[0.25em] text-amber-700">✦ PACKAGES &amp; ACCOMMODATIONS ✦</span>
          <div className="h-1 flex-1 bg-gradient-to-r from-[#0f2744] via-amber-400 to-amber-500 rounded-full" />
        </div>

        <div className="relative z-10 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-amber-400/40 pb-2">
            <div>
              <h2 className="text-xl font-serif-luxury font-black text-[#0f2744] tracking-tight uppercase flex items-center gap-2">
                <span>✦ Package Options &amp; Confirmed Stays</span>
              </h2>
              <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                Transparent Pricing Tiers, Inspected Accommodations &amp; Sacred Landmarks
              </p>
            </div>
            <span className="text-[10.5px] font-display font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
              Direct Haridwar Rates
            </span>
          </div>

          {/* Hero Package Highlight Card */}
          <div className="bg-gradient-to-r from-[#0a192f] via-[#0f2744] to-[#0a192f] text-white rounded-2xl p-4 border border-amber-400/40 shadow-md flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="px-2 py-0.5 bg-amber-500 text-white font-display font-bold text-[9px] uppercase tracking-wider rounded">
                RECOMMENDED BEST VALUE
              </span>
              <h3 className="text-lg font-serif-luxury font-black text-amber-300">
                {heroTier?.package || "Standard Chardham Package"}
              </h3>
              <p className="text-[10.5px] text-slate-200">
                {heroTier?.hotelCategory || "3-Star Deluxe Clean Stays"} · {heroTier?.meals || "MAP (Breakfast & Dinner Included)"}
              </p>
            </div>

            <div className="text-right shrink-0 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
              <span className="text-[9px] font-display font-bold uppercase tracking-wider text-amber-300 block">
                SPECIAL PRICE
              </span>
              <span className="text-2xl font-serif-luxury font-black text-white">
                {heroTier?.price || "₹28,500"}
              </span>
              <span className="text-[9px] text-slate-300 block">per person on twin sharing</span>
            </div>
          </div>

          {/* Pricing Tiers Table */}
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-xs text-center font-sans-body">
              <thead className="bg-[#0f2744] text-amber-300 font-display font-bold text-[10px] tracking-wider uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Package Category</th>
                  <th className="px-3 py-2">Price / Person</th>
                  <th className="px-3 py-2">Hotel Category</th>
                  <th className="px-3 py-2">Meal Plan</th>
                  <th className="px-3 py-2">Vehicle / Special Feature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[10.5px]">
                {data.pricingTiers.map((tier, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50/30"}>
                    <td className="px-3 py-2 font-display font-bold text-gray-900 text-left">{tier.package}</td>
                    <td className="px-3 py-2 font-serif-luxury font-bold text-[#0f2744] text-xs">{tier.price}</td>
                    <td className="px-3 py-2 text-gray-700">{tier.hotelCategory}</td>
                    <td className="px-3 py-2 text-gray-700">{tier.meals}</td>
                    <td className="px-3 py-2 text-gray-700">{tier.specialFeature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.pricingNote && (
              <p className="px-3 py-1.5 text-[9px] text-gray-500 italic bg-slate-50 border-t border-slate-100">
                * {data.pricingNote}
              </p>
            )}
          </div>

          {/* Confirmed Accommodation Standards Showcase (4 Cards) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-serif-luxury font-bold text-[#0f2744] flex items-center gap-1.5">
                <span>🏨 Confirmed Accommodation Standards &amp; Clean Stays</span>
                <span className="text-[9px] font-display font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Pre-Inspected &amp; Verified
                </span>
              </h3>
              <span className="text-[9.5px] text-amber-700 font-display font-medium">Standard Clean Stays &amp; Swiss Camps</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {hotelList.map((hotel, hIdx) => {
                const isTent = hotel.roomType?.toLowerCase().includes("tent") || hotel.hotelName?.toLowerCase().includes("tent");
                return (
                  <div key={hotel.id || hIdx} className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-white flex flex-col">
                    <div className="h-28 relative overflow-hidden bg-slate-900">
                      <img 
                        src={hotel.url} 
                        alt={hotel.hotelName} 
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-1.5 right-1.5 text-[8px] font-display font-bold px-1.5 py-0.5 rounded shadow-xs ${
                        isTent ? "bg-amber-600 text-white" : "bg-[#0f2744] text-amber-300"
                      }`}>
                        {isTent ? "⛺ Tent Stay" : "🏨 Deluxe Room"}
                      </span>
                    </div>
                    <div className="p-2 bg-amber-50/30 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-display text-[10px] font-bold text-gray-900 truncate">
                          {hotel.hotelName}
                        </p>
                        <p className="text-[8.5px] text-[#0f2744] font-semibold mt-0.5 truncate">
                          📍 {hotel.location}
                        </p>
                      </div>
                      <span className="text-[8px] text-emerald-700 font-bold mt-1">✓ Hot Water &amp; Attached Bath</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sacred Yatra Destinations & Sightseeing Highlights (3 Cards) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-serif-luxury font-bold text-[#0f2744] flex items-center gap-1.5">
                <span>🛕 Sacred Yatra Destinations &amp; Sightseeing Highlights</span>
                <span className="text-[9px] font-display font-semibold px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                  Visual Tour Guide
                </span>
              </h3>
              <span className="text-[9.5px] text-amber-700 font-display font-medium">Devbhoomi Uttarakhand</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {landmarkPhotos.map((photo, pIdx) => (
                <div key={photo.id || pIdx} className="rounded-xl overflow-hidden border border-amber-200/80 shadow-2xs bg-white flex flex-col">
                  <div className="h-24 relative overflow-hidden bg-slate-900">
                    <img 
                      src={photo.url} 
                      alt={photo.caption || "Sacred Landmark"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="py-1 px-2 bg-amber-50/40 text-center">
                    <p className="font-display text-[9.5px] font-bold text-gray-800 truncate">
                      {photo.caption || "Sacred Temple Darshan"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agency Fleet & Mountain Vehicle Lineup Showcase (Fills the Page 5 whitespace) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-serif-luxury font-bold text-[#0f2744] flex items-center gap-1.5">
                <span>🚐 Agency Dedicated Fleet &amp; Mountain Travel Comfort</span>
                <span className="text-[9px] font-display font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Inspected &amp; Hill-Certified Fleet
                </span>
              </h3>
              <span className="text-[9.5px] text-amber-700 font-display font-medium">Traymbhkam Verified Mountain Transport</span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-amber-300/80 shadow-xs bg-white p-2.5 bg-gradient-to-r from-amber-50/50 via-white to-sky-50/50">
              <div className="w-full h-36 relative rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-2xs">
                <img 
                  src="/gallery/traymbhkam_fleet_lineup.png" 
                  alt="Traymbhkam Dedicated Mountain Fleet Lineup" 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[9px] font-display font-bold flex items-center gap-1.5 border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Swift Dzire · Maruti Ertiga · Toyota Innova Crysta · Deluxe Tempo Traveller</span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[9.5px]">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <span className="text-emerald-700 font-bold">✓ 100% Sanitized &amp; Commercial Reg.</span>
                  <span className="text-slate-300">•</span>
                  <span>Certified Hill Chauffeurs</span>
                  <span className="text-slate-300">•</span>
                  <span>Carrier Racks &amp; Music System</span>
                </div>
                <div className="text-right font-display font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                  All Toll Taxes &amp; Green Permits Included
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Page 5 Footer */}
        <div className="relative z-10 border-t border-slate-300/80 pt-2 flex justify-between items-center text-[9.5px] text-gray-500 font-sans-body">
          <span className="font-semibold text-gray-700">Traymbhkam Tour and Travels · {data.contactPhone || "+91 82660 16066"}</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0f2744] flex items-center gap-1">
              <span>📍 Opp. Railway Station Gate No. 2, Haridwar</span>
            </span>
            <span className="text-amber-500">•</span>
            <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Govt. Reg: UTTR/HARIDWAR/08-2022/004983 · 010/RTA/23
            </span>
          </div>
          <span className="font-display font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">Page 5 of 6</span>
        </div>
      </div>
    );
  };

  const renderPage6 = (prefix: string) => {
    return (
      <div
        id={`${prefix}-itinerary-page-6`}
        className="w-[794px] min-h-[1122px] h-[1122px] max-h-[1122px] bg-[#fcfbf9] shadow-2xl shrink-0 px-9 py-8 flex flex-col justify-between relative overflow-hidden text-gray-900 border border-amber-300/60 font-sans-body"
        style={{ boxSizing: "border-box" }}
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
        </div>

        {/* Top Decorative Chevron Band */}
        <div className="relative z-10 w-full flex items-center justify-between gap-2 mb-1">
          <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-[#0f2744] rounded-full" />
          <span className="text-[10px] font-display font-black uppercase tracking-[0.25em] text-amber-700">✦ TERMS OF TRAVEL &amp; CREDENTIALS ✦</span>
          <div className="h-1 flex-1 bg-gradient-to-r from-[#0f2744] via-amber-400 to-amber-500 rounded-full" />
        </div>

        <div className="relative z-10 space-y-3.5">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-amber-400/40 pb-2">
            <div>
              <h2 className="text-xl font-serif-luxury font-black text-[#0f2744] tracking-tight uppercase flex items-center gap-2">
                <span>✦ Terms of Travel &amp; Official Credentials</span>
              </h2>
              <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                Inclusions, Policies, Official Government Registrations &amp; Direct Contact Desk
              </p>
            </div>
            <span className="text-[10.5px] font-display font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full shadow-2xs">
              100% Verified Agency
            </span>
          </div>

          {/* Inclusions & Exclusions 2-Column Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Inclusions */}
            <div className="bg-white rounded-xl border border-emerald-200/80 p-3 shadow-2xs space-y-1.5">
              <h4 className="font-display font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Package Inclusions</span>
              </h4>
              <ul className="space-y-1 text-gray-800 text-[10px]">
                {data.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-emerald-700 font-black shrink-0">✓</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="bg-white rounded-xl border border-rose-200/80 p-3 shadow-2xs space-y-1.5">
              <h4 className="font-display font-bold text-rose-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-rose-100">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Package Exclusions</span>
              </h4>
              <ul className="space-y-1 text-gray-800 text-[10px]">
                {data.exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-rose-600 font-bold shrink-0">✕</span>
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Good to Know & Booking Policy Row */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-amber-50/50 rounded-xl border border-amber-200/80 p-2.5 space-y-1">
              <h4 className="font-display font-bold text-amber-950 text-[11px] uppercase tracking-wider">
                Good To Know &amp; Packing Tips
              </h4>
              <ul className="space-y-0.5 text-gray-700 text-[9.5px]">
                {data.goodToKnow.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-amber-600 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/50 rounded-xl border border-amber-200/80 p-2.5 flex items-center justify-between gap-2.5">
              <div className="space-y-1 flex-1 min-w-0">
                <h4 className="font-display font-bold text-amber-950 text-[11px] uppercase tracking-wider">
                  Booking &amp; Payment Policy
                </h4>
                <ul className="space-y-0.5 text-gray-700 text-[9.5px]">
                  {data.bookingPayment.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-amber-600 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0 bg-white border border-amber-300 rounded-lg p-1 text-center shadow-2xs">
                <img
                  src="/certificates/payment_qr.jpeg"
                  alt="PhonePe Payment QR - Gagan Deep"
                  className="w-16 h-20 object-contain mx-auto rounded"
                />
                <span className="block text-[7.5px] font-display font-bold text-[#0f2744] leading-tight mt-0.5">
                  Scan to Pay
                </span>
              </div>
            </div>
          </div>

          {/* Why Trust Us — 4 Official Credentials Cards */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-serif-luxury font-bold text-[#0f2744] flex items-center gap-2">
                <span>🏆 Why Trust Us — Official Credentials &amp; Registration</span>
                <span className="text-[9px] font-display font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Govt. Registered &amp; 100% Verified
                </span>
              </h3>
              <span className="text-[9px] text-amber-700 font-display font-bold">Traymbhkam Tour and Travels</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2.5">
              {/* 1. Uttarakhand Tourism Certificate */}
              <div className="rounded-xl overflow-hidden border border-amber-200/80 shadow-2xs bg-white flex flex-col">
                <div className="h-24 overflow-hidden bg-gray-50 flex items-center justify-center p-0.5">
                  <img 
                    src={data.trustPhotos?.certificatePhoto || "/certificates/uttrakhand_tourism.jpeg"} 
                    alt="Tourism Reg Certificate" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-1.5 bg-amber-50/40 text-center flex-1 flex flex-col justify-between">
                  <p className="font-display text-[8.5px] font-bold text-gray-800 leading-tight">
                    {data.trustPhotos?.certificateCaption || "Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2022/004983"}
                  </p>
                  <p className="text-[7.5px] text-emerald-700 font-bold mt-0.5">
                    ✓ Govt. Registered Tour Operator
                  </p>
                </div>
              </div>

              {/* 2. Transport Authority Dehradun License */}
              <div className="rounded-xl overflow-hidden border border-amber-200/80 shadow-2xs bg-white flex flex-col">
                <div className="h-24 overflow-hidden bg-gray-50 flex items-center justify-center p-0.5">
                  <img 
                    src={data.trustPhotos?.certificate2Photo || "/certificates/certificate.jpeg"} 
                    alt="Transport Authority License" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-1.5 bg-amber-50/40 text-center flex-1 flex flex-col justify-between">
                  <p className="font-display text-[8.5px] font-bold text-gray-800 leading-tight">
                    {data.trustPhotos?.certificate2Caption || "Dehradun Transport Authority License: 010/RTA/23"}
                  </p>
                  <p className="text-[7.5px] text-amber-800 font-bold mt-0.5">
                    ✓ Dehradun RTA Registered Fleet
                  </p>
                </div>
              </div>

              {/* 3. Owner Photo */}
              <div className="rounded-xl overflow-hidden border border-amber-200/80 shadow-2xs bg-white flex flex-col">
                <div className="h-24 overflow-hidden bg-gray-50 flex items-center justify-center p-0.5">
                  <img 
                    src={data.trustPhotos?.ownerPhoto || "/certificates/owner.jpeg"} 
                    alt={data.trustPhotos?.ownerName || "Mr. Gagandeep"} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-1.5 bg-amber-50/40 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-display text-[9.5px] font-bold text-gray-900 leading-tight">
                      {data.trustPhotos?.ownerName || "Mr. Gagandeep"}
                    </p>
                    <p className="text-[8px] text-[#0f2744] font-semibold">
                      {data.trustPhotos?.ownerTitle || "Founder & Managing Director"}
                    </p>
                  </div>
                  <p className="text-[7.5px] text-gray-500 mt-0.5 font-medium">
                    12+ Yrs Yatra Management
                  </p>
                </div>
              </div>

              {/* 4. Booking Office Photo */}
              <div className="rounded-xl overflow-hidden border border-amber-200/80 shadow-2xs bg-white flex flex-col">
                <div className="h-24 overflow-hidden bg-gray-50 flex items-center justify-center p-0.5">
                  <img 
                    src={data.trustPhotos?.officePhoto || "/certificates/office_front.jpeg"} 
                    alt="Booking Office" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-1.5 bg-amber-50/40 text-center flex-1 flex flex-col justify-between">
                  <p className="font-display text-[8.5px] font-bold text-gray-800 leading-tight">
                    {data.trustPhotos?.officeCaption || "Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar"}
                  </p>
                  <p className="text-[7.5px] text-amber-800 font-bold mt-0.5">
                    📍 Direct Booking &amp; Help Desk
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Dark Royal Navy Contact & Helpline Card */}
          <div className="bg-gradient-to-r from-[#0a192f] via-[#0f2744] to-[#0a192f] text-white rounded-2xl p-4 border border-amber-400/40 shadow-xl flex items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="logo" className="h-16 w-auto object-contain shrink-0 drop-shadow-md bg-white/10 p-1 rounded-xl" />
              <div>
                <p className="text-[9px] uppercase font-display font-bold tracking-widest text-amber-400">
                  OFFICIAL BOOKING &amp; DISPATCH HEADQUARTERS
                </p>
                <h3 className="text-base font-serif-luxury font-black text-white">
                  {data.contactAgency || "Traymbhkam Tour and Travels"}
                </h3>
                <p className="text-[11px] text-slate-200 font-medium">
                  {data.contactPerson || "Mr. Gagandeep (Hunny)"} · Founder &amp; Operations Head
                </p>
                <p className="text-[10px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                  <span>📍 Shop 38, Purusharthi Market, Opp. Railway Station Gate No. 2, Haridwar</span>
                  <span className="text-amber-400">•</span>
                  <span className="text-amber-300 font-semibold">www.traymbhkamtour.com</span>
                </p>
              </div>
            </div>

            {/* Helpline Badge */}
            <div className="shrink-0 bg-white/10 border border-amber-400/50 rounded-xl px-4 py-2.5 text-right">
              <div className="text-[9px] uppercase font-display font-bold text-amber-300 tracking-wider flex items-center justify-end gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>24/7 Operations Helpline</span>
              </div>
              <div className="text-base font-display font-black text-white tracking-wider mt-0.5">
                {data.contactPhone || "+91 82660 16066 · 9389880277"}
              </div>
              <p className="text-[9px] text-amber-200 font-serif-luxury italic mt-0.5">
                {data.motto || "जय श्री केदार · जय बद्री विशाल"}
              </p>
            </div>
          </div>

        </div>

        {/* Page 6 Footer */}
        <div className="relative z-10 border-t border-slate-300/80 pt-2 flex justify-between items-center text-[9.5px] text-gray-500 font-sans-body">
          <span className="font-semibold text-gray-700">Traymbhkam Tour and Travels · {data.contactPhone || "+91 82660 16066"}</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0f2744] flex items-center gap-1">
              <span>📍 Opp. Railway Station Gate No. 2, Haridwar</span>
            </span>
            <span className="text-amber-500">•</span>
            <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Govt. Reg: UTTR/HARIDWAR/08-2022/004983 · 010/RTA/23
            </span>
          </div>
          <span className="font-display font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">Page 6 of 6</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 w-full h-[calc(100vh-5rem)]">
      
      {/* LEFT COLUMN: Controls, AI Generator, and Editing Tabs (Can be collapsed for full preview) */}
      {!isFormCollapsed && (
        <div className="w-full lg:w-[38%] bg-white rounded-2xl shadow-xs border border-gray-100 p-5 overflow-y-auto shrink-0 h-full space-y-5 transition-all duration-300 custom-scrollbar">
          
          {/* Header with Title & Reset Button */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Brochure & Itinerary Studio</h1>
                <p className="text-xs text-gray-500">Chardham Luxury Edition • 100% Editable</p>
              </div>
            </div>
            <button
              onClick={() => {
                setData(CHARDHAM_PRESET);
                if (typeof window !== "undefined") {
                  localStorage.setItem("traymbhkam_current_itinerary", JSON.stringify(CHARDHAM_PRESET));
                }
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-sky-600 bg-gray-50 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition cursor-pointer border border-gray-200"
              title="Reload official 09 Nights / 10 Days Chardham Yatra preset"
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
              onClick={() => {
                setData(CHARDHAM_12P_10D_PRESET);
                if (typeof window !== "undefined") {
                  localStorage.setItem("traymbhkam_current_itinerary", JSON.stringify(CHARDHAM_12P_10D_PRESET));
                }
              }}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="09 Nights / 10 Days Chardham Package for 12 Pax (Tempo Traveller & Standard Clean Stays)"
            >
              10D Chardham (12 Pax Standard)
            </button>
            <button
              type="button"
              onClick={() => {
                setData(CHARDHAM_PRESET);
                if (typeof window !== "undefined") {
                  localStorage.setItem("traymbhkam_current_itinerary", JSON.stringify(CHARDHAM_PRESET));
                }
              }}
              className="px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-300 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Official 09 Nights / 10 Days Chardham Yatra 2026 Plan"
            >
              10D Chardham (9N/10D Official)
            </button>
            <button
              type="button"
              onClick={() => {
                setData(DODHAM_6D_PRESET);
                if (typeof window !== "undefined") {
                  localStorage.setItem("traymbhkam_current_itinerary", JSON.stringify(DODHAM_6D_PRESET));
                }
              }}
              className="px-2.5 py-1 bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-300 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Official 05 Nights / 06 Days Do Dham Yatra (Kedarnath + Badrinath Plan)"
            >
              6D Do Dham (5N/6D Official)
            </button>
            <button
              type="button"
              onClick={() => setShowGalleryModal(true)}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
              title="Select photos from your Dham Photo Library & Custom Uploads"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Pick Gallery Photos ({dhamGallery.filter(p => p.isCustom).length > 0 ? `${dhamGallery.filter(p => p.isCustom).length} Custom` : `${dhamGallery.length}`})</span>
            </button>
          </div>

          {/* Custom Uploads Detected Banner */}
          {dhamGallery.filter(p => p.isCustom).length > 0 && !customPhotosBannerDismissed && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 p-3 rounded-xl flex items-center justify-between gap-2 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">📸</span>
                <div>
                  <p className="font-bold text-amber-900 leading-tight">
                    {dhamGallery.filter(p => p.isCustom).length} Custom Photos in Gallery
                  </p>
                  <p className="text-[10.5px] text-amber-700">
                    Real client/group photos are available in your library.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleApplyAllCustomUploads}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs"
                >
                  Apply All to Brochure
                </button>
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(true)}
                  className="px-2 py-1 bg-white hover:bg-gray-50 border border-amber-300 text-amber-900 rounded-lg font-semibold text-[11px] cursor-pointer"
                >
                  Browse
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPhotosBannerDismissed(true)}
                  className="text-amber-500 hover:text-amber-800 p-1 cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* AI GENERATOR CARD */}
          <div className="bg-gradient-to-br from-sky-50 via-blue-50/50 to-cyan-50/30 p-4 rounded-2xl border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI Itinerary Generator (OpenRouter / Gemini / HF)
              </span>
              <div className="flex items-center gap-1.5">
                {apiKey ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Active
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer bg-white/70 hover:bg-white px-2 py-0.5 rounded-md border border-purple-200"
                >
                  <Key className="w-3 h-3" />
                  {showKeyInput ? "Hide" : apiKey ? "Edit Key" : "Add Key"}
                </button>
              </div>
            </div>

            {/* Key input dropdown if missing or opened */}
            {showKeyInput && (
              <div className="bg-white p-3 rounded-xl border border-purple-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-[10.5px] font-bold text-gray-700">API Key (OpenRouter, Gemini, or Hugging Face)</label>
                  {apiKey && (
                    <span className="text-[9.5px] text-emerald-600 font-bold">✓ Saved on this device</span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    placeholder="sk-or-v1-... (OpenRouter) or AIzaSy... (Gemini) or hf_..."
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveApiKeyPermanently(apiKey)}
                    disabled={!apiKey.trim()}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    Save Key
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">
                  Key will be saved permanently. You will never have to enter it again!
                </p>
                {keySavedNotification && (
                  <p className="text-[10.5px] text-emerald-700 font-bold bg-emerald-50 p-1.5 rounded border border-emerald-200">
                    ✓ API Key saved permanently!
                  </p>
                )}
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder="e.g. a trip to do dham (badrinath and kedarnath for 7D/6N)"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiPrompt(qp);
                      handleAIGenerate(qp);
                    }}
                    disabled={isGenerating}
                    className="text-[10px] bg-white/80 hover:bg-white text-purple-900 px-2 py-1 rounded-md border border-purple-200 transition cursor-pointer hover:border-purple-400 disabled:opacity-50"
                  >
                    {qp.length > 32 ? qp.slice(0, 32) + "..." : qp}
                  </button>
                ))}
              </div>

              {/* Generate Action Button */}
              <button
                onClick={() => handleAIGenerate()}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Full Plan with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Itinerary with AI
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[10.5px] text-purple-800 bg-purple-100/60 px-2.5 py-1.5 rounded-lg">
                <span className="flex items-center gap-1.5 font-medium">
                  <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                  AI automatically auto-picks Dham photos from your Gallery
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("photos")}
                  className="font-bold underline hover:text-purple-950 cursor-pointer"
                >
                  Gallery ({dhamGallery.length})
                </button>
              </div>

              {aiError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex items-center gap-1 border-b border-gray-100 overflow-x-auto pb-1 text-xs font-semibold text-gray-500">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "overview" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              1. Trip Info
            </button>
            <button
              onClick={() => setActiveTab("days")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "days" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              2. Days ({data.days.length})
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "pricing" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              3. Pricing ({data.pricingTiers.length})
            </button>
            <button
              onClick={() => setActiveTab("photos")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "photos" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              4. Photos & Dham Gallery ({(data.photos || []).length})
            </button>
            <button
              onClick={() => setActiveTab("inclusions")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "inclusions" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              5. Inclusions
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-3 py-2 rounded-lg transition cursor-pointer shrink-0 ${activeTab === "contact" ? "bg-sky-50 text-sky-600 font-bold" : "hover:text-gray-900"}`}
            >
              6. Policies
            </button>
          </div>

          {/* TAB 1: OVERVIEW & GLANCE */}
          {activeTab === "overview" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Main Title</label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={e => setData({ ...data, title: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">State / Destination</label>
                  <input
                    type="text"
                    value={data.subTitle}
                    onChange={e => setData({ ...data, subTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Duration Tagline</label>
                  <input
                    type="text"
                    value={data.spiritualHeadline}
                    onChange={e => setData({ ...data, spiritualHeadline: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Highlights</label>
                  <input
                    type="text"
                    value={data.dhamsSubtitle}
                    onChange={e => setData({ ...data, dhamsSubtitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 space-y-3">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Client & Journey Details</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-600 mb-0.5">Prepared For</label>
                    <input
                      type="text"
                      value={data.preparedFor}
                      onChange={e => setData({ ...data, preparedFor: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block font-medium text-gray-600">Travel Dates</label>
                      <span className="text-[9.5px] text-[#0369a1] font-semibold">📅 Range</span>
                    </div>
                    <input
                      type="text"
                      value={data.travelDates}
                      onChange={e => setData({ ...data, travelDates: e.target.value })}
                      placeholder="e.g. 14 May 2026 to 23 May 2026"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs"
                    />
                    <div className="flex items-center gap-1 mt-1 bg-sky-50/70 p-1 rounded-md border border-sky-100">
                      <Calendar className="w-3 h-3 text-[#0369a1] shrink-0 ml-0.5" />
                      <span className="text-[9px] font-bold text-[#0369a1]">From:</span>
                      <input
                        type="date"
                        className="text-[10px] bg-white border border-sky-200 rounded px-1 py-0.5 font-mono cursor-pointer"
                        title="Tour Start Date"
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const d = new Date(e.target.value);
                          const startStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                          const cur = data.travelDates || "";
                          const parts = cur.split(/to|TO|-/);
                          const endStr = parts[1] ? parts[1].trim() : "";
                          setData({ ...data, travelDates: endStr ? `${startStr} to ${endStr}` : startStr });
                        }}
                      />
                      <span className="text-[9px] font-bold text-[#0369a1]">To:</span>
                      <input
                        type="date"
                        className="text-[10px] bg-white border border-sky-200 rounded px-1 py-0.5 font-mono cursor-pointer"
                        title="Tour End Date"
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const d = new Date(e.target.value);
                          const endStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                          const cur = data.travelDates || "";
                          const parts = cur.split(/to|TO|-/);
                          const startStr = parts[0] ? parts[0].trim() : "";
                          setData({ ...data, travelDates: startStr ? `${startStr} to ${endStr}` : endStr });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-600 mb-0.5">Duration</label>
                    <input
                      type="text"
                      value={data.duration}
                      onChange={e => setData({ ...data, duration: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-0.5">Starting Point</label>
                    <input
                      type="text"
                      value={data.startingPoint}
                      onChange={e => setData({ ...data, startingPoint: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-600 mb-0.5">Full Route Covered</label>
                  <textarea
                    rows={2}
                    value={data.routeCovered}
                    onChange={e => setData({ ...data, routeCovered: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Your Journey At A Glance Summary</label>
                <textarea
                  rows={3}
                  value={data.overviewSummary}
                  onChange={e => setData({ ...data, overviewSummary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div className="bg-sky-50/40 p-3 rounded-xl border border-sky-200/80 space-y-2">
                <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wider">Quick Info (Glance Table)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500">Dhams Covered</label>
                    <input
                      type="text"
                      value={data.glanceDhams}
                      onChange={e => setData({ ...data, glanceDhams: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-sky-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">Sector / Mode</label>
                    <input
                      type="text"
                      value={data.glanceSector}
                      onChange={e => setData({ ...data, glanceSector: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-sky-200 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAYS */}
          {activeTab === "days" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-700 block">Day-Wise Detailed Plans ({data.days.length} Days)</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Calendar size={11} className="text-sky-700" />
                    <span className="text-[10px] text-slate-500 font-medium">Auto-date all days from:</span>
                    <input
                      type="date"
                      className="text-[10px] border border-sky-300 rounded px-1 py-0.5 bg-white cursor-pointer font-mono"
                      title="Auto-fill date for each day sequentially"
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const startDate = new Date(e.target.value);
                        const updatedDays = data.days.map((day, i) => {
                          const cur = new Date(startDate);
                          cur.setDate(startDate.getDate() + i);
                          const dateFmt = cur.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                          const title = day.dateStr?.includes("-") ? day.dateStr.split("-").slice(1).join("-").trim() : day.dateStr;
                          return {
                            ...day,
                            dateStr: `${dateFmt} - ${title || `Day ${day.dayNumber}`}`
                          };
                        });
                        setData({ ...data, days: updatedDays });
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={addDay}
                  className="flex items-center gap-1 px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Day
                </button>
              </div>

              <div className="space-y-3">
                {data.days.map((day, dIdx) => (
                  <div key={day.id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 bg-[#002f6c] text-white px-2 py-0.5 rounded text-[11px]">
                        DAY {day.dayNumber}
                      </span>
                      <button
                        onClick={() => removeDay(day.id)}
                        className="text-gray-400 hover:text-rose-600 transition cursor-pointer"
                        title="Remove Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[10px] font-medium text-gray-500">Date & Day String</label>
                          <span className="text-[9px] text-sky-700 font-semibold">📅 Pick</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={day.dateStr}
                            onChange={e => updateDayField(day.id, "dateStr", e.target.value)}
                            placeholder="e.g. 14 May 2026 - Arrival"
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                          />
                          <input
                            type="date"
                            className="w-6 h-6 p-0 border border-gray-200 rounded bg-white cursor-pointer shrink-0 text-xs"
                            title="Pick Date for this day"
                            onChange={(e) => {
                              if (!e.target.value) return;
                              const d = new Date(e.target.value);
                              const formatted = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                              const currentTitle = day.dateStr?.includes("-") ? day.dateStr.split("-").slice(1).join("-").trim() : (day.dateStr || `Day ${day.dayNumber}`);
                              updateDayField(day.id, "dateStr", `${formatted} - ${currentTitle}`);
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Route (A → B → C)</label>
                        <input
                          type="text"
                          value={day.route}
                          onChange={e => updateDayField(day.id, "route", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-medium text-gray-500">Activities & Itinerary Details</label>
                        <button
                          onClick={() => addActivityBullet(day.id)}
                          className="text-[10px] text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                        >
                          + Add Bullet
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {day.activities.map((act, actIdx) => (
                          <div key={actIdx} className="flex items-center gap-1.5">
                            <span className="text-gray-400">–</span>
                            <input
                              type="text"
                              value={act}
                              onChange={e => updateActivityBullet(day.id, actIdx, e.target.value)}
                              className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                            />
                            <button
                              onClick={() => removeActivityBullet(day.id, actIdx)}
                              className="text-gray-300 hover:text-rose-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[10px] font-medium text-amber-800">Overnight Stay Location</label>
                        <button
                          type="button"
                          onClick={() => {
                            const current = day.overnightStay || "";
                            if (!current.includes("Tent Only")) {
                              updateDayField(day.id, "overnightStay", current ? `${current.replace(/\(Tent.*?\)/i, "").trim()} (Tent Only)` : "Kedarnath (Tent Only)");
                            }
                          }}
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold transition cursor-pointer ${
                            day.overnightStay?.includes("Tent Only")
                              ? "bg-amber-600 text-white"
                              : "text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300"
                          }`}
                          title="Set Tent Only"
                        >
                          ⛺ Tent Only
                        </button>
                      </div>
                      <input
                        type="text"
                        value={day.overnightStay}
                        onChange={e => updateDayField(day.id, "overnightStay", e.target.value)}
                        className="w-full px-2 py-1 bg-amber-50/60 border border-amber-200 rounded text-xs font-semibold text-amber-900"
                      />
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => updateDayField(day.id, "overnightStay", "Kedarnath (Tent Only - Without Food)")}
                          className="text-[9px] px-1.5 py-0.5 rounded border border-amber-200 bg-white hover:bg-amber-50 text-amber-800 transition cursor-pointer font-medium"
                        >
                          Kedarnath (Tent Only)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const current = day.overnightStay || "";
                            updateDayField(day.id, "overnightStay", current.replace(/\(Tent.*?\)/i, "").replace(/Tent Only/i, "").trim() || "Hotel Stay");
                          }}
                          className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
                        >
                          Hotel Stay
                        </button>
                        <button
                          type="button"
                          onClick={() => updateDayField(day.id, "overnightStay", "Tour Concludes (Happy Memories)")}
                          className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
                        >
                          Tour Concludes
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRICING TIERS */}
          {activeTab === "pricing" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Package Options & Multi-Tier Pricing</span>
                <button
                  onClick={addTier}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Tier
                </button>
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Pricing Section Subtitle</label>
                <textarea
                  rows={2}
                  value={data.pricingSubtitle}
                  onChange={e => setData({ ...data, pricingSubtitle: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-3">
                {data.pricingTiers.map((tier, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{tier.package}</span>
                      <button
                        onClick={() => removeTier(idx)}
                        className="text-gray-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500">Tier Name</label>
                        <input
                          type="text"
                          value={tier.package}
                          onChange={e => updateTier(idx, "package", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500">Price / Person</label>
                        <input
                          type="text"
                          value={tier.price}
                          onChange={e => updateTier(idx, "price", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-emerald-600"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500">Hotel Category</label>
                        <input
                          type="text"
                          value={tier.hotelCategory}
                          onChange={e => updateTier(idx, "hotelCategory", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500">Meals</label>
                        <input
                          type="text"
                          value={tier.meals}
                          onChange={e => updateTier(idx, "meals", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500">Special / Heli</label>
                        <input
                          type="text"
                          value={tier.specialFeature}
                          onChange={e => updateTier(idx, "specialFeature", e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Pricing Footnote (Terms & Notes)</label>
                <textarea
                  rows={2}
                  value={data.pricingNote}
                  onChange={e => setData({ ...data, pricingNote: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs italic"
                />
              </div>
            </div>
          )}

          {/* TAB 4: PICTURES & VISUAL SHOWCASE */}
          {activeTab === "photos" && (
            <div className="space-y-4 text-xs">
              
              {/* Display Options & Toggles */}
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
                <span className="font-bold text-sky-900 block text-[11px] uppercase tracking-wider">
                  Brochure Display Toggles
                </span>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.showPhotosPage1 !== false}
                      onChange={e => setData({ ...data, showPhotosPage1: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-gray-700 font-medium">Show Photo Strip on Page 1 (Cover / Journey Glance)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.showPhotosPage3 !== false}
                      onChange={e => setData({ ...data, showPhotosPage3: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-gray-700 font-medium">Show Photo Gallery on Page 3 (Destinations Highlights)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.showHotelPhotos !== false}
                      onChange={e => setData({ ...data, showHotelPhotos: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-gray-700 font-medium">Show Confirmed Accommodations & Hotel Stays on Page 3</span>
                  </label>
                </div>
              </div>

              {/* BLOCK: CONFIRMED HOTEL & ACCOMMODATION PHOTOS */}
              <div className="bg-gradient-to-br from-emerald-50/50 via-sky-50/30 to-white border-2 border-emerald-300/80 rounded-2xl p-4 space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                      🏨
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        Confirmed Accommodations & Hotel Photos
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {(data.hotelPhotos || []).length} Stays
                        </span>
                      </h3>
                      <p className="text-[10.5px] text-gray-500">
                        Showcase verified hotel & camp stays to assure clients of accommodation quality.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <label className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Hotel Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadNewStayPhoto}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={loadCuratedHotelPhotos}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
                      title="Load curated standard room & Kedarnath alpine camp photos"
                    >
                      ★ Curated Preset
                    </button>
                    <button
                      type="button"
                      onClick={addHotelPhoto}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Stay
                    </button>
                  </div>
                </div>

                {/* Hotel List */}
                <div className="space-y-3">
                  {(data.hotelPhotos || []).map((hp, hIdx) => {
                    const isTent = hp.roomType?.toLowerCase().includes("tent");
                    return (
                      <div key={hp.id || hIdx} className="p-3 bg-white border border-emerald-200/80 rounded-xl space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-gray-900">
                              Stay {hIdx + 1}: {hp.hotelName || "Stay"}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${isTent ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-sky-100 text-sky-800'}`}>
                              {isTent ? '⛺ Tent Only' : '🏨 Standard Stay'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeHotelPhoto(hp.id)}
                            className="text-gray-400 hover:text-rose-600 transition cursor-pointer p-1"
                            title="Remove stay photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Stay / Category Title (Internal)</label>
                            <input
                              type="text"
                              value={hp.hotelName}
                              onChange={e => updateHotelPhoto(hp.id, "hotelName", e.target.value)}
                              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold"
                              placeholder="e.g. Standard Clean Stay"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Location / Sector</label>
                            <input
                              type="text"
                              value={hp.location}
                              onChange={e => updateHotelPhoto(hp.id, "location", e.target.value)}
                              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Room Type / Category</label>
                            <input
                              type="text"
                              value={hp.roomType || ""}
                              onChange={e => updateHotelPhoto(hp.id, "roomType", e.target.value)}
                              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                              placeholder="e.g. Standard Room / Tent Only"
                            />
                            <div className="flex gap-1 mt-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => updateHotelPhoto(hp.id, "roomType", "Standard Room")}
                                className="text-[9px] px-2 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold rounded"
                              >
                                Standard
                              </button>
                              <button
                                type="button"
                                onClick={() => updateHotelPhoto(hp.id, "roomType", "Tent Only (Without Food)")}
                                className="text-[9px] px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded"
                              >
                                Tent Only
                              </button>
                              <button
                                type="button"
                                onClick={() => updateHotelPhoto(hp.id, "roomType", "Family Triple / Quad")}
                                className="text-[9px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                              >
                                Family
                              </button>
                              <button
                                type="button"
                                onClick={() => updateHotelPhoto(hp.id, "roomType", "Deluxe Double Room")}
                                className="text-[9px] px-1.5 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded"
                                title="Optional for guests requesting deluxe"
                              >
                                Deluxe (Opt)
                              </button>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-medium text-gray-500">Image URL or Upload</label>
                              <label className="text-[9.5px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                                📤 Upload Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => handleHotelFileUpload(hp.id, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={hp.url}
                              onChange={e => updateHotelPhoto(hp.id, "url", e.target.value)}
                              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-mono"
                              placeholder="/gallery/... or upload above"
                            />
                            {hp.url && (
                              <div className="mt-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-10 w-16 rounded overflow-hidden border border-gray-200 shrink-0 bg-slate-50 flex items-center justify-center">
                                    <img 
                                      src={hp.url === "/gallery/chardham_10d_img_32.jpg" ? "/gallery/kedarnath_alpine_tent.jpg" : hp.url} 
                                      alt={hp.hotelName} 
                                      className={`w-full h-full ${hp.fit === 'contain' ? 'object-contain' : 'object-cover'}`} 
                                    />
                                  </div>
                                  <span className="text-[9px] text-gray-400 font-mono truncate max-w-[180px]">
                                    {hp.url === "/gallery/chardham_10d_img_32.jpg" ? "/gallery/kedarnath_alpine_tent.jpg" : hp.url}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                  <span className="text-[9px] text-gray-500 font-medium">Photo Fit:</span>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateHotelPhoto(hp.id, "fit", "cover")}
                                      className={`text-[9px] px-2 py-0.5 rounded font-semibold ${hp.fit !== 'contain' ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                                      title="Fill container (landscape)"
                                    >
                                      Cover (Fill)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateHotelPhoto(hp.id, "fit", "contain")}
                                      className={`text-[9px] px-2 py-0.5 rounded font-semibold ${hp.fit === 'contain' ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                                      title="Show full photo without cutting portrait/vertical shots"
                                    >
                                      Contain (No Cut)
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Quick Select from Uploaded Hotel Stays */}
                            <div className="mt-1">
                              <span className="text-[9px] text-gray-500 font-semibold block mb-0.5">Quick pick stay photo (11 hotel pics & tent):</span>
                              <div className="flex gap-1 overflow-x-auto py-0.5 custom-scrollbar">
                                {[
                                  { url: "/hotels_custom/hotel_stay_2.jpeg", label: "Quad Room" },
                                  { url: "/hotels_custom/hotel_stay_4.jpeg", label: "Double Bed" },
                                  { url: "/hotels_custom/hotel_stay_3.jpeg", label: "Mountain Stay" },
                                  { url: "/hotels_custom/hotel_stay_6.jpeg", label: "Twin Room" },
                                  { url: "/hotels_custom/hotel_stay_7.jpeg", label: "Deluxe Bed" },
                                  { url: "/hotels_custom/hotel_stay_1.jpeg", label: "Bath/Geyser" },
                                  { url: "/hotels_custom/hotel_stay_5.jpeg", label: "Luxury Triple" },
                                  { url: "/hotels_custom/hotel_stay_8.jpeg", label: "Cozy Double" },
                                  { url: "/hotels_custom/hotel_stay_9.jpeg", label: "Valley View" },
                                  { url: "/hotels_custom/hotel_stay_10.jpeg", label: "Family Suite" },
                                  { url: "/hotels_custom/hotel_stay_11.jpeg", label: "Camp/Resort" },
                                  { url: "/gallery/kedarnath_alpine_tent.jpg", label: "⛺ Alpine Tent" }
                                ].map((pic, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => updateHotelPhoto(hp.id, "url", pic.url)}
                                    className={`text-[8.5px] px-2 py-0.5 rounded shrink-0 border transition ${hp.url === pic.url ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                  >
                                    {pic.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Feature Caption / Amenities</label>
                          <input
                            type="text"
                            value={hp.caption || ""}
                            onChange={e => updateHotelPhoto(hp.id, "caption", e.target.value)}
                            className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                            placeholder="e.g. Attached bath, hot geyser & hygienic pure veg kitchen"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trust & Credentials Editor — 4 Cards: Tourism Certificate, Transport License, Owner, Office */}
              <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-white border-2 border-emerald-300 rounded-2xl p-4 space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-xs">
                        Official Certificates & Credentials (Page 4)
                      </h3>
                      <p className="text-[10px] text-emerald-800">
                        Edit, swap or upload official registration certificates, owner and office photos.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setData(prev => ({
                        ...prev,
                        trustPhotos: { ...DEFAULT_TRUST_PHOTOS },
                        showTrustSection: true
                      }))}
                      className="text-[9.5px] px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition shadow-2xs cursor-pointer"
                      title="Reset all 4 credentials to verified government records"
                    >
                      ★ Reset to Official Presets
                    </button>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.showTrustSection !== false}
                        onChange={e => setData({ ...data, showTrustSection: e.target.checked })}
                        className="rounded"
                      />
                      Show on Page 4
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  
                  {/* Card 1: Uttarakhand Tourism Certificate */}
                  <div className="bg-white p-2.5 rounded-xl border border-sky-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10.5px] font-bold text-sky-900">
                        📜 1. Tourism Board Certificate
                      </label>
                      <label className="text-[9px] text-sky-700 hover:text-sky-900 font-bold flex items-center gap-0.5 cursor-pointer bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
                        📤 Upload Custom
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setData(prev => ({
                                  ...prev,
                                  trustPhotos: { ...prev.trustPhotos, certificatePhoto: reader.result as string }
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            certificatePhoto: "/certificates/uttrakhand_tourism.jpeg",
                            certificateCaption: "Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2022/004983"
                          }
                        }))}
                        className={`text-[9px] px-2 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.certificatePhoto === "/certificates/uttrakhand_tourism.jpeg"
                            ? "bg-sky-600 text-white border-sky-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Uttarakhand Tourism Reg.
                      </button>
                    </div>

                    <div className="h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-1">
                      <img 
                        src={data.trustPhotos?.certificatePhoto || "/certificates/uttrakhand_tourism.jpeg"} 
                        alt="Tourism Certificate" 
                        className="w-full h-full object-contain" 
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-gray-500 font-medium mb-0.5">Certificate Caption / Reg Number</label>
                      <input
                        type="text"
                        value={data.trustPhotos?.certificateCaption || ""}
                        onChange={e => setData(prev => ({ ...prev, trustPhotos: { ...prev.trustPhotos, certificateCaption: e.target.value } }))}
                        className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                        placeholder="Uttarakhand Tourism Reg: UTTR/HARIDWAR/08-2022/004983"
                      />
                    </div>
                  </div>

                  {/* Card 2: Transport Authority License */}
                  <div className="bg-white p-2.5 rounded-xl border border-purple-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10.5px] font-bold text-purple-900">
                        🚗 2. Transport Authority License
                      </label>
                      <label className="text-[9px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-0.5 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                        📤 Upload Custom
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setData(prev => ({
                                  ...prev,
                                  trustPhotos: { ...prev.trustPhotos, certificate2Photo: reader.result as string }
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            certificate2Photo: "/certificates/certificate.jpeg",
                            certificate2Caption: "Dehradun Transport Authority License: 010/RTA/23"
                          }
                        }))}
                        className={`text-[9px] px-2 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.certificate2Photo === "/certificates/certificate.jpeg"
                            ? "bg-purple-600 text-white border-purple-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Dehradun RTA Reg.
                      </button>
                    </div>

                    <div className="h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-1">
                      <img 
                        src={data.trustPhotos?.certificate2Photo || "/certificates/certificate.jpeg"} 
                        alt="RTA License" 
                        className="w-full h-full object-contain" 
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-gray-500 font-medium mb-0.5">License Caption / RTA Reg Number</label>
                      <input
                        type="text"
                        value={data.trustPhotos?.certificate2Caption || ""}
                        onChange={e => setData(prev => ({ ...prev, trustPhotos: { ...prev.trustPhotos, certificate2Caption: e.target.value } }))}
                        className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                        placeholder="Dehradun Transport Authority License: 010/RTA/23"
                      />
                    </div>
                  </div>

                  {/* Card 3: Owner Photo */}
                  <div className="bg-white p-2.5 rounded-xl border border-sky-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10.5px] font-bold text-gray-800">
                        👤 3. Owner Photo (Mr. Gagandeep)
                      </label>
                      <label className="text-[9px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        📤 Upload Custom
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setData(prev => ({
                                  ...prev,
                                  trustPhotos: { ...prev.trustPhotos, ownerPhoto: reader.result as string }
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            ownerPhoto: "/certificates/owner.jpeg",
                            ownerName: "Mr. Gagandeep",
                            ownerTitle: "Founder & Managing Director"
                          }
                        }))}
                        className={`text-[9px] px-2 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.ownerPhoto === "/certificates/owner.jpeg"
                            ? "bg-sky-600 text-white border-sky-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Office Desk Picture
                      </button>
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            ownerPhoto: "/gallery/chardham_10d_img_28.jpg",
                            ownerName: "Mr. Gagandeep",
                            ownerTitle: "Founder & Managing Director"
                          }
                        }))}
                        className={`text-[9px] px-2 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.ownerPhoto === "/gallery/chardham_10d_img_28.jpg"
                            ? "bg-sky-600 text-white border-sky-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Mountain View Picture
                      </button>
                    </div>

                    <div className="h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-1">
                      <img 
                        src={data.trustPhotos?.ownerPhoto || "/certificates/owner.jpeg"} 
                        alt="Owner" 
                        className="w-full h-full object-contain" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-gray-500 font-medium mb-0.5">Name</label>
                        <input
                          type="text"
                          value={data.trustPhotos?.ownerName || ""}
                          onChange={e => setData(prev => ({ ...prev, trustPhotos: { ...prev.trustPhotos, ownerName: e.target.value } }))}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold"
                          placeholder="Mr. Gagandeep"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-500 font-medium mb-0.5">Designation</label>
                        <input
                          type="text"
                          value={data.trustPhotos?.ownerTitle || ""}
                          onChange={e => setData(prev => ({ ...prev, trustPhotos: { ...prev.trustPhotos, ownerTitle: e.target.value } }))}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                          placeholder="Founder & Managing Director"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Office Photo */}
                  <div className="bg-white p-2.5 rounded-xl border border-sky-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10.5px] font-bold text-gray-800">
                        🏢 4. Haridwar Booking Office
                      </label>
                      <label className="text-[9px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        📤 Upload Custom
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setData(prev => ({
                                  ...prev,
                                  trustPhotos: { ...prev.trustPhotos, officePhoto: reader.result as string }
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            officePhoto: "/certificates/office_front.jpeg",
                            officeCaption: "Shop 38, Pursharthi Market, Haridwar"
                          }
                        }))}
                        className={`text-[9px] px-2 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.officePhoto === "/certificates/office_front.jpeg"
                            ? "bg-sky-600 text-white border-sky-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Front Signboard
                      </button>
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            officePhoto: "/gallery/chardham_10d_img_27.jpg",
                            officeCaption: "Booking Desk — Haridwar"
                          }
                        }))}
                        className={`text-[9px] px-2 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.officePhoto === "/gallery/chardham_10d_img_27.jpg"
                            ? "bg-sky-600 text-white border-sky-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Inner Desk
                      </button>
                    </div>

                    <div className="h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-1">
                      <img 
                        src={data.trustPhotos?.officePhoto || "/certificates/office_front.jpeg"} 
                        alt="Office" 
                        className="w-full h-full object-contain" 
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-gray-500 font-medium mb-0.5">Office Address / Caption</label>
                      <input
                        type="text"
                        value={data.trustPhotos?.officeCaption || ""}
                        onChange={e => setData(prev => ({ ...prev, trustPhotos: { ...prev.trustPhotos, officeCaption: e.target.value } }))}
                        className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                        placeholder="Shop 38, Pursharthi Market, Haridwar"
                      />
                    </div>
                  </div>

                  {/* Card 5: Dedicated Tourist Vehicle Fleet */}
                  <div className="bg-white p-2.5 rounded-xl border border-amber-300 md:col-span-2 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10.5px] font-bold text-amber-950 flex items-center gap-1.5">
                        <span>🚐 5. Dedicated Tourist Vehicle Fleet (Tempo &amp; Cabs Lineup)</span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">Featured on Itinerary Brochure</span>
                      </label>
                      <label className="text-[9px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-0.5 cursor-pointer bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        📤 Upload Custom Fleet Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setData(prev => ({
                                  ...prev,
                                  trustPhotos: { ...prev.trustPhotos, vehiclePhoto: reader.result as string }
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setData(prev => ({
                          ...prev,
                          trustPhotos: {
                            ...prev.trustPhotos,
                            vehiclePhoto: "/gallery/traymbhkam_fleet_lineup.png",
                            vehicleCaption: "Traymbhkam Dedicated Mountain Fleet (Tempo Traveller & Hill Cabs)"
                          }
                        }))}
                        className={`text-[9px] px-2.5 py-1 rounded font-semibold border flex-1 text-center transition ${
                          data.trustPhotos?.vehiclePhoto === "/gallery/traymbhkam_fleet_lineup.png"
                            ? "bg-amber-600 text-white border-amber-700 font-bold"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Official White Lineup Photo (Studio Fleet)
                      </button>
                    </div>

                    <div className="h-28 rounded-lg overflow-hidden border border-amber-200 bg-slate-900 flex items-center justify-center p-1">
                      <img 
                        src={data.trustPhotos?.vehiclePhoto || "/gallery/traymbhkam_fleet_lineup.png"} 
                        alt="Fleet Lineup" 
                        className="w-full h-full object-contain" 
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-gray-500 font-medium mb-0.5">Vehicle Fleet Caption / Description</label>
                      <input
                        type="text"
                        value={data.trustPhotos?.vehicleCaption || ""}
                        onChange={e => setData(prev => ({ ...prev, trustPhotos: { ...prev.trustPhotos, vehicleCaption: e.target.value } }))}
                        className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                        placeholder="Traymbhkam Dedicated Mountain Fleet (Tempo Traveller & Hill Cabs)"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* MY UPLOADED CUSTOM PHOTOS HIGHLIGHT */}
              {dhamGallery.filter(p => p.isCustom).length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 via-orange-50/70 to-amber-100/40 border-2 border-amber-300 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📸</span>
                      <div>
                        <h3 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                          My Uploaded Gallery Photos
                          <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {dhamGallery.filter(p => p.isCustom).length} Photos
                          </span>
                        </h3>
                        <p className="text-[10px] text-amber-800">
                          Your actual client group & tour photos from the Gallery.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyAllCustomUploads}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
                    >
                      ★ Use All My Uploaded Photos
                    </button>
                  </div>

                  {/* Grid of Custom Uploads */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {dhamGallery.filter(p => p.isCustom).map(photo => {
                      const isSelected = (data.photos || []).some(p => p.url === photo.url);
                      return (
                        <div
                          key={photo.id}
                          className={`p-1.5 bg-white rounded-xl border transition flex flex-col justify-between gap-1.5 ${
                            isSelected ? "border-amber-500 ring-2 ring-amber-300 shadow-xs" : "border-amber-200 hover:border-amber-400"
                          }`}
                        >
                          <div className="aspect-[4/3] rounded-lg overflow-hidden relative bg-gray-100">
                            <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                            {isSelected && (
                              <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-amber-600 text-white text-[9px] font-bold rounded shadow-xs">
                                ✓ In Brochure
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] font-semibold text-gray-800 line-clamp-1">{photo.caption}</p>
                          <button
                            type="button"
                            onClick={() => handleTogglePhotoInBrochure(photo)}
                            className={`w-full py-1 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                              isSelected ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-amber-500 text-white hover:bg-amber-600"
                            }`}
                          >
                            {isSelected ? "Remove" : "+ Add to Brochure"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Browse & Pick from Gallery Button */}
              <button
                type="button"
                onClick={() => setShowGalleryModal(true)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-[#0369a1] hover:from-sky-700 hover:to-[#025684] text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>📷 Open Visual Gallery Picker ({dhamGallery.length} Photos)</span>
              </button>

              {/* BLOCK: DHAM PHOTO GALLERY & AI ASSET POOL */}
              <div className="bg-gradient-to-br from-amber-50/50 via-sky-50/40 to-white border-2 border-sky-200 rounded-2xl p-4 space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-sky-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                      <Wand2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        Dham Photo Gallery & AI Asset Pool
                        <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                          {dhamGallery.length} Photos
                        </span>
                      </h3>
                      <p className="text-[10.5px] text-gray-500">
                        Organize holy Dham pictures. AI automatically matches and picks pictures for your itinerary.
                      </p>
                    </div>
                  </div>

                  {/* AI Auto-Match Button */}
                  <button
                    type="button"
                    onClick={handleAutoMatchPhotos}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer shrink-0"
                    title="Scan current itinerary & auto-pick matching Dham photos"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>⚡ AI Auto-Match Photos</span>
                  </button>
                </div>

                {/* Notification toast */}
                {aiPhotoNotification && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{aiPhotoNotification}</span>
                  </div>
                )}

                {/* Direct Link to Dedicated Photo Library Tab */}
                <div className="bg-white p-3.5 rounded-xl border border-sky-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-[#002f6c] text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" /> Dedicated Photo Library & Media Tab
                    </span>
                    <p className="text-[10.5px] text-gray-500 mt-0.5">
                      Upload and manage all your Dham, hotel & cab photos in the dedicated Photo Library tab.
                    </p>
                  </div>
                  <Link
                    href="/gallery"
                    target="_blank"
                    className="px-3.5 py-2 bg-[#002f6c] hover:bg-[#0a3871] text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Open Photo Library ↗
                  </Link>
                </div>

                {/* Category Filter Pills */}
                <div className="space-y-1.5">
                  <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wider block">
                    Filter Gallery by Holy Dham
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DHAM_CATEGORIES.map(cat => {
                      const count = cat.key === "all"
                        ? dhamGallery.length
                        : cat.key === "custom"
                        ? dhamGallery.filter(p => p.isCustom).length
                        : dhamGallery.filter(p => p.dham === cat.key).length;
                      const isSelected = selectedDhamCategory === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setSelectedDhamCategory(cat.key)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? "bg-sky-600 text-white shadow-2xs"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full ${
                            isSelected ? "bg-sky-700 text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                  {dhamGallery
                    .filter(p => {
                      if (selectedDhamCategory === "all") return true;
                      if (selectedDhamCategory === "custom") return p.isCustom;
                      return p.dham === selectedDhamCategory;
                    })
                    .map(photo => {
                      const isCurrentlyInBrochure = (data.photos || []).some(p => p.url === photo.url);
                      return (
                        <div
                          key={photo.id}
                          className={`p-2 bg-white border rounded-xl flex flex-col justify-between gap-2 transition ${
                            isCurrentlyInBrochure ? "border-emerald-400 ring-1 ring-emerald-300 bg-emerald-50/20" : "border-gray-200 hover:border-sky-300"
                          }`}
                        >
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold rounded uppercase tracking-wider">
                              {photo.dhamLabel}
                            </span>
                            {photo.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteDhamPhoto(photo.id)}
                                title="Delete custom photo from library"
                                className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-500 hover:text-white text-gray-600 rounded transition cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-[11px] leading-tight line-clamp-2">
                              {photo.caption}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleTogglePhotoInBrochure(photo)}
                            className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              isCurrentlyInBrochure
                                ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                                : "bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 border border-sky-200"
                            }`}
                          >
                            {isCurrentlyInBrochure ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>In Brochure (Remove)</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Itinerary</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Active Photos List */}
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 text-xs">
                    Current Brochure Photos ({(data.photos || []).length})
                  </span>
                  {(data.photos || []).length > 0 && (
                    <button
                      onClick={() => setData({ ...data, photos: [] })}
                      className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Remove All
                    </button>
                  )}
                </div>

                {(data.photos || []).length === 0 ? (
                  <p className="text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg">
                    No pictures added yet. Upload client pictures or click presets above!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(data.photos || []).map((photo, pIdx) => (
                      <div key={photo.id || pIdx} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
                        <div className="w-16 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0 relative border border-gray-200">
                          <img 
                            src={photo.url} 
                            alt={photo.caption} 
                            className={`w-full h-full ${photo.fit === "contain" ? "object-contain bg-slate-900" : "object-cover"} ${photo.position === "top" ? "object-top" : photo.position === "bottom" ? "object-bottom" : "object-center"}`} 
                          />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-700 uppercase">
                              Photo #{pIdx + 1} · {pIdx < 3 ? "Page 1 Cover" : "Page 3 Gallery"}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMovePhoto(pIdx, "up")}
                                disabled={pIdx === 0}
                                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMovePhoto(pIdx, "down")}
                                disabled={pIdx === (data.photos || []).length - 1}
                                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemovePhoto(photo.id)}
                                className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer ml-1"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={photo.caption}
                            onChange={e => handleUpdatePhotoCaption(photo.id, e.target.value)}
                            placeholder="Enter photo caption..."
                            className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-[11px]"
                          />
                          {/* Image Focus & Fit Controls */}
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-gray-500 font-medium">Focus:</span>
                            <button
                              type="button"
                              onClick={() => handleUpdatePhotoSetting(photo.id, "position", "top")}
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition ${photo.position === "top" ? "bg-sky-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                              title="Focus towards top (keeps heads and temple tops in view)"
                            >
                              Top
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdatePhotoSetting(photo.id, "position", "center")}
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition ${!photo.position || photo.position === "center" ? "bg-sky-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                              title="Center focus"
                            >
                              Center
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdatePhotoSetting(photo.id, "fit", photo.fit === "contain" ? "cover" : "contain")}
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition ${photo.fit === "contain" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                              title="Fit entire image without cropping (adds clean dark border if needed)"
                            >
                              {photo.fit === "contain" ? "✓ Full Fit (No Crop)" : "Crop to Fill"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: INCLUSIONS & EXCLUSIONS */}
          {activeTab === "inclusions" && (
            <div className="space-y-5 text-xs">
              {/* Inclusions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Inclusions (✓)
                  </span>
                  <button
                    onClick={addInclusion}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    + Add Inclusion
                  </button>
                </div>
                <div className="space-y-1.5">
                  {data.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <input
                        type="text"
                        value={inc}
                        onChange={e => updateInclusion(i, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                      />
                      <button onClick={() => removeInclusion(i)} className="text-gray-300 hover:text-rose-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700 flex items-center gap-1.5">
                    <X className="w-4 h-4" />
                    Exclusions (✕)
                  </span>
                  <button
                    onClick={addExclusion}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    + Add Exclusion
                  </button>
                </div>
                <div className="space-y-1.5">
                  {data.exclusions.map((exc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-rose-500 font-bold">✕</span>
                      <input
                        type="text"
                        value={exc}
                        onChange={e => updateExclusion(i, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                      />
                      <button onClick={() => removeExclusion(i)} className="text-gray-300 hover:text-rose-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: POLICIES & AGENCY */}
          {activeTab === "contact" && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-gray-700 block">Good To Know Points</span>
                {data.goodToKnow.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    <input
                      type="text"
                      value={item}
                      onChange={e => {
                        const updated = [...data.goodToKnow];
                        updated[idx] = e.target.value;
                        setData({ ...data, goodToKnow: updated });
                      }}
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => setData({ ...data, goodToKnow: data.goodToKnow.filter((_, i) => i !== idx) })}
                      className="text-gray-300 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setData({ ...data, goodToKnow: [...data.goodToKnow, "New travel note"] })}
                  className="text-xs text-sky-600 font-semibold cursor-pointer"
                >
                  + Add Note
                </button>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100">
                <span className="font-bold text-gray-700 block">Booking & Payment Policy</span>
                {data.bookingPayment.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    <input
                      type="text"
                      value={item}
                      onChange={e => {
                        const updated = [...data.bookingPayment];
                        updated[idx] = e.target.value;
                        setData({ ...data, bookingPayment: updated });
                      }}
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => setData({ ...data, bookingPayment: data.bookingPayment.filter((_, i) => i !== idx) })}
                      className="text-gray-300 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setData({ ...data, bookingPayment: [...data.bookingPayment, "New payment term"] })}
                  className="text-xs text-sky-600 font-semibold cursor-pointer"
                >
                  + Add Policy
                </button>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-3 pt-3">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Agency & Consultant Contact</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500">Agency Name</label>
                    <input
                      type="text"
                      value={data.contactAgency}
                      onChange={e => setData({ ...data, contactAgency: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">Consultant Name</label>
                    <input
                      type="text"
                      value={data.contactPerson}
                      onChange={e => setData({ ...data, contactPerson: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500">Phone Number</label>
                    <input
                      type="text"
                      value={data.contactPhone}
                      onChange={e => setData({ ...data, contactPhone: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">Blessing Tagline</label>
                    <input
                      type="text"
                      value={data.motto}
                      onChange={e => setData({ ...data, motto: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-sky-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* RIGHT COLUMN: Live Multi-Page Luxury Brochure Preview (Auto-Fitted & Perfectly Proportioned) */}
      <div className={`flex flex-col gap-3 transition-all duration-300 h-full ${isFormCollapsed ? "w-full" : "w-full lg:w-[62%]"}`}>
        
        {/* Sleek Top Toolbar (No awkward wrapping) */}
        <div className="bg-white px-4 py-2.5 rounded-2xl shadow-xs border border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Left: Page Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition cursor-pointer"
              title={isFormCollapsed ? "Show Edit Form" : "Expand Full Preview"}
            >
              {isFormCollapsed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Previous Page */}
            <button
              onClick={() => {
                if (typeof activePreviewPage === "number" && activePreviewPage > 1) {
                  setActivePreviewPage(activePreviewPage - 1);
                }
              }}
              disabled={activePreviewPage === 1 || activePreviewPage === "all"}
              className="p-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 rounded-lg transition cursor-pointer border border-gray-200"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Quick Page Jump Buttons */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-bold text-gray-600">
              {[1, 2, 3, 4, 5, 6].map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePreviewPage(p)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    activePreviewPage === p ? "bg-[#002f6c] text-white shadow-xs" : "hover:text-gray-900"
                  }`}
                >
                  Page {p}
                </button>
              ))}
              <button
                onClick={() => setActivePreviewPage("all")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  activePreviewPage === "all" ? "bg-[#002f6c] text-white shadow-xs" : "hover:text-gray-900"
                }`}
              >
                All Pages
              </button>
            </div>

            {/* Next Page */}
            <button
              onClick={() => {
                if (typeof activePreviewPage === "number" && activePreviewPage < 6) {
                  setActivePreviewPage(activePreviewPage + 1);
                }
              }}
              disabled={activePreviewPage === 6 || activePreviewPage === "all"}
              className="p-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 rounded-lg transition cursor-pointer border border-gray-200"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
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

            {/* Send to Transport Voucher */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSendToTransport}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer border ${
                  transferredToTransport
                    ? "bg-emerald-500 text-white border-emerald-600 font-bold"
                    : "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                }`}
                title="Send current client and day itinerary schedule to Transport Voucher Studio"
              >
                <Car className="w-3.5 h-3.5 text-purple-600" />
                <span>{transferredToTransport ? "✓ Sent to Transport!" : "Send to Transport"}</span>
              </button>
              <Link
                href="/transport"
                className="p-1.5 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-lg text-xs transition cursor-pointer"
                title="Open Transport Voucher Studio"
              >
                <Car className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Share itinerary on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#002f6c] hover:bg-[#0a3871] text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
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

        {/* Scrollable & Auto-Fit Preview Viewport (No horizontal overflows, fits completely on screen) */}
        <div 
          ref={previewContainerRef}
          className="w-full flex-1 overflow-auto bg-slate-200/90 p-4 rounded-2xl flex flex-col items-center justify-start custom-scrollbar relative"
        >
          {/* Scaled Page Container (dynamically auto-fitted to available container dimensions) */}
          <div
            style={{
              width: `${Math.round(794 * currentScale)}px`,
              minHeight: activePreviewPage === "all" 
                ? `${Math.round((1122 * 6 + 120) * currentScale)}px` 
                : `${Math.round(1122 * currentScale)}px`,
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
              className="space-y-6"
            >
              {(activePreviewPage === 1 || activePreviewPage === "all") && renderPage1("view")}
              {(activePreviewPage === 2 || activePreviewPage === "all") && renderPage2("view")}
              {(activePreviewPage === 3 || activePreviewPage === "all") && renderPage3("view")}
              {(activePreviewPage === 4 || activePreviewPage === "all") && renderPage4("view")}
              {(activePreviewPage === 5 || activePreviewPage === "all") && renderPage5("view")}
              {(activePreviewPage === 6 || activePreviewPage === "all") && renderPage6("view")}
            </div>
          </div>

        </div>

      </div>

      {/* Hidden Printable Container for Razor-Sharp Unscaled PDF Export */}
      <div className="fixed -left-[99999px] top-0 pointer-events-none opacity-100 z-[-100]">
        {renderPage1("print")}
        {renderPage2("print")}
        {renderPage3("print")}
        {renderPage4("print")}
        {renderPage5("print")}
        {renderPage6("print")}
      </div>

      {/* GALLERY SELECTION MODAL */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-sky-600 via-[#0369a1] to-blue-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Select Photos for Itinerary & Brochure</h3>
                  <p className="text-[11px] text-sky-100">
                    Pick up to 6 photographs. Slots 1–3 appear on Page 1 (Cover Strip); Slots 4–6 appear on Page 3 (Destinations Gallery).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions & Category Filter Bar */}
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex flex-wrap items-center gap-1.5">
                {DHAM_CATEGORIES.map(cat => {
                  const count = cat.key === "all"
                    ? dhamGallery.length
                    : cat.key === "custom"
                    ? dhamGallery.filter(p => p.isCustom).length
                    : dhamGallery.filter(p => p.dham === cat.key).length;
                  if (count === 0 && cat.key !== "all" && cat.key !== "custom") return null;
                  const isSel = galleryModalCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setGalleryModalCategory(cat.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                        isSel ? "bg-[#002f6c] text-white shadow-xs" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {dhamGallery.filter(p => p.isCustom).length > 0 && (
                  <button
                    type="button"
                    onClick={handleApplyAllCustomUploads}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    ★ Select All My Uploads ({dhamGallery.filter(p => p.isCustom).length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAutoMatchPhotos}
                  className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-[#002f6c] rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Match
                </button>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="p-4 overflow-y-auto max-h-[55vh] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 custom-scrollbar">
              {dhamGallery
                .filter(p => {
                  if (galleryModalCategory === "all") return true;
                  if (galleryModalCategory === "custom") return p.isCustom;
                  return p.dham === galleryModalCategory;
                })
                .map(photo => {
                  const isSelected = (data.photos || []).some(p => p.url === photo.url);
                  const selIdx = (data.photos || []).findIndex(p => p.url === photo.url);

                  return (
                    <div
                      key={photo.id}
                      onClick={() => handleTogglePhotoInBrochure(photo)}
                      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition flex flex-col bg-white ${
                        isSelected 
                          ? "border-[#0369a1] ring-2 ring-[#0369a1]/30 shadow-md" 
                          : "border-gray-200 hover:border-sky-300 shadow-xs"
                      }`}
                    >
                      <div className="aspect-[4/3] w-full relative overflow-hidden bg-gray-100">
                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        {/* Checkbox / Slot Indicator */}
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition ${
                          isSelected ? "bg-[#002f6c] text-white shadow-md ring-2 ring-white" : "bg-black/40 text-white border border-white/60"
                        }`}>
                          {isSelected ? (selIdx + 1) : "+"}
                        </div>
                        {photo.isCustom && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded uppercase tracking-wider shadow-xs">
                            Custom Upload
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between gap-1.5">
                        <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight">
                          {photo.caption}
                        </p>
                        <span className={`text-[10px] font-bold block ${
                          isSelected ? "text-[#002f6c]" : "text-gray-400"
                        }`}>
                          {isSelected ? `✓ Selected (Slot #${selIdx + 1}${selIdx < 3 ? ' - Page 1' : ' - Page 3'})` : "Click to select"}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-600 font-medium">
                {(data.photos || []).length} of max 6 photos active in brochure
              </span>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="px-5 py-2 bg-[#002f6c] hover:bg-[#0a3871] text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Done / Apply to Itinerary
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
