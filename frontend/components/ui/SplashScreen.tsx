"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy-dark"
        >
          <div className="relative flex flex-col items-center">
            {/* Animated Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
              }}
              className="relative w-32 h-32 md:w-40 md:h-40 mb-8"
            >
              {/* Outer Glow Ring */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-gold/20 blur-2xl"
              />
              
              {/* Logo Frame */}
              <div className="relative w-full h-full rounded-2xl border-2 border-gold/50 overflow-hidden bg-navy shadow-2xl shadow-gold/20">
                <img
                  src="/images/logo.jpg"
                  alt="YAZE PROJE Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Text Animations */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center"
            >
              <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gold tracking-widest mb-2">
                YAZE PROJE
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "40px" }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="h-[1px] bg-gold/50"
                />
                <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-gold-light/70 font-medium">
                  Mimarlık & Mühendislik
                </span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "40px" }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="h-[1px] bg-gold/50"
                />
              </div>
            </motion.div>

            {/* Loading Line */}
            <div className="absolute bottom-[-60px] w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-gold to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
