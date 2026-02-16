"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Galaxy = dynamic(() => import("./galaxy"), { ssr: false });

export default function GalaxyBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none">
      {visible && (
        <Galaxy
          hueShift={200}
          speed={0.5}
          density={0.6}
          saturation={0.3}
          glowIntensity={0.3}
          twinkleIntensity={0.3}
          rotationSpeed={0.03}
          mouseRepulsion={true}
          repulsionStrength={2}
          transparent={true}
        />
      )}
    </div>
  );
}
