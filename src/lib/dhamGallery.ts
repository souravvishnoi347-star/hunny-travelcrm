/**
 * Dham Photo Gallery & AI Auto-Match Engine for Traymbhkam Tour and Travels
 */

export interface DhamGalleryPhoto {
  id: string;
  url: string;
  caption: string;
  dham: "kedarnath" | "badrinath" | "gangotri" | "yamunotri" | "helicopter" | "haridwar_rishikesh" | "chopta_tungnath" | "himalayas" | "reviews" | "custom";
  dhamLabel: string;
  isDefault?: boolean;
  isCustom?: boolean;
  createdAt?: string;
}

export const INITIAL_DHAM_GALLERY: DhamGalleryPhoto[] = [
  // ==========================================
  // Traymbhkam Travels - Authentic Pilgrim Reviews & Yatra Group Photos
  // ==========================================
  {
    id: "traymbhkam-review-1",
    url: "/reviews/review_1.jpeg",
    caption: "Blessed Pilgrims Group - Chardham Yatra by Traymbhkam Travels",
    dham: "reviews",
    dhamLabel: "Yatra Reviews",
    isDefault: true
  },
  {
    id: "traymbhkam-review-2",
    url: "/reviews/review_2.jpeg",
    caption: "Devotees Darshan Tour with Traymbhkam Travels",
    dham: "reviews",
    dhamLabel: "Yatra Reviews",
    isDefault: true
  },
  {
    id: "traymbhkam-review-3",
    url: "/reviews/review_3.jpeg",
    caption: "Happy Yatra Group Darshan - Uttarakhand Himalayas",
    dham: "reviews",
    dhamLabel: "Yatra Reviews",
    isDefault: true
  },
  {
    id: "traymbhkam-review-4",
    url: "/reviews/review_4.jpeg",
    caption: "Pilgrims at Sacred Temple - Traymbhkam Tour and Travels",
    dham: "reviews",
    dhamLabel: "Yatra Reviews",
    isDefault: true
  },
  {
    id: "traymbhkam-review-5",
    url: "/reviews/review_5.jpeg",
    caption: "Pilgrimage Yatra Group Moments - Haridwar Departure",
    dham: "reviews",
    dhamLabel: "Yatra Reviews",
    isDefault: true
  },
  {
    id: "traymbhkam-review-6",
    url: "/reviews/review_6.jpeg",
    caption: "Satisfied Guests on Sacred Uttarakhand Circuit",
    dham: "reviews",
    dhamLabel: "Yatra Reviews",
    isDefault: true
  },
  {
    id: "traymbhkam-review-7",
    url: "/reviews/review_7.jpeg",
    caption: "Devotees enjoying Chardham Journey with Traymbhkam Travels",
    dham: "reviews",
    dhamLabel: "Yatra Reviews",
    isDefault: true
  },
  {
    id: "traymbhkam-review-8",
    url: "/reviews/review_8.jpeg",
    caption: "Family & Senior Devotee Group - Divine Yatra Experience",
    dham: "reviews",
    dhamLabel: "Yatra Reviews",
    isDefault: true
  },
  {
    id: "traymbhkam-review-9",
    url: "/reviews/review_9.jpeg",
    caption: "Pilgrims Darshan Celebration in Uttarakhand Hills",
    dham: "reviews",
    dhamLabel: "Yatra Reviews",
    isDefault: true
  },
  {
    id: "traymbhkam-review-10",
    url: "/reviews/review_10.jpeg",
    caption: "Traymbhkam Tour & Travels - Trusted Yatra Companion",
    dham: "reviews",
    dhamLabel: "Yatra Reviews",
    isDefault: true
  },

  // Kedarnath Dham (Authentic Tour Photos)
  {
    id: "dham-kedarnath-auth-1",
    url: "/gallery/chardham_10d_img_13.jpg",
    caption: "Shri Kedarnath Temple Entrance & Holy Nandi Darshan",
    dham: "kedarnath",
    dhamLabel: "Kedarnath Dham",
    isDefault: true
  },
  {
    id: "dham-kedarnath-auth-2",
    url: "/gallery/chardham_10d_img_12.jpg",
    caption: "Shri Kedarnath Dham Temple & Snow Himalaya Peaks",
    dham: "kedarnath",
    dhamLabel: "Kedarnath Dham",
    isDefault: true
  },

  // Badrinath Dham (Authentic Tour Photos)
  {
    id: "dham-badrinath-auth-1",
    url: "/gallery/chardham_10d_img_15.jpg",
    caption: "Shri Badrinath Ji Temple - Divine Facade & Alaknanda Valley",
    dham: "badrinath",
    dhamLabel: "Badrinath Dham",
    isDefault: true
  },
  {
    id: "dham-badrinath-auth-2",
    url: "/gallery/chardham_10d_img_16.jpg",
    caption: "Shri Badrinath Dham Golden Kalash & Evening Aarti",
    dham: "badrinath",
    dhamLabel: "Badrinath Dham",
    isDefault: true
  },

  // Gangotri Dham (Authentic Tour Photos)
  {
    id: "dham-gangotri-auth-1",
    url: "/gallery/chardham_10d_img_8.jpg",
    caption: "Holy Shri Gangotri Dham Temple & Snow Bhagirathi Range",
    dham: "gangotri",
    dhamLabel: "Gangotri Dham",
    isDefault: true
  },

  // Yamunotri Dham & Foothills (Authentic Tour Photos)
  {
    id: "dham-yamunotri-auth-1",
    url: "/gallery/chardham_10d_img_7.jpg",
    caption: "Sacred Shri Yamunotri Dham Foothills & Scenic Himalayan Ridge",
    dham: "yamunotri",
    dhamLabel: "Yamunotri Dham",
    isDefault: true
  },

  // Complete Chardham 4 Dhams Composite Banner
  {
    id: "dham-all4-banner",
    url: "/gallery/chardham_10d_img_1.jpg",
    caption: "Char Dham Yatra 4 Holy Shrines: Yamunotri, Gangotri, Kedarnath, Badrinath",
    dham: "himalayas",
    dhamLabel: "Chardham Circuit",
    isDefault: true
  },

  // Kedarnath Helicopter Sector (Authentic Photos)
  {
    id: "dham-heli-auth-1",
    url: "/gallery/chardham_10d_img_9.jpg",
    caption: "Kedarnath Valley Helipad & Helicopter Shuttle Darshan",
    dham: "helicopter",
    dhamLabel: "Helicopter Darshan",
    isDefault: true
  },
  {
    id: "dham-heli-auth-2",
    url: "/gallery/chardham_10d_img_10.jpg",
    caption: "Himalayan Aerial Kedarnath Helicopter Flight",
    dham: "helicopter",
    dhamLabel: "Helicopter Darshan",
    isDefault: true
  },

  // Chopta, Tungnath & Chandrashila (Authentic Photos)
  {
    id: "dham-chopta-auth-1",
    url: "/gallery/chardham_10d_img_14.jpg",
    caption: "Chopta Tungnath & Chandrashila Sacred Himalayan Ridge",
    dham: "chopta_tungnath",
    dhamLabel: "Chopta & Tungnath",
    isDefault: true
  },

  // Sacred River Confluences & Temples (Maa Dhari Devi & Ganga Aarti)
  {
    id: "dham-dharidevi-auth-1",
    url: "/gallery/chardham_10d_img_18.jpg",
    caption: "Maa Dhari Devi Temple - Guardian Deity of Devbhoomi",
    dham: "haridwar_rishikesh",
    dhamLabel: "Haridwar & Rishikesh",
    isDefault: true
  },
  {
    id: "dham-haridwar-auth-2",
    url: "/gallery/chardham_10d_img_19.jpg",
    caption: "Sacred Devprayag Sangam & Himalayan Confluence",
    dham: "haridwar_rishikesh",
    dhamLabel: "Haridwar & Rishikesh",
    isDefault: true
  },

  // Deluxe Hotels & Group Travel
  {
    id: "dham-hotel-deluxe-1",
    url: "/gallery/chardham_10d_img_31.jpg",
    caption: "Confirmed Deluxe Hill Hotel & Comfortable Room Stay",
    dham: "custom",
    dhamLabel: "Deluxe Hotels",
    isDefault: true
  },
  {
    id: "dham-group-tempo-1",
    url: "/gallery/chardham_10d_img_4.jpg",
    caption: "Pilgrimage Group & Luxury Tempo Traveller",
    dham: "custom",
    dhamLabel: "Group Transport",
    isDefault: true
  }
];

