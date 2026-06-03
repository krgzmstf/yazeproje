import React from "react";
import Image from "next/image";
import { ArrowRight, MapPin, Tag, Square, Home } from "lucide-react";
import { RealEstateListing } from "@/lib/api";

const propertyTypeLabels: Record<string, string> = {
  apartment: "Konut",
  villa: "Villa",
  land: "Arsa",
  office: "Ofis",
  shop: "Dükkan",
  warehouse: "Depo",
  other: "Gayrimenkul",
};

const listingTypeLabels: Record<string, string> = {
  sale: "Satılık",
  rent: "Kiralık",
  daily_rent: "Günlük Kiralık",
};

interface RealEstateCarouselProps {
  listings?: RealEstateListing[];
}

export default function RealEstateCarousel({ listings: apiListings }: RealEstateCarouselProps) {
  const fallbackListings = [
    {
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
      title: "Mogan Gölü Çevresinde Konut İmarlı Villa Arsası",
      type: "Satılık Arsa",
      price: "6.850.000 TL",
      location: "Mogan, Gölbaşı",
      metrics: [
        { icon: Square, label: "850 m²" },
        { icon: Tag, label: "Villa İmarlı" },
      ],
    },
    {
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
      title: "Karşıyaka Mahallesinde 5+2 Akıllı Müstakil Villa",
      type: "Satılık Villa",
      price: "24.500.000 TL",
      location: "Karşıyaka, Gölbaşı",
      metrics: [
        { icon: Home, label: "5+2 Oda" },
        { icon: Square, label: "540 m²" },
      ],
    },
    {
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      title: "Gölbaşı Cadde Üzeri Yatırımlık Mağaza & Ofis",
      type: "Kiralık İşyeri",
      price: "45.000 TL / Ay",
      location: "Merkez, Gölbaşı",
      metrics: [
        { icon: Home, label: "3 Ofis Bölmeli" },
        { icon: Square, label: "180 m²" },
      ],
    },
  ];

  const items = apiListings && apiListings.length > 0
    ? apiListings.map(l => {
        const typeLabel = `${listingTypeLabels[l.listing_type] || l.listing_type} ${propertyTypeLabels[l.property_type] || l.property_type}`;
        const priceLabel = l.price
          ? `${l.price.toLocaleString("tr-TR")} ${l.currency === "TRY" ? "TL" : l.currency}${l.listing_type === "rent" ? " / Ay" : ""}`
          : "Fiyat Sorunuz";
        
        const metrics = [];
        if (l.room_count) {
          metrics.push({ icon: Home, label: `${l.room_count} Oda` });
        }
        if (l.area_sqm) {
          metrics.push({ icon: Square, label: `${l.area_sqm} m²` });
        }
        if (metrics.length === 0) {
          metrics.push({ icon: Tag, label: propertyTypeLabels[l.property_type] || l.property_type });
        }

        return {
          image: l.cover_image_url || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
          title: l.title,
          type: typeLabel,
          price: priceLabel,
          location: l.district ? `${l.neighborhood ? l.neighborhood + ", " : ""}${l.district}` : "Gölbaşı, Ankara",
          metrics: metrics,
        };
      })
    : fallbackListings;

  return (
    <section className="bg-navy py-24 border-b border-gold/10 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
              Kazançlı Yatırımlar
            </span>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-cream mt-2">
              Gayrimenkul Portföyümüz
            </h2>
            <div className="w-16 h-1 bg-gold mt-4 rounded-full" />
          </div>
          <button className="flex items-center space-x-2 text-xs font-bold text-gold hover:text-gold-light mt-6 md:mt-0 transition-colors uppercase tracking-wider group">
            <span>Tüm İlanları Gör</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3'lü Emlak Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="group bg-navy-dark border border-gold/15 hover:border-gold rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full"
            >
              {/* Image & Price Overlay */}
              <div className="relative h-64 bg-navy overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-750 group-hover:scale-110"
                  unoptimized={item.image.startsWith("http")}
                />
                
                {/* Type Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="text-[9px] font-bold uppercase px-3 py-1.5 bg-navy-dark/90 text-gold border border-gold/35 rounded-full shadow-md">
                    {item.type}
                  </span>
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-4 right-4 z-20">
                  <span className="text-xs font-bold bg-gold text-navy-dark px-4 py-2 rounded-lg shadow-lg">
                    {item.price}
                  </span>
                </div>

                {/* Dark Gradient bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/70 via-transparent to-transparent opacity-85" />
              </div>

              {/* Info Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-playfair font-bold text-cream text-lg mb-4 group-hover:text-gold transition-colors line-clamp-2 min-h-12 leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-xs text-cream/60 mb-6">
                    <MapPin className="w-4 h-4 text-gold" />
                    <span>{item.location}</span>
                  </div>
                </div>

                {/* Metrics Footer */}
                <div className="flex justify-between items-center text-xs text-cream/70 border-t border-gold/10 pt-4">
                  <div className="flex items-center space-x-4">
                    {item.metrics.map((metric, mIdx) => {
                      const MIcon = metric.icon;
                      return (
                        <div key={mIdx} className="flex items-center space-x-1.5">
                          <MIcon className="w-4 h-4 text-gold/80" />
                          <span>{metric.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button className="text-[10px] uppercase font-bold text-gold group-hover:text-gold-light transition-colors flex items-center space-x-1">
                    <span>İncele</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
