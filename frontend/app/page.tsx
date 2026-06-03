import React from "react";
import Hero from "@/components/sections/Hero";
import QuickMenuGrid from "@/components/sections/QuickMenuGrid";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import EventsSection from "@/components/sections/EventsSection";

import {
  getProjects,
  getAnnouncements,
  getEvents,
  getSiteSettings,
  ArchitectureProject,
  Announcement,
  Event as ApiEvent,
} from "@/lib/api";

export default async function Home() {
  // Parallel asynchronous fetching on the server side
  let projects: ArchitectureProject[] = [];
  let announcements: Announcement[] = [];
  let events: ApiEvent[] = [];
  let settings: Record<string, any> = {};

  try {
    const results = await Promise.allSettled([
      getProjects({ is_featured: true, limit: 6 }),
      getAnnouncements({ limit: 6 }),
      getEvents({ limit: 3 }),
      getSiteSettings(),
    ]);

    projects = results[0].status === "fulfilled" ? results[0].value : [];
    announcements = results[1].status === "fulfilled" ? results[1].value : [];
    events = results[2].status === "fulfilled" ? results[2].value : [];
    settings = results[3].status === "fulfilled" ? (results[3].value as Record<string, any>) : {};
  } catch (error) {
    console.error("Error during server-side data fetching:", error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero projects={projects} settings={settings} />

      {/* 3'lü Hızlı Menü Grid */}
      <QuickMenuGrid settings={settings} />

      {/* Öne Çıkan Projeler (Featured Projects) */}
      <FeaturedProjects projects={projects} />

      {/* Etkinlikler Bölümü */}
      <EventsSection events={events} />
    </div>
  );
}

