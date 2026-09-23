export interface SavedDocument {
  id: string;
  type: "hotel_voucher" | "transport_voucher" | "itinerary" | "invoice";
  title: string;
  docNumber: string;
  guestName: string;
  guestPhone?: string;
  travelDates?: string;
  amount?: number;
  paidAmount?: number;
  pendingAmount?: number;
  paxCount?: string;
  createdAt: string;
  detailsSummary: string;
  studioUrl: string;
  rawPayload: any;
}

const STORAGE_KEY = "traymbhkam_saved_documents_hub";

export function getSavedDocuments(): SavedDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Could not read saved documents hub:", e);
  }
  return [];
}

export function saveDocumentToHub(doc: Omit<SavedDocument, "createdAt"> & { createdAt?: string }): SavedDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getSavedDocuments();
    const newDoc: SavedDocument = {
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString()
    };

    // Replace if same ID or docNumber, else prepend
    const existingIndex = current.findIndex(
      d => d.id === newDoc.id || (newDoc.docNumber && d.docNumber === newDoc.docNumber && d.type === newDoc.type)
    );

    let updated: SavedDocument[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...newDoc };
    } else {
      updated = [newDoc, ...current];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Could not write document to hub:", e);
    return [];
  }
}

export function deleteDocumentFromHub(id: string): SavedDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getSavedDocuments();
    const updated = current.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Could not delete document from hub:", e);
    return [];
  }
}
