import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Eye, Filter } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { getProjects, ProjectCategory, ArchitectureProject, getSiteSettings } from "@/lib/api";

const categoryLabels: Record<string, string> = {
  all: "Tüm Projeler",
  residential: "Konut / Yaşam",
  commercial: "Ticari / Ofis",
  industrial: "Endüstriyel",
  infrastructure: "Altyapı / Kamusal",
  renovation: "Restorasyon",
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

const sidebarLinks = [
  {
    title: "İnşaat Ruhsatı Nasıl Alınır?",
    desc: "Adım adım ruhsat alma süreci ve gerekli belgeler rehberi.",
    icon: "FileText",
    href: "/contact?subject=mimarlik"
  },
  {
    title: "Yapı Denetim Harç Hesaplama",
    desc: "Yapı denetim hizmet bedellerini online hesaplayın.",
    icon: "Calculator",
    href: "/contact?subject=mimarlik"
  },
  {
    title: "Tip İmar Yönetmeliği",
    desc: "Planlı Alanlar İmar Yönetmeliği güncel mevzuat dokümanı.",
    icon: "BookOpen",
    href: "/contact?subject=mimarlik"
  },
  {
    title: "Büyükşehir İmar Yönetmeliği",
    desc: "Ankara Büyükşehir Belediyesi İmar Yönetmeliği maddeleri.",
    icon: "Layers",
    href: "/contact?subject=mimarlik"
  },
  {
    title: "Kot Kesit Belgesi Başvurusu",
    desc: "Kot kesit ve vaziyet planı başvuru süreci detayları.",
    icon: "HelpCircle",
    href: "/contact?subject=mimarlik"
  },
  {
    title: "Aplikasyon Krokisi Temini",
    desc: "Lisanslı Harita Kadastro Mühendislik Büroları (LIHKAB) işlemleri.",
    icon: "HelpCircle",
    href: "/contact?subject=mimarlik"
  },
  {
    title: "Yapı Kullanma İzin Belgesi",
    desc: "İskan ruhsatı başvuru koşulları ve onay aşamaları.",
    icon: "HelpCircle",
    href: "/contact?subject=mimarlik"
  },
  {
    title: "Sürdürülebilir Yapı Kriterleri",
    desc: "Yeşil bina sertifikasyon süreçleri ve enerji kimliği.",
    icon: "HelpCircle",
    href: "/contact?subject=mimarlik"
  },
  {
    title: "Şantiye Şefliği Yükümlülükleri",
    desc: "Yönetmeliklere göre şantiye şefliği yasal sorumlulukları.",
    icon: "HelpCircle",
    href: "/contact?subject=mimarlik"
  },
  {
    title: "Zemin Etüdü ve Raporlama",
    desc: "Geoteknik zemin etüdü raporu hazırlama adımları.",
    icon: "HelpCircle",
    href: "/contact?subject=mimarlik"
  }
];

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentCategory = (resolvedParams.category as ProjectCategory) || undefined;

  let projects: ArchitectureProject[] = [];
  let errorMsg = "";
  let settings: Record<string, any> = {};

  try {
    projects = await getProjects({
      category: currentCategory,
    });
  } catch (error) {
    console.error("Failed to fetch projects on server side:", error);
    errorMsg = "Projeler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.";
  }

  try {
    settings = await getSiteSettings();
  } catch (error) {
    console.error("Failed to fetch settings on server side:", error);
  }

  // Active category list for rendering filter buttons
  const categories = Object.keys(categoryLabels) as (keyof typeof categoryLabels)[];

  return (
    <div className="bg-navy min-h-screen text-cream select-none pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            Portfolyomuz
          </span>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold text-cream mt-3">
            Mimari Projelerimiz
          </h1>
          <div className="w-16 h-1 bg-gold mx-auto mt-5 rounded-full" />
          <p className="text-sm text-cream/70 mt-4 leading-relaxed font-light">
            Gölbaşı ve çevresinde hayata geçirdiğimiz lüks, konforlu ve sürdürülebilir mimari çizgileri keşfedin.
          </p>
        </div>

        {/* Filters Grid */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center space-x-2 text-gold/80 text-xs uppercase tracking-wider mb-4">
            <Filter className="w-3.5 h-3.5" />
            <span>Kategoriler</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
            {categories.map((cat) => {
              const isActive = cat === "all" ? !currentCategory : currentCategory === cat;
              const href = cat === "all" ? "/projects" : `/projects?category=${cat}`;
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`text-xs px-4 py-2 rounded-full border transition-all duration-300 ${
                    isActive
                      ? "bg-gold border-gold text-navy-dark font-bold shadow-md shadow-gold/20"
                      : "bg-navy-dark border-gold/20 text-cream/80 hover:border-gold hover:text-gold"
                  }`}
                >
                  {categoryLabels[cat]}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Layout split: Left projects grid, Right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Projects Area (9/12) */}
          <div className="lg:col-span-9 space-y-8">
            {errorMsg && (
              <div className="text-center py-12 bg-navy-dark border border-gold/15 rounded-xl max-w-xl mx-auto">
                <p className="text-sm text-gold">{errorMsg}</p>
              </div>
            )}

            {!errorMsg && projects.length === 0 && (
              <div className="text-center py-20 bg-navy-dark border border-gold/15 rounded-xl max-w-xl mx-auto">
                <p className="text-sm text-cream/60">Bu kategoride henüz yayınlanmış bir proje bulunmamaktadır.</p>
              </div>
            )}

            {!errorMsg && projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                {projects.map((project) => {
                  const statusText = statusLabels[project.status] || project.status;
                  const categoryText = categoryLabels[project.category] || project.category;
                  
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="group bg-navy-dark border border-gold/15 hover:border-gold rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/5 flex flex-col h-full"
                    >
                      {/* Image wrapper */}
                      <div className="relative h-48 overflow-hidden bg-navy">
                        <Image
                          src={project.cover_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          unoptimized={true}
                        />

                        {/* Status Badge */}
                        <div className="absolute top-4 left-4 z-20">
                          <span className={`text-[9px] font-bold uppercase px-3 py-1.5 rounded-full text-white shadow-md ${
                            project.status === "completed"
                              ? "bg-success"
                              : project.status === "in_progress"
                              ? "bg-warning text-navy-dark"
                              : "bg-navy"
                          }`}>
                            {statusText}
                          </span>
                        </div>

                        {/* Hover eye icon */}
                        <div className="absolute inset-0 bg-navy-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                          <div className="p-3.5 bg-gold rounded-full text-navy-dark shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Eye className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Card description */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-gold uppercase tracking-widest block mb-1">
                            {categoryText}
                          </span>
                          <h3 className="font-playfair font-bold text-cream text-lg mb-2 group-hover:text-gold transition-colors duration-300 line-clamp-1">
                            {project.title}
                          </h3>
                          {project.description && (
                            <p className="text-xs text-cream/70 leading-relaxed font-light line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-cream/60 border-t border-gold/10 pt-4 mt-4">
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gold" />
                            <span className="truncate max-w-[120px]">{project.location || "Gölbaşı, Ankara"}</span>
                          </div>
                          {project.area_sqm && (
                            <span className="font-semibold text-gold">
                              {project.area_sqm.toLocaleString("tr-TR")} m²
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar (3/12) */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="border-b border-gold/15 pb-3 mb-2 flex items-center space-x-2">
              <div className="w-1.5 h-6 bg-gold rounded-full" />
              <h3 className="font-playfair font-bold text-cream text-lg">Hızlı Bilgi Havuzu</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              {(settings.quick_info_pool && settings.quick_info_pool.length > 0
                ? settings.quick_info_pool
                : sidebarLinks
              ).map((item: any, idx: number) => {
                const IconName = item.icon || "HelpCircle";
                const Icon = (LucideIcons as any)[IconName] || LucideIcons.HelpCircle;
                return (
                  <Link
                    key={idx}
                    href={item.href || "#"}
                    className="group flex items-start space-x-3 bg-navy-dark hover:bg-navy border border-gold/10 hover:border-gold p-4 rounded-xl transition-all duration-300 shadow-md hover:-translate-y-0.5"
                  >
                    <div className="p-2 bg-gold/10 group-hover:bg-gold text-gold group-hover:text-navy-dark rounded-lg transition-colors shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-playfair font-semibold text-xs text-cream group-hover:text-gold transition-colors leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-cream/50 leading-relaxed font-light">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>

        </div>

      </div>
    </div>
  );
}
