"use client";
import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface MapSelectorProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export default function MapSelector({ lat, lng, onChange }: MapSelectorProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<any>(null);
  const [mapType, setMapType] = useState<"styled" | "satellite">("styled");

  useEffect(() => {
    let L: any;
    import("leaflet").then((leaflet) => {
      L = leaflet.default;

      if (!containerRef.current) return;

      // Clean up previous map instance
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Initialize map centered on current coordinates or default Gölbaşı
      const initialLat = lat || 39.795;
      const initialLng = lng || 32.810;

      const map = L.map(containerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true,
      });

      // Dark tiles
      const tileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 20,
      }).addTo(map);
      
      tileLayerRef.current = tileLayer;
      mapRef.current = map;

      // Create Custom gold pin
      const customIcon = L.divIcon({
        className: "custom-map-marker-selector",
        html: `<div class="w-6 h-6 bg-gold border-2 border-navy rounded-full shadow-lg flex items-center justify-center animate-bounce"><div class="w-2.5 h-2.5 bg-navy-dark rounded-full"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      // Place initial marker
      const marker = L.marker([initialLat, initialLng], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      // Click Event to select coordinates
      map.on("click", (e: any) => {
        const { lat: clickedLat, lng: clickedLng } = e.latlng;
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setLatLng([clickedLat, clickedLng]);
        }

        // Notify parent form
        onChange(parseFloat(clickedLat.toFixed(6)), parseFloat(clickedLng.toFixed(6)));
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

  // Sync marker position if lat/lng is changed outside (e.g. input fields)
  useEffect(() => {
    if (mapRef.current && markerRef.current && lat && lng) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.panTo([lat, lng]);
    }
  }, [lat, lng]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-gold/15 shadow-inner min-h-[220px]">
      <div ref={containerRef} className="w-full h-full" style={{ zIndex: 10 }} />
      
      {/* Map style toggle controller */}
      <div className="absolute top-2 right-2 z-20 flex bg-navy/90 backdrop-blur-md border border-gold/20 rounded-lg p-0.5 overflow-hidden shadow-lg">
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

      <div className="absolute bottom-2 left-2 z-20 bg-navy/90 border border-gold/10 text-[8px] uppercase tracking-wider text-cream/70 px-2 py-1 rounded shadow pointer-events-none">
        Konum Seçmek İçin Haritaya Tıklayın
      </div>
    </div>
  );
}
