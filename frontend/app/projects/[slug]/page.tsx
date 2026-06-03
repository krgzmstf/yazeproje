import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Layers,
  Maximize,
  Briefcase,
  User,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { getProjectBySlug, ProjectCategory, PhaseStatus } from "@/lib/api";

const categoryLabels: Record<string, string> = {
  residential: "Konut / Yaşam Alanı",
  commercial: "Ticari / Ofis",
  industrial: "Endüstriyel",
  infrastructure: "Altyapı / Kamusal",
  renovation: "Renovasyon",
  urban_planning: "Kentsel Tasarım",
  interior_design: "İç Mimari",
  landscape: "Peyzaj Tasarımı",
};

const statusLabels: Record<string, string> = {
  draft: "Proje Aşaması",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  on_hold: "Beklemede",
  cancelled: "İptal Edildi",
};

const phaseStatusLabels: Record<PhaseStatus, string> = {
  not_started: "Başlamadı",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  delayed: "Gecikmeli",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let project;
  try {
    project = await getProjectBySlug(slug);
  } catch (error) {
    console.error(`Error loading project ${slug}:`, error);
  }

  if (!project) {
    return (
      <div className="bg-navy min-h-screen text-cream flex flex-col items-center justify-center pt-24 px-4 text-center">
        <h1 className="font-playfair text-3xl font-bold mb-4">Proje Bulunamadı</h1>
        <p className="text-sm text-cream/70 mb-8 max-w-md">
          Ulaşmaya çalıştığınız mimari proje yayından kaldırılmış veya silinmiş olabilir.
        </p>
        <Link href="/projects" className="btn bg-gold text-navy-dark px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all hover:scale-105">
          Tüm Projelere Dön
        </Link>
      </div>
    );
  }

  // Parse gallery URLs
  const gallery = project.gallery_urls?.images || [];

  return (
    <div className="bg-navy min-h-screen text-cream pb-24">
      {/* Cover Hero Banner */}
      <div className="relative h-[55vh] md:h-[65vh] w-full bg-navy-dark">
        <Image
          src={project.cover_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"}
          alt={project.title}
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
              href="/projects"
              className="flex items-center space-x-2 text-xs font-bold text-gold hover:text-gold-light mb-6 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Portfolyoya Dön</span>
            </Link>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold px-3.5 py-1.5 bg-navy-dark/80 rounded-full border border-gold/15 mb-4 shadow-lg">
              {categoryLabels[project.category] || project.category}
            </span>
            <h1 className="font-playfair text-3xl md:text-5xl lg:text-6xl font-bold text-cream leading-tight">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-4 text-xs md:text-sm text-cream/80">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-gold" />
                <span>{project.location || "Gölbaşı, Ankara"}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
              <div className="flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-gold" />
                <span>{statusLabels[project.status] || project.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Description & Phases */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Description */}
            <div className="bg-navy-dark border border-gold/15 rounded-xl p-6 md:p-8 shadow-xl">
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-gold mb-6 border-b border-gold/10 pb-3">
                Proje Hakkında
              </h2>
              <p className="text-sm md:text-base text-cream/85 leading-relaxed font-light whitespace-pre-line">
                {project.description || "Bu proje için henüz detaylı açıklama girilmemiştir."}
              </p>
            </div>

            {/* Project Phases */}
            {project.phases && project.phases.length > 0 && (
              <div className="bg-navy-dark border border-gold/15 rounded-xl p-6 md:p-8 shadow-xl">
                <h2 className="font-playfair text-xl md:text-2xl font-bold text-gold mb-8 border-b border-gold/10 pb-3">
                  Proje Gelişim Aşamaları
                </h2>
                <div className="relative border-l border-gold/20 pl-6 md:pl-8 space-y-8">
                  {project.phases
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((phase) => {
                      const phaseStatusText = phaseStatusLabels[phase.status] || phase.status;
                      const isCompleted = phase.status === "completed";
                      return (
                        <div key={phase.id} className="relative group">
                          {/* Timeline node icon */}
                          <div className={`absolute -left-[35px] md:-left-[43px] top-0.5 w-6 h-6 rounded-full border-2 bg-navy-dark flex items-center justify-center transition-all ${
                            isCompleted ? "border-success text-success" : "border-gold text-gold"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                            )}
                          </div>

                          {/* Phase card */}
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <h3 className="font-playfair font-bold text-cream text-base md:text-lg">
                                {phase.name}
                              </h3>
                              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                                isCompleted
                                  ? "bg-success/20 text-success border border-success/30"
                                  : phase.status === "in_progress"
                                  ? "bg-warning/20 text-warning border border-warning/30"
                                  : "bg-cream/10 text-cream/70 border border-cream/10"
                              }`}>
                                {phaseStatusText} (%{phase.progress_pct})
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-navy rounded-full overflow-hidden mb-3">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isCompleted ? "bg-success" : "bg-gold"
                                }`}
                                style={{ width: `${phase.progress_pct}%` }}
                              />
                            </div>

                            {phase.description && (
                              <p className="text-xs md:text-sm text-cream/70 font-light leading-relaxed mb-2">
                                {phase.description}
                              </p>
                            )}

                            {(phase.start_date || phase.end_date) && (
                              <div className="flex items-center space-x-1.5 text-[10px] text-gold/60 font-semibold uppercase tracking-wider">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>
                                  {phase.start_date || "Başlangıç Yok"} — {phase.end_date || "Bitiş Yok"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Gallery Grid */}
            {gallery.length > 0 && (
              <div className="bg-navy-dark border border-gold/15 rounded-xl p-6 md:p-8 shadow-xl">
                <h2 className="font-playfair text-xl md:text-2xl font-bold text-gold mb-6 border-b border-gold/10 pb-3">
                  Galeri & Render Görselleri
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gallery.map((imgUrl, idx) => (
                    <div key={idx} className="relative h-60 md:h-72 rounded-lg overflow-hidden group/img border border-gold/10">
                      <Image
                        src={imgUrl}
                        alt={`Galeri resmi ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                        unoptimized={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Key Details Grid */}
          <div className="space-y-6">
            
            {/* Project Summary Card */}
            <div className="bg-navy-dark border border-gold/15 rounded-xl p-6 md:p-8 shadow-xl sticky top-24">
              <h2 className="font-playfair text-lg md:text-xl font-bold text-gold mb-6 border-b border-gold/10 pb-3">
                Proje Künyesi
              </h2>
              
              <div className="divide-y divide-gold/10 text-xs md:text-sm">
                
                {/* Client */}
                {project.client_name && (
                  <div className="py-3.5 flex justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 text-cream/70">
                      <User className="w-4 h-4 text-gold" />
                      <span>İşveren</span>
                    </div>
                    <span className="font-semibold text-cream text-right">{project.client_name}</span>
                  </div>
                )}

                {/* Location */}
                <div className="py-3.5 flex justify-between items-center gap-4">
                  <div className="flex items-center space-x-2 text-cream/70">
                    <MapPin className="w-4 h-4 text-gold" />
                    <span>Konum</span>
                  </div>
                  <span className="font-semibold text-cream text-right">{project.location || "Gölbaşı, Ankara"}</span>
                </div>

                {/* Area */}
                {project.area_sqm && (
                  <div className="py-3.5 flex justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 text-cream/70">
                      <Maximize className="w-4 h-4 text-gold" />
                      <span>Proje Alanı</span>
                    </div>
                    <span className="font-semibold text-gold text-right">{project.area_sqm.toLocaleString("tr-TR")} m²</span>
                  </div>
                )}

                {/* Start Date */}
                {project.start_date && (
                  <div className="py-3.5 flex justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 text-cream/70">
                      <Calendar className="w-4 h-4 text-gold" />
                      <span>Başlangıç</span>
                    </div>
                    <span className="font-semibold text-cream text-right">{project.start_date}</span>
                  </div>
                )}

                {/* End Date */}
                {project.end_date && (
                  <div className="py-3.5 flex justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 text-cream/70">
                      <Calendar className="w-4 h-4 text-gold" />
                      <span>Tamamlanma</span>
                    </div>
                    <span className="font-semibold text-cream text-right">{project.end_date}</span>
                  </div>
                )}

                {/* Category */}
                <div className="py-3.5 flex justify-between items-center gap-4">
                  <div className="flex items-center space-x-2 text-cream/70">
                    <Briefcase className="w-4 h-4 text-gold" />
                    <span>Kategori</span>
                  </div>
                  <span className="font-semibold text-cream text-right">
                    {categoryLabels[project.category] || project.category}
                  </span>
                </div>

                {/* Status */}
                <div className="py-3.5 flex justify-between items-center gap-4">
                  <div className="flex items-center space-x-2 text-cream/70">
                    <Layers className="w-4 h-4 text-gold" />
                    <span>Durum</span>
                  </div>
                  <span className="font-semibold text-cream text-right">
                    {statusLabels[project.status] || project.status}
                  </span>
                </div>

              </div>

              {/* Quick Contact Call to Action */}
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="w-full flex justify-center items-center py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark font-bold text-xs uppercase tracking-wider rounded-md shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  Teklif Talebinde Bulun
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
