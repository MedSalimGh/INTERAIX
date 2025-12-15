"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = (
  animationType: "fade-up" | "fade-in" | "scale-up" = "fade-up",
  delay: number = 0
) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Initial state
    gsap.set(element, {
      opacity: 0,
      y: animationType === "fade-up" ? 50 : 0,
      scale: animationType === "scale-up" ? 0.9 : 1,
    });

    // Animation
    gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        start: "top 85%", // Start animation when top of element hits 85% of viewport height
        toggleActions: "play none none reverse", // Play on enter, reverse on leave back up
      },
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      delay: delay,
      ease: "power3.out",
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [animationType, delay]);

  return elementRef;
};
