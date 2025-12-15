"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useGSAPAnimations = () => {
  useGSAP(() => {
    // Fade in elements with .animate-fade-in class
    gsap.utils.toArray(".animate-fade-in").forEach((element: any) => {
      gsap.fromTo(
        element,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
          },
        }
      );
    });

    // Stagger children for containers with .animate-stagger class
    gsap.utils.toArray(".animate-stagger").forEach((container: any) => {
      gsap.fromTo(
        container.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
          },
        }
      );
    });
  }, []);
};
