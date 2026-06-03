"use client";
import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface MapSearchProps {
  listings: any[];
  onBoundsChange: (bounds: {
    min_lat: number;
    max_lat: number;
    min_lng: number;
    max_lng: number;
  }) => void;
}

export default function MapSearch({ listings, onBoundsChange }: MapSearchProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const tileLayerRef = useRef<any>(null);
  const [mapType, setMapType] = useState<"styled" | "satellite">("styled");

  useEffect(() => {
    // Dynamically import Leaflet on client side
    let L: any;
    import("leaflet").then((leaflet) => {
      L = leaflet.default;

      if (!containerRef.current) return;

      // Clean up previous map instance if exists
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Initialize Map centered on Gölbaşı, Ankara
      const map = L.map(containerRef.current, {
        center: [39.795, 32.810],
        zoom: 13,
        zoomControl: true,
      });

      // Use a dark-mode styled openstreetmap tile for rich premium aesthetics
      const tileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapRef.current = map;

      // Set initial bounds
      triggerBoundsChange();

      // Listen to move/zoom events
      map.on("moveend", () => {
        triggerBoundsChange();
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer URL dynamically
  useEffect(() => {
    if (tileLayerRef.current) {
      if (mapType === "styled") {
        tileLayerRef.current.setUrl("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png");
      } else {
        tileLayerRef.current.setUrl("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}");
      }
    }
  }, [mapType]);

  // Update Markers when listings change
  useEffect(() => {
    if (!mapRef.current) return;

    import("leaflet").then((leaflet) => {
      const L = leaflet.default;

      // Remove existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      listings.forEach((item) => {
        if (!item.latitude || !item.longitude) return;

        // Custom premium gold tag icon
        const priceLabel = item.price
          ? item.price >= 1000000
            ? `${(item.price / 1000000).toFixed(1)}M TL`
            : `${(item.price / 1000).toFixed(0)}K TL`
          : "Fiyat Sor";

        const customIcon = L.divIcon({
          className: "custom-map-marker",
          html: `<div class="bg-gold hover:bg-gold-light border-2 border-navy text-navy-dark text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg hover:scale-105 transition-all cursor-pointer whitespace-nowrap select-none font-sans">${priceLabel}</div>`,
          iconSize: [60, 26],
          iconAnchor: [30, 13],
        });

        const marker = L.marker([item.latitude, item.longitude], { icon: customIcon }).addTo(mapRef.current);

        // Custom Premium Popup
        const typeLabel = item.listing_type === "sale" ? "Satılık" : "Kiralık";
        const popupContent = `
          <div style="font-family: sans-serif; width: 220px; color: #1e293b; padding: 4px;">
            <img src="${item.cover_image_url || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80'}" 
                 style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
            <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #0f172a; line-height: 1.4;">${item.title}</h4>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; background: #fef08a; color: #854d0e; padding: 2px 6px; border-radius: 4px;">
                ${typeLabel}
              </span>
              <a href="/listings/${item.slug}" style="font-size: 11px; color: #854d0e; font-weight: bold; text-decoration: none; display: inline-flex; align-items: center;">
                Detaya Git &rarr;
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: false,
          className: "custom-leaflet-popup",
        });

        markersRef.current.push(marker);
      });
    });
  }, [listings]);

  const triggerBoundsChange = () => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();

    onBoundsChange({
      min_lat: southWest.lat,
      max_lat: northEast.lat,
      min_lng: southWest.lng,
      max_lng: northEast.lng,
    });
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gold/15 shadow-xl bg-navy-dark min-h-[350px] lg:min-h-0">
      <div ref={containerRef} className="w-full h-full" style={{ zIndex: 10 }} />
      
      {/* Map style toggle controller */}
      <div className="absolute top-4 right-4 z-20 flex bg-navy/90 backdrop-blur-md border border-gold/20 rounded-lg p-0.5 overflow-hidden shadow-lg">
        <button
          type="button"
          onClick={() => setMapType("styled")}
          className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${
            mapType === "styled" ? "bg-gold text-navy-dark shadow-inner" : "text-cream/60 hover:text-cream"
          }`}
        >
          Gri Stil
        </button>
        <button
          type="button"
          onClick={() => setMapType("satellite")}
          className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${
            mapType === "satellite" ? "bg-gold text-navy-dark shadow-inner" : "text-cream/60 hover:text-cream"
          }`}
        >
          Uydu Gör.
        </button>
      </div>

      {/* Dynamic Mini Map Title overlay */}
      <div className="absolute top-4 left-4 z-20 bg-navy/90 border border-gold/25 text-gold text-[9px] uppercase font-bold tracking-wider px-3.5 py-2 rounded-lg shadow-lg pointer-events-none">
        Gölbaşı Harita Araması
      </div>
    </div>
  );
}
