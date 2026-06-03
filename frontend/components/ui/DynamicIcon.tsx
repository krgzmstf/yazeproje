"use client";

import React from "react";
import * as Icons from "lucide-react";

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function DynamicIcon({ name, className, size }: DynamicIconProps) {
  // Resolve icon component dynamically from name
  const IconComponent = (Icons as any)[name];

  if (!IconComponent) {
    // Return a default fallback icon (HelpCircle) if not found
    const Fallback = Icons.HelpCircle;
    return <Fallback className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
}
