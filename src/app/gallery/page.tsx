"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Plus, 
  Check, 
  RotateCcw, 
  ExternalLink, 
  Filter, 
  Sparkles, 
  MapPin, 
  Tag, 
  X, 
  Download, 
  ZoomIn, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { 
  getStoredDhamGallery, 
  saveStoredDhamGallery, 
  DhamGalleryPhoto, 
  DHAM_CATEGORIES,
  INITIAL_DHAM_GALLERY 
} from "@/lib/dhamGallery";

export default function DhamGalleryPage() {
  const [photos, setPhotos] = useState<DhamGalleryPhoto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<DhamGalleryPhoto | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Upload Form State
  const [uploadCategory, setUploadCategory] = useState<string>("kedarnath");
  const [uploadCaption, setUploadCaption] = useState<string>("");
  const [previewImages, setPreviewImages] = useState<{ url: string; file: File }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPhotos(getStoredDhamGallery());
  }, []);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered photos
  const filteredPhotos = selectedCategory === "all" 
    ? photos 
    : selectedCategory === "custom"
      ? photos.filter(p => p.isCustom)
      : photos.filter(p => p.dham === selectedCategory);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPreviews: { url: string; file: File }[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push({
            url: event.target.result as string,
            file
          });
          if (newPreviews.length === files.length) {
            setPreviewImages(prev => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveUploads = () => {
    if (previewImages.length === 0) {
      alert("Please select at least one image to upload.");
      return;
    }

    setIsUploading(true);
    const cat = DHAM_CATEGORIES.find(c => c.key === uploadCategory);
    const newPhotos: DhamGalleryPhoto[] = previewImages.map((img, idx) => ({
      id: `custom-photo-${Date.now()}-${idx}`,
      url: img.url,
      caption: uploadCaption.trim() || `${cat?.label || "Dham"} Scenic Photograph`,
      dham: uploadCategory as any,
      dhamLabel: cat?.label || "Uttarakhand Dham",
      isCustom: true,
      createdAt: new Date().toISOString()
    }));

    const updated = [...newPhotos, ...photos];
    setPhotos(updated);
    saveStoredDhamGallery(updated);

    // Reset upload form
    setPreviewImages([]);
    setUploadCaption("");
    setIsUploading(false);
    setShowUploadModal(false);
    notify(`✓ Successfully uploaded ${newPhotos.length} photo(s) to ${cat?.label} library!`);
  };

  const handleDeletePhoto = (id: string) => {
    if (!confirm("Are you sure you want to remove this photograph from your library?")) return;
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    saveStoredDhamGallery(updated);
    notify("Photograph removed from library.");
  };

  const handleResetToDefault = () => {
    if (!confirm("Reset photo library to default curated Dham photography? (Any custom uploaded photos will be replaced)")) return;
    setPhotos(INITIAL_DHAM_GALLERY);
    saveStoredDhamGallery(INITIAL_DHAM_GALLERY);
    notify("Photo library reset to official curated presets.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0369a1] flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Dham Photo Library & Media Studio
            </h1>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            Central repository of high-resolution Dham & Himalayan photography used in AI Brochures and Itineraries.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Reset library to default curated images"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Curated
          </button>

          <Link
            href="/itinerary-builder"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-sky-50 text-[#0369a1] border border-sky-200 rounded-xl text-xs font-bold shadow-2xs transition"
          >
            <span>Itinerary Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0369a1] hover:bg-[#025684] text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Pictures</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 pr-2 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {DHAM_CATEGORIES.map(cat => {
          const count = cat.key === "all" 
            ? photos.length 
            : cat.key === "custom"
              ? photos.filter(p => p.isCustom).length
              : photos.filter(p => p.dham === cat.key).length;

          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#0369a1] text-white shadow-xs font-bold"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/70"
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? "bg-white/20 text-white font-bold" : "bg-gray-200/80 text-gray-600 font-semibold"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0369a1] flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">No photographs found in this category</h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">
            You haven't added photos for this tag yet. Click below to upload your own custom pictures.
          </p>
          <button
            onClick={() => {
              if (selectedCategory !== "all" && selectedCategory !== "custom") {
                setUploadCategory(selectedCategory);
              }
              setShowUploadModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0369a1] text-white rounded-xl text-xs font-bold hover:bg-[#025684] transition"
          >
            <Plus className="w-4 h-4" />
            Upload Photo for this Tag
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div 
              key={photo.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden hover:shadow-md hover:border-sky-200 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Image Container with Hover Actions */}
              <div className="relative aspect-4/3 bg-gray-100 overflow-hidden cursor-pointer" onClick={() => setLightboxPhoto(photo)}>
                <img 
                  src={photo.url} 
                  alt={photo.caption} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Category Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md shadow-xs">
                    {photo.dhamLabel}
                  </span>
                </div>

                {/* Custom Badge */}
                {photo.isCustom && (
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-md shadow-xs">
                      Custom Upload
                    </span>
                  </div>
                )}

                {/* Hover Overlay Icon */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-md">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Caption & Controls */}
              <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">
                    {photo.caption}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0369a1]" />
                    <span>{photo.dhamLabel}</span>
                  </p>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(photo.url);
                      notify("Image URL copied to clipboard!");
                    }}
                    className="text-[10px] text-gray-500 hover:text-[#0369a1] font-semibold transition"
                  >
                    Copy URL
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(photo.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete photograph"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0369a1] flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Upload Photographs to Library</h3>
                  <p className="text-xs text-gray-500">Add authentic Dham & hotel photos for brochure auto-matching</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setPreviewImages([]);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Category Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">Select Destination / Dham Tag</label>
              <select
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0369a1]"
              >
                {DHAM_CATEGORIES.filter(c => c.key !== "all" && c.key !== "custom").map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
                <option value="custom">General / Custom Tourism Photo</option>
              </select>
            </div>

            {/* Default Caption */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">Photo Caption / Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Kedarnath Valley view from VIP Helipad"
                value={uploadCaption}
                onChange={e => setUploadCaption(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-[#0369a1]"
              />
            </div>

            {/* File Dropzone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-50 rounded-2xl p-6 text-center cursor-pointer transition space-y-2"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileSelect} 
                className="hidden" 
              />
              <div className="w-10 h-10 rounded-full bg-sky-100 text-[#0369a1] flex items-center justify-center mx-auto">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Click to browse or drag photos here</p>
                <p className="text-[11px] text-gray-500">Supports JPG, PNG, WEBP (Multiple files supported)</p>
              </div>
            </div>

            {/* Upload Previews */}
            {previewImages.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-gray-600 block">
                  Selected Photos ({previewImages.length}):
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 max-h-24">
                  {previewImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                      <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImages(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setPreviewImages([]);
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUploads}
                disabled={previewImages.length === 0 || isUploading}
                className="px-5 py-2 bg-[#0369a1] hover:bg-[#025684] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {isUploading ? "Uploading..." : `Save ${previewImages.length} Photo(s) to Library`}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div 
            className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl flex flex-col animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative max-h-[75vh] bg-black flex items-center justify-center overflow-hidden">
              <img 
                src={lightboxPhoto.url} 
                alt={lightboxPhoto.caption} 
                className="max-h-[75vh] w-auto object-contain"
              />
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0369a1] bg-sky-50 px-2 py-0.5 rounded">
                  {lightboxPhoto.dhamLabel}
                </span>
                <h4 className="font-bold text-gray-900 text-sm mt-1">{lightboxPhoto.caption}</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleDeletePhoto(lightboxPhoto.id);
                    setLightboxPhoto(null);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