export const DHAM_CATEGORIES = [
  { key: "all", label: "All Photos" },
  { key: "reviews", label: "Pilgrim Reviews & Tours" },
  { key: "kedarnath", label: "Kedarnath" },
  { key: "badrinath", label: "Badrinath" },
  { key: "gangotri", label: "Gangotri" },
  { key: "yamunotri", label: "Yamunotri" },
  { key: "helicopter", label: "Helicopter" },
  { key: "haridwar_rishikesh", label: "Haridwar / Rishikesh" },
  { key: "chopta_tungnath", label: "Chopta / Tungnath" },
  { key: "custom", label: "Custom Uploads" },
];

/**
 * Load saved gallery from local storage or fallback to curated default
 */
export function getStoredDhamGallery(): DhamGalleryPhoto[] {
  if (typeof window === "undefined") return INITIAL_DHAM_GALLERY;
  try {
    const saved = localStorage.getItem("traymbhkam_dham_gallery");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = parsed.filter((p: any) => !p.url?.includes("unsplash.com"));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem("traymbhkam_dham_gallery", JSON.stringify(cleaned));
        }
        return cleaned.length > 0 ? cleaned : INITIAL_DHAM_GALLERY;
      }
    }
  } catch (e) {
    console.warn("Could not read dham gallery:", e);
  }
  return INITIAL_DHAM_GALLERY;
}

