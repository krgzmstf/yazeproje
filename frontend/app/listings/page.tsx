"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Home, Square, Filter, RefreshCw, Layers, List, Map } from "lucide-react";

// Dynamically load the Leaflet map to prevent SSR issues
const MapSearch = dynamic(() => import("@/components/ui/MapSearch"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-navy-dark border border-gold/15 rounded-2xl flex flex-col items-center justify-center text-xs text-cream/40 min-h-[400px]">
      <RefreshCw className="w-6 h-6 text-gold animate-spin mb-2" />
      <span>Harita modülü yükleniyor...</span>
    </div>
  ),
});

const propertyTypeLabels: Record<string, string> = {
  all: "Tüm Türler",
  apartment: "Konut / Daire",
  villa: "Villa",
  land: "Arsa / Arazi",
  office: "Ofis / İşyeri",
  shop: "Dükkan",
};

const listingTypeLabels: Record<string, string> = {
  all: "Tüm İlanlar",
  sale: "Satılık",
  rent: "Kiralık",
};

export default function ListingsPage() {
  // Filter States
  const [listingType, setListingType] = useState<string>("all");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [mapBounds, setMapBounds] = useState<any>(null);
  
  // View mode for responsive devices (split, map, list)
  const [viewMode, setViewMode] = useState<"split" | "map" | "list">("split");

  // Listings data states
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Trigger search on filter or bounds change
  useEffect(() => {
    const fetchFilteredListings = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const params = new URLSearchParams();
        if (listingType !== "all") params.append("listing_type", listingType);
        if (propertyType !== "all") params.append("property_type", propertyType);
        
        if (mapBounds) {
          params.append("min_lat", String(mapBounds.min_lat));
          params.append("max_lat", String(mapBounds.max_lat));
          params.append("min_lng", String(mapBounds.min_lng));
          params.append("max_lng", String(mapBounds.max_lng));
        }

        const apiBase = typeof window !== "undefined" && window.location.hostname.includes("yazeproje.com")
          ? "https://api.yazeproje.com/api/v1"
          : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:1002/api/v1");
        const response = await fetch(`${apiBase}/listings/?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Veriler alınamadı.");
        }
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error("Listings fetch failed:", error);
        setErrorMsg("İlanlar yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredListings();
  }, [listingType, propertyType, mapBounds]);

  const handleBoundsChange = (bounds: any) => {
    setMapBounds(bounds);
  };

  return (
    <div className="bg-navy min-h-screen text-cream pt-8 pb-20 select-none">
      <div className="max-w-8xl mx-auto px-4 md:px-8 h-full flex flex-col">
        
        {/* Page Title */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
              YAZE GAYRİMENKUL
            </span>
            <h1 className="font-playfair text-2xl md:text-4xl font-bold text-cream mt-1">
              Gölbaşı Konum Tabanlı Emlak Arama
            </h1>
          </div>

          {/* View Toggles for Mobile/Tablet */}
          <div className="flex bg-navy-dark border border-gold/15 p-1 rounded-xl shadow-lg shrink-0">
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all ${
                viewMode === "split" ? "bg-gold text-navy-dark shadow" : "text-cream/60 hover:text-gold"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Harita & Liste</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all ${
                viewMode === "map" ? "bg-gold text-navy-dark shadow" : "text-cream/60 hover:text-gold"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Harita</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all ${
                viewMode === "list" ? "bg-gold text-navy-dark shadow" : "text-cream/60 hover:text-gold"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Liste</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-navy-dark border border-gold/15 rounded-2xl p-5 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Listing Type Filter */}
            <div className="flex-1">
              <span className="block text-[9px] uppercase font-bold text-cream/50 tracking-wider mb-2">İşlem Türü</span>
              <div className="flex flex-wrap gap-2">
                {Object.keys(listingTypeLabels).map((type) => (
                  <button
                    key={type}
                    onClick={() => setListingType(type)}
                    className={`text-[10px] font-bold uppercase px-4 py-2 rounded-lg border transition-all duration-200 ${
                      listingType === type
                        ? "bg-gold border-gold text-navy-dark shadow"
                        : "bg-navy border-gold/15 text-cream/80 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {listingTypeLabels[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type Filter */}
            <div className="flex-1">
              <span className="block text-[9px] uppercase font-bold text-cream/50 tracking-wider mb-2">Mülk Tipi</span>
              <div className="flex flex-wrap gap-2">
                {Object.keys(propertyTypeLabels).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPropertyType(type)}
                    className={`text-[10px] font-bold uppercase px-3.5 py-2 rounded-lg border transition-all duration-200 ${
                      propertyType === type
                        ? "bg-gold border-gold text-navy-dark shadow"
                        : "bg-navy border-gold/15 text-cream/80 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {propertyTypeLabels[type]}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Main Body (Split Grid Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[500px]">
          
          {/* Left Column: Harita */}
          <div className={`lg:col-span-6 h-[550px] lg:h-[650px] ${
            viewMode === "list" ? "hidden" : "block"
          } ${viewMode === "map" ? "lg:col-span-12" : ""}`}>
            <MapSearch listings={listings} onBoundsChange={handleBoundsChange} />
          </div>

          {/* Right Column: Liste */}
          <div className={`lg:col-span-6 space-y-6 overflow-y-auto max-h-[650px] pr-2 ${
            viewMode === "map" ? "hidden" : "block"
          } ${viewMode === "list" ? "lg:col-span-12" : ""}`}>
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-gold animate-spin mr-2" />
                <span className="text-xs text-cream/60">İlanlar güncelleniyor...</span>
              </div>
            )}

            {/* Error Message */}
            {!loading && errorMsg && (
              <div className="text-center py-12 bg-navy-dark border border-gold/15 rounded-xl max-w-xl mx-auto">
                <p className="text-xs text-gold">{errorMsg}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !errorMsg && listings.length === 0 && (
              <div className="text-center py-20 bg-navy-dark border border-gold/15 rounded-2xl max-w-xl mx-auto">
                <p className="text-xs text-cream/60">
                  Harita sınırları içerisinde kriterlerinize uygun ilan bulunmamaktadır.
                </p>
                <p className="text-[10px] text-gold/60 mt-1">Haritayı sürükleyerek veya uzaklaştırarak aramayı genişletebilirsiniz.</p>
              </div>
            )}

            {/* Listings Grid */}
            {!loading && !errorMsg && listings.length > 0 && (
              <div className={`grid gap-6 ${viewMode === "list" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
                {listings.map((l) => {
                  const typeLabel = `${listingTypeLabels[l.listing_type] || l.listing_type} ${propertyTypeLabels[l.property_type] || l.property_type}`;
                  const priceLabel = l.price
                    ? `${l.price.toLocaleString("tr-TR")} ${l.currency === "TRY" ? "TL" : l.currency}`
                    : "Fiyat Sorunuz";
                  const location = l.district ? `${l.neighborhood ? l.neighborhood + ", " : ""}${l.district}` : "Gölbaşı, Ankara";

                  return (
                    <Link
                      key={l.id}
                      href={`/listings/${l.slug}`}
                      className="group bg-navy-dark border border-gold/10 hover:border-gold rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full"
                    >
                      {/* Image */}
                      <div className="relative h-44 bg-navy overflow-hidden">
                        <img
                          src={l.cover_image_url || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80"}
                          alt={l.title}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-103"
                        />
                        <div className="absolute top-3 left-3 z-20">
                          <span className="text-[8px] font-bold uppercase px-2.5 py-1 bg-navy-dark/95 text-gold border border-gold/25 rounded-md shadow-md">
                            {typeLabel}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 z-20">
                          <span className="text-[10px] font-bold bg-gold text-navy-dark px-3 py-1.5 rounded shadow-lg">
                            {priceLabel}
                          </span>
                        </div>
                      </div>

                      {/* Detail Info */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-playfair font-bold text-cream text-sm mb-2 group-hover:text-gold transition-colors duration-300 line-clamp-2 leading-relaxed">
                            {l.title}
                          </h3>
                          <div className="flex items-center space-x-1 text-[10px] text-cream/55 mb-4">
                            <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                            <span className="line-clamp-1">{location}</span>
                          </div>
                        </div>

                        {/* Footer Details */}
                        <div className="flex justify-between items-center text-[10px] text-cream/70 border-t border-gold/5 pt-3 mt-auto">
                          <div className="flex items-center space-x-3">
                            {l.room_count && (
                              <div className="flex items-center space-x-1 text-cream/60">
                                <Home className="w-3.5 h-3.5 text-gold/70" />
                                <span>{l.room_count}</span>
                              </div>
                            )}
                            {l.area_sqm && (
                              <div className="flex items-center space-x-1 text-cream/60">
                                <Square className="w-3.5 h-3.5 text-gold/70" />
                                <span>{l.area_sqm} m²</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] uppercase font-bold text-gold group-hover:text-gold-light transition-colors">
                            Detay &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
