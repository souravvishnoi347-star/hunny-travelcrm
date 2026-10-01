export interface MasterHotel {
  id: string;
  name: string;
  city: string; // Destination / Sector, e.g. "Barkot", "Uttarkashi", "Guptkashi", "Phata", "Sitapur", "Kedarnath", "Pipalkoti", "Badrinath", "Haridwar", "Rishikesh", "Joshimath", "Chopta"
  address: string;
  phone: string;
  category?: string; // "Hotel" | "Camp / Tent" | "Resort" | "Dharamshala" | "Homestay"
}

export const DEFAULT_HOTEL_DIRECTORY: MasterHotel[] = [
  // Haridwar
  {
    id: "h-hw-1",
    name: "Hotel Ganga Regency",
    city: "Haridwar",
    address: "Haridwar Bypass, Near Railway Station Gate No. 2, Haridwar",
    phone: "+91 98765 43210",
    category: "Hotel"
  },
  {
    id: "h-hw-2",
    name: "Hotel Classic Residency",
    city: "Haridwar",
    address: "Jwalapur Road, Haridwar",
    phone: "+91 98370 12345",
    category: "Hotel"
  },
  {
    id: "h-hw-3",
    name: "Hotel Haveli Hari Ganga",
    city: "Haridwar",
    address: "21 Pilibhit House, Ramghat, Haridwar",
    phone: "+91 98372 33445",
    category: "Heritage Hotel"
  },

  // Barkot / Yamunotri
  {
    id: "h-bk-1",
    name: "HOTEL TRISHUL",
    city: "Barkot / Yamunotri",
    address: "Main Highway, Barkot, Uttarakhand",
    phone: "8392932020",
    category: "Hotel"
  },
  {
    id: "h-bk-2",
    name: "Hotel Sarutal",
    city: "Barkot / Yamunotri",
    address: "Barkot, Yamunotri Road",
    phone: "7818854893",
    category: "Hotel"
  },
  {
    id: "h-bk-3",
    name: "Camp & Resort Shivalik Heights",
    city: "Barkot / Yamunotri",
    address: "Kharadi, Yamunotri Highway, Barkot",
    phone: "+91 94120 55678",
    category: "Resort & Camps"
  },
  {
    id: "h-bk-4",
    name: "Hotel Aditya Palace",
    city: "Barkot / Yamunotri",
    address: "Barkot Town, Yamunotri Highway",
    phone: "+91 94115 11223",
    category: "Hotel"
  },
  {
    id: "h-bk-5",
    name: "Yamunotri Cottage & Camps",
    city: "Kharsali / Yamunotri",
    address: "Kharsali Village, Yamunotri Foot-hills",
    phone: "+91 98370 22334",
    category: "Luxury Cottage"
  },

  // Uttarkashi / Hina / Gangotri
  {
    id: "h-uk-1",
    name: "HOTEL KAILASHA",
    city: "Uttarkashi / Hina",
    address: "Hina, Gangotri Highway, Uttarkashi",
    phone: "9718640101",
    category: "Hotel"
  },
  {
    id: "h-uk-2",
    name: "Hotel Skyline",
    city: "Uttarkashi / Gangotri",
    address: "Gangotri National Highway, Uttarkashi",
    phone: "8923184251",
    category: "Hotel"
  },
  {
    id: "h-uk-3",
    name: "Hotel Bhagirathi View",
    city: "Uttarkashi / Gangotri",
    address: "Netala, Gangotri Road, Uttarkashi",
    phone: "+91 97190 11223",
    category: "Hotel"
  },
  {
    id: "h-uk-4",
    name: "Hotel Ganga Putra",
    city: "Uttarkashi",
    address: "Bhatwari Road, Uttarkashi",
    phone: "+91 94129 88776",
    category: "Hotel"
  },
  {
    id: "h-uk-5",
    name: "Shikhar Nature Resort",
    city: "Uttarkashi",
    address: "Gangori, Uttarkashi",
    phone: "+91 98100 44556",
    category: "Resort"
  },

  // Guptkashi / Phata / Sitapur / Rampur (Kedarnath Route)
  {
    id: "h-ph-1",
    name: "HOTEL MAA PAA",
    city: "Phata / Guptkashi",
    address: "Phata, Kedarnath Route, Rudraprayag",
    phone: "9634528441",
    category: "Hotel"
  },
  {
    id: "h-ph-2",
    name: "Hotel JagatRaj",
    city: "Sitapur / Sonprayag",
    address: "Sitapur, Near Sonprayag, Kedarnath Highway",
    phone: "9410955555",
    category: "Hotel"
  },
  {
    id: "h-ph-3",
    name: "Hotel Omkara",
    city: "Badashu / Guptkashi",
    address: "Badashu, Kedarnath Route, Guptkashi",
    phone: "8923334391",
    category: "Hotel"
  },
  {
    id: "h-ph-4",
    name: "Kedar River Retreat",
    city: "Guptkashi / Sitapur",
    address: "Sitapur, Near Kedarnath Helipad / Phata",
    phone: "+91 98371 44556",
    category: "Resort"
  },
  {
    id: "h-ph-5",
    name: "Kedar Valley Camp & Resort",
    city: "Sitapur / Guptkashi",
    address: "Sitapur, Near Kedarnath Road",
    phone: "+91 98371 99887",
    category: "Camp & Resort"
  },
  {
    id: "h-ph-6",
    name: "Hotel Rajhans",
    city: "Guptkashi",
    address: "Guptkashi Main Market, Kedarnath Highway",
    phone: "+91 94120 88991",
    category: "Hotel"
  },

  // Kedarnath (Top / Base Camps)
  {
    id: "h-kd-1",
    name: "BHAGWARI JI (Camps / Tents)",
    city: "Kedarnath Dham",
    address: "Near Shri Kedarnath Temple, Base Camp, Kedarnath",
    phone: "9068648285",
    category: "Camp / Tent"
  },
  {
    id: "h-kd-2",
    name: "Kedarnath Bhawan / Camp Stay",
    city: "Kedarnath Dham",
    address: "Near Helipad & Temple, Shri Kedarnath Dham",
    phone: "9068648285",
    category: "Camp / Tent"
  },
  {
    id: "h-kd-3",
    name: "GMVN Swargarohini Complex",
    city: "Kedarnath Dham",
    address: "Near Kedarnath Temple, Kedarnath Dham",
    phone: "+91 135 2431793",
    category: "GMVN Complex"
  },

  // Chopta / Ukhimath / Sari
  {
    id: "h-ch-1",
    name: "Magpie Eco Resort Chopta",
    city: "Chopta",
    address: "Chopta Meadows, Ukhimath-Gopeshwar Road",
    phone: "+91 98370 55443",
    category: "Eco Resort"
  },
  {
    id: "h-ch-2",
    name: "Chopta Resort & Swiss Camps",
    city: "Chopta",
    address: "Dugalbitta, Chopta",
    phone: "+91 94111 66554",
    category: "Swiss Camps"
  },

  // Pipalkoti
  {
    id: "h-pk-1",
    name: "HOTEL DABRAL",
    city: "Pipalkoti",
    address: "Pipal Koti, Badrinath National Highway",
    phone: "7452827619",
    category: "Hotel"
  },
  {
    id: "h-pk-2",
    name: "Hotel Alaknanda View",
    city: "Pipalkoti",
    address: "Pipalkoti, Badrinath Highway",
    phone: "+91 94120 44332",
    category: "Hotel"
  },
  {
    id: "h-pk-3",
    name: "Hotel Comfort Inn",
    city: "Pipalkoti",
    address: "Main Badrinath Road, Pipalkoti",
    phone: "+91 98371 77665",
    category: "Hotel"
  },

  // Joshimath
  {
    id: "h-jm-1",
    name: "Hotel Mount View",
    city: "Joshimath",
    address: "Joshimath Main Market, Badrinath Road",
    phone: "+91 94111 22334",
    category: "Hotel"
  },
  {
    id: "h-jm-2",
    name: "The Tattva Resort",
    city: "Joshimath",
    address: "Shankaracharya Math Road, Joshimath",
    phone: "+91 98110 33445",
    category: "Resort"
  },

  // Badrinath Dham
  {
    id: "h-bd-1",
    name: "Hotel Dhansree",
    city: "Badrinath Dham",
    address: "Near Shri Badrinath Temple, Badrinath Dham",
    phone: "8395091744",
    category: "Hotel"
  },
  {
    id: "h-bd-2",
    name: "Hotel Badri Kedar Haven",
    city: "Badrinath Dham",
    address: "Main Temple Road, Badrinath Dham",
    phone: "+91 94111 88990",
    category: "Hotel"
  },
  {
    id: "h-bd-3",
    name: "Hotel Sarovar Portico",
    city: "Badrinath Dham",
    address: "Plot No. 834, Badrinath Dham",
    phone: "+91 94120 77889",
    category: "Luxury Hotel"
  },
  {
    id: "h-bd-4",
    name: "Hotel Narayan Palace",
    city: "Badrinath Dham",
    address: "Near Temple Barrier, Badrinath",
    phone: "+91 94120 11998",
    category: "Hotel"
  },

  // Rishikesh
  {
    id: "h-rk-1",
    name: "Hotel Ganga Kinare",
    city: "Rishikesh",
    address: "23, Virbhadra Road, Rishikesh",
    phone: "+91 98970 88776",
    category: "Riverside Resort"
  },
  {
    id: "h-rk-2",
    name: "Aloha On The Ganges",
    city: "Rishikesh",
    address: "Tapovan, Rishikesh",
    phone: "+91 98100 55667",
    category: "Luxury Resort"
  }
];

export const HOTEL_DIRECTORY_STORAGE_KEY = "traymbhkam_hotel_directory";

export function getStoredHotelDirectory(): MasterHotel[] {
  if (typeof window === "undefined") {
    return DEFAULT_HOTEL_DIRECTORY;
  }
  try {
    const raw = localStorage.getItem(HOTEL_DIRECTORY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(HOTEL_DIRECTORY_STORAGE_KEY, JSON.stringify(DEFAULT_HOTEL_DIRECTORY));
      return DEFAULT_HOTEL_DIRECTORY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_HOTEL_DIRECTORY;
  } catch (e) {
    console.warn("Failed to load hotel directory from localStorage:", e);
    return DEFAULT_HOTEL_DIRECTORY;
  }
}

export function saveStoredHotelDirectory(hotels: MasterHotel[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HOTEL_DIRECTORY_STORAGE_KEY, JSON.stringify(hotels));
  } catch (e) {
    console.error("Failed to save hotel directory to localStorage:", e);
  }
}
