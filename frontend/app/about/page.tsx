import React from "react";
import About from "@/components/sections/About";
import { getSiteSettings } from "@/lib/api";

export const metadata = {
  title: "Kurumsal | YAZE Proje",
  description: "YazeProje Kurumsal, Misyonumuz, Vizyonumuz ve Kalite Politikamız.",
};

export default async function AboutPage() {
  let settings = {};
  try {
    settings = await getSiteSettings();
  } catch (error) {
    console.error("Error fetching site settings for about page:", error);
  }

  return (
    <main className="pt-20 bg-navy-dark min-h-screen">
      <About settings={settings} />
    </main>
  );
}
