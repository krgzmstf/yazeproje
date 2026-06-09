"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, MapPin, Eye } from "lucide-react";
import { ArchitectureProject } from "@/lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

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

interface FeaturedProjectsProps {
  projects?: ArchitectureProject[];
}

export default function FeaturedProjects({
  projects: apiProjects,
}: FeaturedProjectsProps) {
  const fallbackProjects = [
    {
      slug: "#",
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      title: "Mogan Göksu Villaları",
      category: "Villa / Yaşam Alanı",
      location: "Mogan, Gölbaşı",
      status: "Tamamlandı",
      area: "420 m²",
    },
    {
      slug: "#",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      title: "Yaze Smart Tower",
      category: "Ticari / Ofis",
      location: "Bahçelievler Mah., Gölbaşı",
      status: "Devam Ediyor",
      area: "12,500 m²",
    },
    {
      slug: "#",
      image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      title: "Eymir Green Residence",
      category: "Konut / Sürdürülebilir",
      location: "Eymir, Gölbaşı",
      status: "Proje Aşaması",
      area: "8,200 m²",
    },
  ];

  const items =
    apiProjects && apiProjects.length > 0
      ? apiProjects.map((p) => ({
          slug: p.slug,
          image:
            p.cover_image_url ||
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          title: p.title,
          category: categoryLabels[p.category] || p.category,
          location: p.location || "Gölbaşı, Ankara",
          status: statusLabels[p.status] || p.status,
          area: p.area_sqm ? `${p.area_sqm.toLocaleString("tr-TR")} m²` : "",
        }))
      : fallbackProjects;

  return (
    <section className="bg-cream py-24 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold-dark">
              Vizyoner Mimari
            </span>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-navy-dark mt-2">
              Öne Çıkan Projelerimiz
            </h2>
            <div className="w-16 h-1 bg-gold mt-4 rounded-full" />
          </div>
          <Link
            href="/projects"
            className="flex items-center space-x-2 text-xs font-bold text-navy-dark hover:text-gold-dark mt-6 md:mt-0 transition-colors uppercase tracking-wider group"
          >
            <span>Tüm Projeleri İncele</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3'lü Proje Kart Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {items.map((project, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Link
                href={
                  project.slug === "#"
                    ? "/projects"
                    : `/projects/${project.slug}`
                }
                className="group bg-white rounded-xl shadow-xl border border-navy/5 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full text-navy-dark"
              >
                {/* Image & Overlay */}
                <div className="relative h-64 overflow-hidden bg-navy-dark">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized={project.image.startsWith("http")}
                  />

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span
                      className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full text-white shadow-md ${
                        project.status === "Tamamlandı"
                          ? "bg-success"
                          : project.status === "Devam Ediyor"
                            ? "bg-warning text-navy-dark"
                            : "bg-navy"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  {/* Hover Eye Overlay */}
                  <div className="absolute inset-0 bg-navy-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                    <div className="p-3.5 bg-gold rounded-full text-navy-dark shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gold-dark uppercase tracking-widest block mb-1">
                      {project.category}
                    </span>
                    <h3 className="font-playfair font-bold text-navy-dark text-xl mb-4 group-hover:text-gold-dark transition-colors">
                      {project.title}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center text-xs text-navy-dark/70 border-t border-navy/5 pt-4 mt-2">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-gold-dark" />
                      <span>{project.location}</span>
                    </div>
                    <span className="font-semibold text-navy-dark">
                      {project.area}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