/**
 * Save updated gallery to local storage
 */
export function saveStoredDhamGallery(gallery: DhamGalleryPhoto[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("traymbhkam_dham_gallery", JSON.stringify(gallery));
  } catch (e) {
    console.warn("Could not save dham gallery:", e);
  }
}

/**
 * AI Smart Dham Photo Matcher:
 * Analyzes itinerary text (title, route, dhams, activities) and automatically selects
 * the most relevant photos from the gallery for the detected Dhams/Destinations.
 */
export function pickDhamPhotosForItinerary(
  itinerary: {
    title?: string;
    subTitle?: string;
    dhamsSubtitle?: string;
    routeCovered?: string;
    overviewSummary?: string;
    days?: Array<{ route?: string; activities?: string[]; overnightStay?: string }>;
  },
  gallery: DhamGalleryPhoto[]
): { id: string; url: string; caption: string }[] {
  // Aggregate all itinerary content to search
  const textCorpus = [
    itinerary.title || "",
    itinerary.subTitle || "",
    itinerary.dhamsSubtitle || "",
    itinerary.routeCovered || "",
    itinerary.overviewSummary || "",
    ...(itinerary.days || []).flatMap(d => [d.route || "", ...(d.activities || []), d.overnightStay || ""])
  ].join(" ").toLowerCase();

  const selectedPhotos: { id: string; url: string; caption: string }[] = [];
  const addedIds = new Set<string>();

  // 1. HIGHEST PRIORITY: User's own custom uploaded photos from the gallery!
  // These are the user's authentic client/group photos (e.g., Chardham group)
  const customPhotos = gallery.filter(p => p.isCustom);
  for (const cp of customPhotos) {
    if (!addedIds.has(cp.id) && selectedPhotos.length < 6) {
      selectedPhotos.push({
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        url: cp.url,
        caption: cp.caption
      });
      addedIds.add(cp.id);
    }
  }

  // Detect which destinations are mentioned
  const hasKedarnath = /kedarnath|kedar|shri kedar/i.test(textCorpus);
  const hasHelicopter = /helicopter|heli|helipad|phata|sersi|guptkashi heli/i.test(textCorpus);
  const hasBadrinath = /badrinath|badri|mana village|joshimath|alaknanda/i.test(textCorpus);
  const hasGangotri = /gangotri|bhagirathi|uttarkashi|harsil/i.test(textCorpus);
  const hasYamunotri = /yamunotri|yamuna|barkot|janki chatti|surya kund/i.test(textCorpus);
  const hasHaridwarRishi = /haridwar|rishikesh|ganga aarti|har ki pauri|ram jhula/i.test(textCorpus);
  const hasChopta = /chopta|tungnath|chandrashila|deoriatal/i.test(textCorpus);

  const addPhotoFromDham = (dhamKey: string) => {
    if (selectedPhotos.length >= 6) return;
    const candidates = gallery.filter(p => p.dham === dhamKey && !addedIds.has(p.id));
    if (candidates.length > 0) {
      // Prioritize custom uploads within category, then default
      const photo = candidates.find(p => p.isCustom) || candidates[0];
      selectedPhotos.push({
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        url: photo.url,
        caption: photo.caption
      });
      addedIds.add(photo.id);
    }
  };

  // Order of priority based on pilgrimage flow
  if (hasKedarnath) addPhotoFromDham("kedarnath");
  if (hasBadrinath) addPhotoFromDham("badrinath");
  if (hasYamunotri) addPhotoFromDham("yamunotri");
  if (hasGangotri) addPhotoFromDham("gangotri");
  if (hasHelicopter) addPhotoFromDham("helicopter");
  if (hasChopta) addPhotoFromDham("chopta_tungnath");
  if (hasHaridwarRishi) addPhotoFromDham("haridwar_rishikesh");

  // If fewer than 4 photos, supplement with top gallery photos
  if (selectedPhotos.length < 4) {
    for (const p of gallery) {
      if (!addedIds.has(p.id) && selectedPhotos.length < 6) {
        selectedPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url: p.url,
          caption: p.caption
        });
        addedIds.add(p.id);
      }
    }
  }

  // Cap at 6 photos (3 for Page 1 cover strip, 3 for Page 3 destinations gallery)
  return selectedPhotos.slice(0, 6);
}
