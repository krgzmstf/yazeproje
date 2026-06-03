import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Maximize,
  Tag,
  Square,
  Home,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import { getListingBySlug, PropertyType, ListingType } from "@/lib/api";

const propertyTypeLabels: Record<string, string> = {
  apartment: "Konut / Daire",
  villa: "Villa",
  land: "Arsa / Arazi",
  office: "Ofis / İşyeri",
  shop: "Dükkan / Mağaza",
  warehouse: "Depo",
  other: "Gayrimenkul",
};

const listingTypeLabels: Record<string, string> = {
  sale: "Satılık",
  rent: "Kiralık",
  daily_rent: "Günlük Kiralık",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let listing;
  try {
    listing = await getListingBySlug(slug);
  } catch (error) {
    console.error(`Error loading listing ${slug}:`, error);
  }

  if (!listing) {
    return (
      <div className="bg-navy min-h-screen text-cream flex flex-col items-center justify-center pt-24 px-4 text-center">
        <h1 className="font-playfair text-3xl font-bold mb-4">İlan Bulunamadı</h1>
        <p className="text-sm text-cream/70 mb-8 max-w-md">
          Ulaşmaya çalıştığınız gayrimenkul ilanı satılmış/kiralanmış veya kaldırılmış olabilir.
        </p>
        <Link href="/listings" className="btn bg-gold text-navy-dark px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all hover:scale-105">
          Tüm İlanlara Dön
        </Link>
      </div>
    );
  }

  // Parse gallery
  const gallery = listing.gallery_urls?.images || [];
  
  // Format price
  const priceText = listing.price
    ? `${listing.price.toLocaleString("tr-TR")} ${listing.currency === "TRY" ? "TL" : listing.currency}${listing.listing_type === "rent" ? " / Ay" : ""}`
    : "Fiyat Sorunuz";

  const typeLabel = `${listingTypeLabels[listing.listing_type] || listing.listing_type} ${propertyTypeLabels[listing.property_type] || listing.property_type}`;

  // WhatsApp click link
  const cleanPhone = (listing.contact_phone || "05321760432").replace(/\s+/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("+") ? cleanPhone : "+90" + cleanPhone.replace(/^0/, "")}?text=${encodeURIComponent(
    `Merhaba, yazeproje.com üzerindeki "${listing.title}" ilanınız hakkında detaylı bilgi almak istiyorum.`
  )}`;

  return (
    <div className="bg-navy min-h-screen text-cream pb-24">
      {/* Cover Hero Banner */}
      <div className="relative h-[50vh] md:h-[60vh] w-full bg-navy-dark">
        <Image
          src={listing.cover_image_url || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"}
          alt={listing.title}
          fill
          priority
          className="object-cover opacity-50"
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-transparent" />
        
        {/* Banner Content */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
          <div className="max-w-7xl mx-auto flex flex-col items-start">
            <Link
              href="/listings"
              className="flex items-center space-x-2 text-xs font-bold text-gold hover:text-gold-light mb-6 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>İlan Vitrinine Dön</span>
            </Link>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold px-3.5 py-1.5 bg-navy-dark/80 rounded-full border border-gold/15 mb-4 shadow-lg">
              {typeLabel}
            </span>
            <h1 className="font-playfair text-2xl md:text-4xl lg:text-5xl font-bold text-cream leading-tight max-w-4xl">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs md:text-sm text-cream/80">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-gold" />
                <span>
                  {listing.city ? `${listing.neighborhood ? listing.neighborhood + " Mh., " : ""}${listing.district} / ${listing.city}` : "Gölbaşı, Ankara"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Description, Features & Gallery */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Description */}
            <div className="bg-navy-dark border border-gold/15 rounded-xl p-6 md:p-8 shadow-xl">
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-gold mb-6 border-b border-gold/10 pb-3">
                Açıklama
              </h2>
              <p className="text-sm md:text-base text-cream/85 leading-relaxed font-light whitespace-pre-line">
                {listing.description || "Bu ilan için henüz açıklama metni eklenmemiştir."}
              </p>
            </div>

            {/* Features (if exist) */}
            {listing.features && Object.keys(listing.features).length > 0 && (
              <div className="bg-navy-dark border border-gold/15 rounded-xl p-6 md:p-8 shadow-xl">
                <h2 className="font-playfair text-xl md:text-2xl font-bold text-gold mb-6 border-b border-gold/10 pb-3">
                  Özellikler
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(listing.features).map(([feat, enabled]) => (
                    <div key={feat} className="flex items-center space-x-2.5 text-xs md:text-sm">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${enabled ? "text-success" : "text-cream/30"}`} />
                      <span className={enabled ? "text-cream" : "text-cream/50 line-through"}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <div className="bg-navy-dark border border-gold/15 rounded-xl p-6 md:p-8 shadow-xl">
                <h2 className="font-playfair text-xl md:text-2xl font-bold text-gold mb-6 border-b border-gold/10 pb-3">
                  İlan Fotoğrafları
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gallery.map((imgUrl, idx) => (
                    <div key={idx} className="relative h-60 md:h-72 rounded-lg overflow-hidden group border border-gold/10">
                      <Image
                        src={imgUrl}
                        alt={`Galeri resmi ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Information summary & Contact */}
          <div className="space-y-6">
            
            {/* Price & Summary Summary Card */}
            <div className="bg-navy-dark border border-gold/15 rounded-xl p-6 md:p-8 shadow-xl sticky top-24 space-y-8">
              
              {/* Price Details */}
              <div>
                <span className="text-[10px] uppercase font-bold text-cream/50 tracking-wider block mb-1">
                  Fiyat
                </span>
                <span className="text-2xl md:text-3xl font-bold text-gold font-playfair">
                  {priceText}
                </span>
              </div>

              {/* Specs Grid */}
              <div className="divide-y divide-gold/10 text-xs md:text-sm border-t border-b border-gold/10 py-2">
                
                {/* Area */}
                {listing.area_sqm && (
                  <div className="py-3 flex justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 text-cream/70">
                      <Square className="w-4 h-4 text-gold" />
                      <span>Metrekare</span>
                    </div>
                    <span className="font-semibold text-cream">{listing.area_sqm} m²</span>
                  </div>
                )}

                {/* Rooms */}
                {listing.room_count && (
                  <div className="py-3 flex justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 text-cream/70">
                      <Home className="w-4 h-4 text-gold" />
                      <span>Oda Sayısı</span>
                    </div>
                    <span className="font-semibold text-cream">{listing.room_count}</span>
                  </div>
                )}

                {/* Floor */}
                {listing.floor_number !== null && (
                  <div className="py-3 flex justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 text-cream/70">
                      <Tag className="w-4 h-4 text-gold" />
                      <span>Bulunduğu Kat</span>
                    </div>
                    <span className="font-semibold text-cream">
                      {listing.floor_number === 0 ? "Giriş Kat" : `${listing.floor_number}. Kat`}
                    </span>
                  </div>
                )}

                {/* Building Age */}
                {listing.building_age !== null && (
                  <div className="py-3 flex justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 text-cream/70">
                      <Clock className="w-4 h-4 text-gold" />
                      <span>Bina Yaşı</span>
                    </div>
                    <span className="font-semibold text-cream">{listing.building_age === 0 ? "Sıfır" : `${listing.building_age} Yıl`}</span>
                  </div>
                )}

                {/* Heating */}
                {listing.heating_type && (
                  <div className="py-3 flex justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 text-cream/70">
                      <Home className="w-4 h-4 text-gold" />
                      <span>Isınma</span>
                    </div>
                    <span className="font-semibold text-cream">{listing.heating_type}</span>
                  </div>
                )}

              </div>

              {/* Contact Card */}
              <div className="bg-navy/50 border border-gold/10 p-5 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-cream/50 tracking-wider block mb-2">
                  İlan Yetkilisi
                </span>
                <span className="font-playfair font-bold text-cream text-base block mb-4">
                  {listing.contact_name || "Yusuf Aziz Erdoğan"}
                </span>

                <div className="space-y-3">
                  {/* Phone call */}
                  <a
                    href={`tel:${listing.contact_phone || "05321760432"}`}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-navy hover:bg-navy-light text-cream font-bold text-xs uppercase tracking-wider rounded-md border border-gold/20 shadow-md transition-all"
                  >
                    <Phone className="w-4 h-4 text-gold" />
                    <span>Ara: {listing.contact_phone || "0532 176 0432"}</span>
                  </a>

                  {/* WhatsApp message */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-whatsapp hover:bg-green-600 text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-md transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-whatsapp" />
                    <span>WhatsApp Mesajı</span>
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
